"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PropertyForm } from "@/components/properties/property-form"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ListPropertyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submissionState, setSubmissionState] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
    propertyId?: string;
  }>({
    status: "idle",
  })

  const handleSubmit = async (data: PropertyFormValues) => {
    try {
      setSubmissionState({
        status: "idle",
      })
      
      // Call the server action with proper error handling
      const formData = new FormData()
      // Convert the complex data structure to JSON and add it to the FormData
      formData.append('propertyData', JSON.stringify(data))
      
      // Use fetch API to call the server action endpoint
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()

      if (!response.ok || !result.success) {
        setSubmissionState({
          status: "error",
          message: result.error || "Failed to create property listing",
        })
        toast({
          title: "Error",
          description: result.error || "Failed to create property listing",
          variant: "destructive",
        })
        return
      }

      setSubmissionState({
        status: "success",
        message: "Property listing created successfully!",
        propertyId: result.property?.id,
      })
      toast({
        title: "Success",
        description: "Your property has been listed successfully!",
      })
    } catch (error) {
      console.error("Error submitting property:", error)
      setSubmissionState({
        status: "error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
      toast({
        title: "Error",
        description: "There was a problem creating your listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (submissionState.status === "success") {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Alert variant="success" className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your property listing has been created successfully. You can now add photos to your listing.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 mt-8">
          <Button 
            variant="rum" 
            onClick={() => router.push(`/properties/${submissionState.propertyId}/photos`)}
          >
            Add Photos
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (submissionState.status === "error") {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {submissionState.message || "There was a problem creating your listing. Please try again."}
          </AlertDescription>
        </Alert>
        
        <Button 
          variant="outline" 
          onClick={() => setSubmissionState({ status: "idle" })}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
        <p className="text-muted-foreground mb-8">
          Fill out the form below to list your property on ReelRum. You'll be able to add photos after submitting the basic information.
        </p>
      </div>
      
      <PropertyForm onSubmit={handleSubmit} />
    </div>
  )
}
