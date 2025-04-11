"use client"

import React, { createContext, useContext, useState } from "react"
import { useForm, FormProvider, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PropertyFormValues, propertySchema } from "@/lib/schemas/property-schema"

type PropertyFormContextType = {
  form: UseFormReturn<PropertyFormValues>
  step: number
  totalSteps: number
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  isFirstStep: boolean
  isLastStep: boolean
  submitForm: () => void
  isSubmitting: boolean
}

const PropertyFormContext = createContext<PropertyFormContextType | null>(null)

type PropertyFormProviderProps = {
  children: React.ReactNode
  onSubmit: (data: PropertyFormValues) => Promise<void>
  defaultValues?: Partial<PropertyFormValues>
}

export function PropertyFormProvider({
  children,
  onSubmit,
  defaultValues,
}: PropertyFormProviderProps) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 8 // Updated total number of steps in the form

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: "house",
      description: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postnumber: "",
      country: "",
      size_sqft: 0,
      ceiling_height_ft: 0,
      width_ft: 0,
      length_ft: 0,
      max_guests: 10,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      nearby_facilities: [],
      additional_info: "",
      images: [],
      cover_image_index: undefined,
      price_per_hour: 0,
      price_per_day: 0,
      minimum_hours: 1,
      discount_weekly: 0,
      discount_monthly: 0,
      rules: "",
      cancellation_policy: "flexible",
      noise_restrictions: false,
      no_smoking: false,
      no_pets: false,
      no_parties: false,
      availability: [],
      defaultAvailability: true,
      ...defaultValues,
    },
  })

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1)
    }
  }

  const goToStep = (newStep: number) => {
    if (newStep >= 0 && newStep < totalSteps) {
      setStep(newStep)
    }
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      await form.handleSubmit(async (data) => {
        await onSubmit(data)
      })()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    form,
    step,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: step === 0,
    isLastStep: step === totalSteps - 1,
    submitForm,
    isSubmitting,
  }

  return (
    <PropertyFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </PropertyFormContext.Provider>
  )
}

export function usePropertyForm() {
  const context = useContext(PropertyFormContext)
  if (!context) {
    throw new Error("usePropertyForm must be used within a PropertyFormProvider")
  }
  return context
}
