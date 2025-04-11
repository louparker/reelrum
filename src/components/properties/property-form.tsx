"use client"

import { useState } from "react"
import { PropertyFormProvider, usePropertyForm } from "./property-form-context"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { BasicDetailsStep } from "./form-steps/basic-details"
import { AddressStep } from "./form-steps/address"
import { DimensionsStep } from "./form-steps/dimensions"
import { AmenitiesStep } from "./form-steps/amenities"
import { PhotosStep } from "./form-steps/photos"
import { PricingStep } from "./form-steps/pricing"
import { RulesStep } from "./form-steps/rules"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

type PropertyFormProps = {
  onSubmit: (data: PropertyFormValues) => Promise<void>
  defaultValues?: Partial<PropertyFormValues>
}

export function PropertyForm({ onSubmit, defaultValues }: PropertyFormProps) {
  return (
    <PropertyFormProvider onSubmit={onSubmit} defaultValues={defaultValues}>
      <PropertyFormContent />
    </PropertyFormProvider>
  )
}

function PropertyFormContent() {
  const { 
    step, 
    totalSteps, 
    nextStep, 
    prevStep, 
    isFirstStep, 
    isLastStep, 
    form,
    submitForm,
    isSubmitting
  } = usePropertyForm()
  
  const [isValidating, setIsValidating] = useState(false)

  // Handle next step with validation
  const handleNext = async () => {
    setIsValidating(true)
    
    let fieldsToValidate: string[] = []
    
    // Determine which fields to validate based on current step
    switch (step) {
      case 0: // Basic Details
        fieldsToValidate = ["name", "type", "description"]
        break
      case 1: // Address
        fieldsToValidate = ["address_line1", "city", "state", "postnumber", "country"]
        break
      case 2: // Dimensions
        fieldsToValidate = ["size_sqft"]
        break
      case 3: // Amenities
        fieldsToValidate = ["max_guests", "bedrooms", "bathrooms"]
        break
      case 4: // Photos
        // No required fields in this step
        break
      case 5: // Pricing
        fieldsToValidate = ["price_per_hour", "price_per_day"]
        break
      case 6: // Rules
        fieldsToValidate = ["cancellation_policy"]
        break
      default:
        break
    }
    
    // Validate the fields for the current step
    const result = await form.trigger(fieldsToValidate as any)
    
    if (result) {
      nextStep()
    }
    
    setIsValidating(false)
  }

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return <BasicDetailsStep />
      case 1:
        return <AddressStep />
      case 2:
        return <DimensionsStep />
      case 3:
        return <AmenitiesStep />
      case 4:
        return <PhotosStep />
      case 5:
        return <PricingStep />
      case 6:
        return <RulesStep />
      default:
        return <BasicDetailsStep />
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((step + 1) / totalSteps) * 100)}% Complete
          </span>
        </div>
        <Progress value={((step + 1) / totalSteps) * 100} className="h-2" />
      </div>

      <Card className="p-6">
        <form>
          {renderStep()}
          
          <div className="mt-8 flex justify-between">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isValidating || isSubmitting}
              >
                Previous
              </Button>
            )}
            
            {isFirstStep && <div />}
            
            {!isLastStep ? (
              <Button
                type="button"
                variant="rum"
                onClick={handleNext}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="rum"
                onClick={submitForm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Listing"
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
