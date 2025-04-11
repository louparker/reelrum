"use client"

import { useState, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function PricingStep() {
  const { control, setValue, getValues } = useFormContext<PropertyFormValues>()
  
  // Refs to store input values
  const inputRefs = {
    price_per_hour: useRef<HTMLInputElement>(null),
    price_per_day: useRef<HTMLInputElement>(null),
    minimum_hours: useRef<HTMLInputElement>(null),
    discount_weekly: useRef<HTMLInputElement>(null),
    discount_monthly: useRef<HTMLInputElement>(null),
  }
  
  // Local state for display values
  const [displayValues, setDisplayValues] = useState({
    price_per_hour: "",
    price_per_day: "",
    minimum_hours: "",
    discount_weekly: "",
    discount_monthly: "",
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
  const validateAndConvert = (value: string, isPercentage: boolean = false): number | null => {
    // Remove any non-numeric characters except decimal point
    const sanitized = value.replace(/[^\d.]/g, '');
    
    // Handle multiple decimal points
    const parts = sanitized.split('.');
    const cleanValue = parts.length > 1 
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitized;
      
    const numValue = parseFloat(cleanValue);
    
    if (isNaN(numValue) || numValue < 0) {
      return null;
    }
    
    // For percentages, ensure value is <= 100
    if (isPercentage && numValue > 100) {
      return 100;
    }
    
    return numValue;
  }
  
  // Handle input change
  const handleInputChange = (name: string, value: string, isPercentage: boolean = false) => {
    // Update display value first to maintain cursor position
    setDisplayValues(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Then validate and update form value
    const numValue = validateAndConvert(value, isPercentage);
    
    if (numValue !== null) {
      setValue(name as any, numValue);
    }
  }
  
  // Handle blur event to format the display value
  const handleBlur = (name: string, formOnBlur: () => void, isInteger: boolean = false) => {
    formOnBlur(); // Call the original onBlur
    
    // Get the current value and format it
    const value = getValues()[name as keyof PropertyFormValues] as number;
    
    if (value) {
      let displayValue;
      
      if (isInteger) {
        displayValue = Math.round(value).toString();
      } else {
        displayValue = value.toFixed(2);
        // Remove trailing zeros and decimal point if not needed
        displayValue = displayValue.replace(/\.?0+$/, '');
      }
      
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
        <h2 className="text-2xl font-bold">Pricing Information</h2>
        <p className="text-muted-foreground">
          Set your pricing rates and booking requirements.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Base Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="price_per_hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (SEK)</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.price_per_hour}
                      type="text" 
                      inputMode="decimal"
                      placeholder="e.g. 750" 
                      value={displayValues.price_per_hour}
                      onChange={(e) => handleInputChange("price_per_hour", e.target.value)}
                      onBlur={() => handleBlur("price_per_hour", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    The base hourly rate for booking your property.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="price_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate (SEK)</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.price_per_day}
                      type="text" 
                      inputMode="decimal"
                      placeholder="e.g. 5000" 
                      value={displayValues.price_per_day}
                      onChange={(e) => handleInputChange("price_per_day", e.target.value)}
                      onBlur={() => handleBlur("price_per_day", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    The base daily rate (8-10 hours) for booking your property.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Booking Requirements</h3>
          <FormField
            control={control}
            name="minimum_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Booking Duration (hours)</FormLabel>
                <FormControl>
                  <Input 
                    ref={inputRefs.minimum_hours}
                    type="text" 
                    inputMode="numeric"
                    placeholder="e.g. 4" 
                    value={displayValues.minimum_hours}
                    onChange={(e) => handleInputChange("minimum_hours", e.target.value)}
                    onBlur={() => handleBlur("minimum_hours", field.onBlur, true)}
                    className="no-spinner"
                  />
                </FormControl>
                <FormDescription>
                  The minimum number of hours required for a booking.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Discounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="discount_weekly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Discount (%)</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.discount_weekly}
                      type="text" 
                      inputMode="decimal"
                      placeholder="e.g. 10" 
                      value={displayValues.discount_weekly}
                      onChange={(e) => handleInputChange("discount_weekly", e.target.value, true)}
                      onBlur={() => handleBlur("discount_weekly", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    Discount for bookings of 5+ days.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="discount_monthly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Discount (%)</FormLabel>
                  <FormControl>
                    <Input 
                      ref={inputRefs.discount_monthly}
                      type="text" 
                      inputMode="decimal"
                      placeholder="e.g. 20" 
                      value={displayValues.discount_monthly}
                      onChange={(e) => handleInputChange("discount_monthly", e.target.value, true)}
                      onBlur={() => handleBlur("discount_monthly", field.onBlur)}
                      className="no-spinner"
                    />
                  </FormControl>
                  <FormDescription>
                    Discount for bookings of 20+ days.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
