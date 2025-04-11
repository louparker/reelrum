"use client"

import { useFormContext } from "react-hook-form"
import { PropertyFormValues, propertyTypes } from "@/lib/schemas/property-schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function BasicDetailsStep() {
  const { control } = useFormContext<PropertyFormValues>()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Basic Details</h2>
        <p className="text-muted-foreground">
          Let's start with some basic information about your property.
        </p>
      </div>

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Modern Downtown Loft" {...field} />
            </FormControl>
            <FormDescription>
              Choose a descriptive name that highlights your property's best features.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Select the category that best describes your property.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your property, its unique features, and what makes it a great filming location..."
                className="min-h-32"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide a detailed description of your property. Mention unique features, architectural elements, lighting conditions, and anything that makes it special.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
