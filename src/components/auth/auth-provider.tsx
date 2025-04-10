'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { SessionProvider } from 'next-auth/react'

interface AuthContextType {
  user: any
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(status === 'loading')
  const router = useRouter()

  useEffect(() => {
    setIsLoading(status === 'loading')
  }, [status])

  const signUpUser = async (email: string, password: string) => {
    try {
      console.log('Signing up with email:', email)
      
      // First, create the user in Supabase through a custom endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up')
      }
      
      console.log('Signup successful, redirecting to login...')
      
      // Redirect to login page with success message
      router.push(`/auth/login?message=${encodeURIComponent('Account created! Please check your email to verify your account.')}`)
      
      return { success: true }
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { 
        error: true, 
        message: error.message || 'An unexpected error occurred during signup' 
      }
    }
  }

  const signInUser = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      console.log('Sign in result:', result)
      
      if (result?.error) {
        return { 
          error: true, 
          message: result.error 
        }
      }
      
      // Successful login
      router.push('/dashboard')
      router.refresh()
      
      return { success: true }
    } catch (error: any) {
      console.error('Error signing in:', error)
      return { 
        error: true, 
        message: error.message || 'An unexpected error occurred during login' 
      }
    }
  }

  const signOutUser = async () => {
    try {
      console.log('Signing out...')
      await signOut({ redirect: false })
      console.log('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('Resetting password for email:', email)
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }
      
      return { success: true, message: 'Password reset email sent' }
    } catch (error: any) {
      console.error('Error resetting password:', error)
      return { 
        error: true, 
        message: error.message || 'An unexpected error occurred during password reset' 
      }
    }
  }

  const value = {
    user: session?.user,
    isLoading,
    signUp: signUpUser,
    signIn: signInUser,
    signOut: signOutUser,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  )
}
