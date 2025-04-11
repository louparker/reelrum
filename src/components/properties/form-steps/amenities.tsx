"use client"

import { useState, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PropertyFormValues, amenities, nearbyFacilities } from "@/lib/schemas/property-schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export function AmenitiesStep() {
  const { control, setValue, getValues } = useFormContext<PropertyFormValues>()
  
  // Refs to store input values
  const inputRefs = {
    max_guests: useRef<HTMLInputElement>(null),
    bedrooms: useRef<HTMLInputElement>(null),
    bathrooms: useRef<HTMLInputElement>(null),
  }
  
  // Local state for display values
  const [displayValues, setDisplayValues] = useState({
    max_guests: "",
    bedrooms: "",
    bathrooms: "",
  })
  
  // Initialize display values
  useState(() => {
    const values = getValues();
    const newDisplayValues = { ...displayValues };
    
    Object.keys(inputRefs).forEach((key) => {
      const fieldName = key as keyof typeof inputRefs;
      const value = values[fieldName];
      newDisplayValues[fieldName] = value ? value.toString() : "";
    });
    
    setDisplayValues(newDisplayValues);
  });
  
  // Validate and convert input value
  const validateAndConvert = (value: string): number | null => {
    // Remove any non-numeric characters
    const sanitized = value.replace(/[^\d]/g, '');
    
    const numValue = parseInt(sanitized, 10);
    
    if (isNaN(numValue) || numValue < 0) {
      return null;
    }
    
    return numValue;
  }
  
  // Handle input change
  const handleInputChange = (name: string, value: string) => {
    // Update display value first to maintain cursor position
    setDisplayValues(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Then validate and update form value
    const numValue = validateAndConvert(value);
    
    if (numValue !== null) {
      setValue(name as any, numValue);
    }
  }
  
  // Handle blur event to format the display value
  const handleBlur = (name: string, formOnBlur: () => void) => {
    formOnBlur(); // Call the original onBlur
    
    // Get the current value and format it
    const value = getValues()[name as keyof PropertyFormValues] as number;
    
    if (value) {
      // For these fields, we want integers only, no decimals
      const displayValue = Math.round(value).toString();
      
      // Update display value with formatted number
      setDisplayValues(prev => ({
        ...prev,
        [name]: displayValue
      }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Amenities & Facilities</h2>
        <p className="text-muted-foreground">
          Tell us what amenities and facilities your property offers.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="max_guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Guests</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.max_guests}
                      type="text" 
                      inputMode="numeric"
                      placeholder="e.g. 10" 
                      value={displayValues.max_guests}
                      onChange={(e) => handleInputChange("max_guests", e.target.value)}
                      onBlur={() => handleBlur("max_guests", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of people allowed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.bedrooms}
                      type="text" 
                      inputMode="numeric"
                      placeholder="e.g. 2" 
                      value={displayValues.bedrooms}
                      onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                      onBlur={() => handleBlur("bedrooms", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    Number of bedrooms available
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.bathrooms}
                      type="text" 
                      inputMode="numeric"
                      placeholder="e.g. 1" 
                      value={displayValues.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                      onBlur={() => handleBlur("bathrooms", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    Number of bathrooms available
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">On-site Amenities</h3>
          <FormField
            control={control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <FormField
                      key={amenity.value}
                      control={control}
                      name="amenities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={amenity.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity.value)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || []
                                  return checked
                                    ? field.onChange([...currentValue, amenity.value])
                                    : field.onChange(
                                        currentValue.filter((value) => value !== amenity.value)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {amenity.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Nearby Facilities</h3>
          <FormField
            control={control}
            name="nearby_facilities"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {nearbyFacilities.map((facility) => (
                    <FormField
                      key={facility.value}
                      control={control}
                      name="nearby_facilities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={facility.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(facility.value)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || []
                                  return checked
                                    ? field.onChange([...currentValue, facility.value])
                                    : field.onChange(
                                        currentValue.filter((value) => value !== facility.value)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {facility.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          <FormField
            control={control}
            name="additional_info"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Any additional details about amenities, equipment, or other features of your property..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include any additional information about your property that might be relevant for filming, such as special equipment, unique features, or restrictions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  )
}
