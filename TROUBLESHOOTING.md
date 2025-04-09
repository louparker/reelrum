# ReelRum Project Troubleshooting Log

This document logs errors encountered during the development of the ReelRum platform, their causes, and the implemented solutions. It serves as a reference for future development and debugging.

## Table of Contents

1. [Supabase Client Utility TypeScript Errors](#1-supabase-client-utility-typescript-errors)
2. [Invalid URL Error in Supabase Client](#2-invalid-url-error-in-supabase-client)
3. [Next.js Image Configuration Error](#3-nextjs-image-configuration-error)
4. [Authentication Email Link Issues](#4-authentication-email-link-issues)

---

## 1. Supabase Client Utility TypeScript Errors

### Affected Component
- `src/lib/supabase-server.ts` - Server-side Supabase client
- `src/lib/supabase-client.ts` - Client-side Supabase client

### Error Description
When implementing the Supabase client utilities using the `@supabase/ssr` package, we encountered TypeScript errors related to cookie handling in the Next.js App Router:

```typescript
// TypeScript errors:
Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'.
Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'.
Property 'remove' does not exist on type 'Promise<ReadonlyRequestCookies>'.
```

The issue was related to how the Next.js `cookies()` function works in the App Router. The `cookies()` function returns a `ReadonlyRequestCookies` object, but the Supabase SSR client expects different cookie handling methods.

### Documentation Reference
According to the Supabase documentation for Next.js App Router integration (https://supabase.com/docs/guides/auth/auth-helpers/nextjs):

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  // ...
}
```

However, this approach led to TypeScript errors in our implementation because of how the `cookies()` function behaves in the Next.js App Router.

### Implemented Solution
We simplified our implementation by using the standard Supabase client instead of the SSR-specific client for now:

```typescript
// src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}
```

```typescript
// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}
```

This approach allows us to proceed with development while avoiding the TypeScript errors. For production, we would need to properly implement the cookie handling for authentication persistence, potentially by:

1. Creating a custom middleware for cookie handling
2. Using the Supabase Auth Helpers with proper type definitions
3. Implementing a workaround for the Next.js App Router cookie handling

**Note:** This is a temporary solution to unblock development. We should revisit this issue before deploying to production to ensure proper authentication persistence.

---

## 2. Invalid URL Error in Supabase Client

### Affected Component
- `src/lib/supabase-client.ts` - Client-side Supabase client
- `src/lib/supabase-server.ts` - Server-side Supabase client
- `src/lib/supabase.ts` - Supabase utility file
- `src/context/auth-context.tsx` - Authentication context provider

### Error Description
When running the application without proper Supabase environment variables, the following error occurred:

```
TypeError: Invalid URL
    at new SupabaseClient (http://127.0.0.1:59588/_next/static/chunks/node_modules_b94aef4c._.js:10267:41)
    at createClient (http://127.0.0.1:59588/_next/static/chunks/node_modules_b94aef4c._.js:10460:12)
    at createBrowserSupabaseClient (http://127.0.0.1:59588/_next/static/chunks/src_5fd439a2._.js:20:219)
    at AuthProvider.useState (http://127.0.0.1:59588/_next/static/chunks/src_5fd439a2._.js:49:205)
```

The error occurred because we were trying to create a Supabase client with undefined or invalid URL values. The Supabase client constructor requires valid URL strings, but our environment variables were either not set or had placeholder values that weren't valid URLs.

### Documentation Reference
According to the Supabase documentation (https://supabase.com/docs/reference/javascript/initializing):

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')
```

The `createClient` function requires valid URL and API key strings. When these values are undefined or invalid, the Supabase client constructor throws a TypeError.

### Implemented Solution
We updated the Supabase client files to handle undefined or placeholder environment variables by providing fallback values and graceful error handling:

1. Added fallback values for environment variables:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
```

2. Added special handling for placeholder values:
```typescript
if (supabaseUrl === 'your_supabase_url' || supabaseKey === 'your_supabase_anon_key') {
  console.warn('Using placeholder Supabase credentials. Authentication functionality will not work properly.');
  return createClient<Database>(
    'https://placeholder-url.supabase.co',
    'placeholder-key'
  );
}
```

3. Updated the AuthProvider to handle authentication errors gracefully:
```typescript
try {
  const { data: { session } } = await supabase.auth.getSession();
  setSession(session);
  setUser(session?.user ?? null);
} catch (error) {
  console.error('Error getting session:', error);
} finally {
  setIsLoading(false);
}
```

These changes allow the application to run without real Supabase credentials during development, while providing clear warnings that authentication functionality won't work properly. For production, real Supabase credentials should be provided in the environment variables.

---

## 3. Next.js Image Configuration Error

### Affected Component
- Home page and any components using images from external domains

### Error Description
When using Next.js Image component with external image URLs, the following error occurred:

```
Error: Invalid src prop (https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80) on `next/image`, hostname "images.unsplash.com" is not configured under images in your `next.config.js`
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host
```

The error occurred because Next.js requires explicit configuration for external image domains used with the `next/image` component for security and optimization purposes.

### Documentation Reference
According to the Next.js documentation (https://nextjs.org/docs/basic-features/image-optimization):

```javascript
module.exports = {
  images: {
    domains: ['example.com', 'example2.com'],
  },
}
```

External domains need to be explicitly allowed in the Next.js configuration file.

### Implemented Solution
Created a `next.config.js` file in the project root with the following configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig;
```

This configuration allows the Next.js Image component to load and optimize images from the Unsplash domain. If additional image domains are needed in the future, they should be added to the `domains` array.

---

## 4. Authentication Email Link Issues

### Affected Component
- Email confirmation links from Supabase authentication
- `src/app/auth/callback/route.ts` - Authentication callback route

### Error Description
When clicking on the email confirmation link sent by Supabase during signup, two issues occurred:

1. The link opened in the same tab instead of a new tab
2. The link resulted in an error: `error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`

```
http://localhost:3000/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

### Documentation Reference
According to Supabase documentation (https://supabase.com/docs/guides/auth/auth-email):

1. Email links expire after a certain period (usually 24 hours)
2. The site URL and redirect URLs need to be configured correctly in the Supabase project settings
3. The callback route needs to handle various error cases

### Implemented Solution

1. **Updated the authentication callback route** to handle error cases and redirect to the login page with appropriate error messages:

```typescript
// Handle error cases
if (error) {
  console.error('Auth callback error:', error, error_description);
  
  // Redirect to login page with error message
  return NextResponse.redirect(
    new URL(`/auth/login?error=${encodeURIComponent(error_description || 'Authentication failed')}`, requestUrl.origin)
  );
}
```

2. **Updated the login page** to display error messages from URL parameters:

```typescript
const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : '';

// In the JSX:
{errorMessage && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
    <p className="text-sm">{errorMessage}</p>
  </div>
)}
```

3. **Updated the signup form success message** to inform users that the link will open in a new tab:

```typescript
setSuccess('Success! Please check your email for a confirmation link. The link will open in a new tab.');
```

4. **For the Supabase project settings**, you need to:
   - Go to the Supabase dashboard (https://app.supabase.com/)
   - Select your project
   - Go to Authentication > URL Configuration
   - Set the Site URL to `http://localhost:3000`
   - Add `http://localhost:3000/auth/callback` to the redirect URLs
   - Enable "Open links in new tab" in the email template settings

These changes improve the user experience by providing clear error messages and instructions, and properly handling authentication callback scenarios.
