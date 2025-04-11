"use client"

import { PropertyForm } from "@/components/properties/property-form"
import { PropertyFormValues } from "@/lib/schemas/property-schema"

export default function TestFormPage() {
  const handleSubmit = async (data: PropertyFormValues) => {
    console.log("Form submitted:", data)
    alert("Form submitted successfully!")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test Property Form</h1>
      <PropertyForm onSubmit={handleSubmit} />
    </div>
  )
}
