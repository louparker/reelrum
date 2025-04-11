"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/auth-server"
import { useSession } from "next-auth/react"

export default function PropertyPhotosPage({ params }: { params: { id: string } }) {
  // TODO: In future versions of Next.js, params will be a Promise and should be unwrapped with React.use()
  // For now, we can access params.id directly
  const { id } = params
  
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  
  const [files, setFiles] = useState<(File & { preview?: string })[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create preview URLs for the dropped files
    const filesWithPreviews = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    )
    
    setFiles(prev => [...prev, ...filesWithPreviews])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    onDropRejected: (rejections) => {
      const errors = rejections.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `${rejection.file.name} is too large. Max size is 5MB.`
        }
        return rejection.errors[0].message
      })
      
      toast({
        title: "Upload failed",
        description: errors.join(", "),
        variant: "destructive"
      })
    }
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const fileToRemove = newFiles[index]
      
      // Revoke the object URL to avoid memory leaks
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFiles = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload photos",
        variant: "destructive"
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one photo to upload",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    
    try {
      // Create a FormData object to send the files
      const formData = new FormData()
      formData.append("propertyId", id)
      
      // Add each file to the FormData
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })
      
      // Upload the files using a fetch request
      const response = await fetch(`/api/properties/${id}/photos`, {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload photos")
      }
      
      // Clear the files after successful upload
      setFiles([])
      setUploadSuccess(true)
      
      toast({
        title: "Upload successful",
        description: "Your photos have been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading files:", error)
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred")
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Property Photos</h1>
      
      {uploadError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {uploadSuccess && (
        <Alert variant="success" className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your photos have been uploaded successfully.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="p-6 mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-rum-500 bg-rum-50" : "border-gray-300 hover:border-rum-500 hover:bg-rum-50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop some photos here, or click to select files"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports JPG, PNG, and WebP up to 5MB each (max 10 files)
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Selected Photos ({files.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden border bg-gray-100">
                    {file.preview ? (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        className="object-cover"
                        fill
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>
                  <p className="text-xs mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/properties/${id}`)}
            disabled={uploading}
          >
            Skip for now
          </Button>
          <Button
            variant="rum"
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Photos"
            )}
          </Button>
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="rum"
          onClick={() => router.push(`/properties/${id}`)}
        >
          View Property
        </Button>
      </div>
    </div>
  )
}
