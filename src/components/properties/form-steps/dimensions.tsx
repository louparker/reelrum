"use client"

import { useState, useEffect, useRef } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"

export function DimensionsStep() {
  const { control, setValue, getValues } = useFormContext<PropertyFormValues>()
  
  // Watch the unit preference
  const unitPreference = useWatch({
    control,
    name: "unit_preference",
    defaultValue: "metric"
  })
  
  // Refs to store input values
  const inputRefs = {
    size_sqft: useRef<HTMLInputElement>(null),
    length_ft: useRef<HTMLInputElement>(null),
    width_ft: useRef<HTMLInputElement>(null),
    ceiling_height_ft: useRef<HTMLInputElement>(null),
  }
  
  // Local state for display values
  const [displayValues, setDisplayValues] = useState({
    size_sqft: "",
    length_ft: "",
    width_ft: "",
    ceiling_height_ft: "",
  })
  
  // Conversion factors
  const sqftToSqm = 0.092903
  const ftToM = 0.3048
  
  // Toggle between metric and imperial
  const toggleUnitPreference = () => {
    const newPreference = unitPreference === "metric" ? "imperial" : "metric"
    setValue("unit_preference", newPreference)
    
    // Update display values when unit changes
    updateDisplayValues(newPreference)
  }
  
  // Update display values based on form values and unit preference
  const updateDisplayValues = (preference: string = unitPreference) => {
    const values = getValues()
    const newDisplayValues = { ...displayValues }
    
    Object.keys(inputRefs).forEach((key) => {
      const fieldName = key as keyof typeof inputRefs
      const value = values[fieldName] || 0
      
      if (preference === "metric") {
        if (fieldName === "size_sqft") {
          newDisplayValues[fieldName] = value ? (value * sqftToSqm).toFixed(2) : ""
        } else {
          newDisplayValues[fieldName] = value ? (value * ftToM).toFixed(2) : ""
        }
      } else {
        newDisplayValues[fieldName] = value ? value.toFixed(2) : ""
      }
    })
    
    setDisplayValues(newDisplayValues)
  }
  
  // Initialize display values
  useEffect(() => {
    updateDisplayValues()
  }, [])
  
  // Get the appropriate labels and placeholders based on unit preference
  const getUnitLabels = () => {
    if (unitPreference === "metric") {
      return {
        area: "Total Area (m²)",
        areaPlaceholder: "e.g. 110",
        length: "Length (m)",
        lengthPlaceholder: "e.g. 9",
        width: "Width (m)",
        widthPlaceholder: "e.g. 6",
        height: "Ceiling Height (m)",
        heightPlaceholder: "e.g. 3",
      }
    }
    return {
      area: "Total Area (sq ft)",
      areaPlaceholder: "e.g. 1200",
      length: "Length (ft)",
      lengthPlaceholder: "e.g. 30",
      width: "Width (ft)",
      widthPlaceholder: "e.g. 20",
      height: "Ceiling Height (ft)",
      heightPlaceholder: "e.g. 10",
    }
  }
  
  const unitLabels = getUnitLabels()

  // Validate and convert input value
  const validateAndConvert = (value: string): number | null => {
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
    
    if (numValue === null) {
      return; // Don't update if invalid
    }
    
    if (unitPreference === "metric") {
      // Convert from metric to imperial for storage
      if (name === "size_sqft") {
        setValue(name, numValue / sqftToSqm);
      } else {
        setValue(name as "length_ft" | "width_ft" | "ceiling_height_ft", numValue / ftToM);
      }
    } else {
      // Imperial values are stored as-is
      setValue(name as any, numValue);
    }
  }
  
  // Handle blur event to format the display value
  const handleBlur = (name: string, formOnBlur: () => void) => {
    formOnBlur(); // Call the original onBlur
    
    // Get the current value and format it
    const value = getValues()[name as keyof PropertyFormValues] as number;
    
    if (value) {
      let displayValue;
      
      if (unitPreference === "metric") {
        if (name === "size_sqft") {
          displayValue = (value * sqftToSqm).toFixed(2);
        } else {
          displayValue = (value * ftToM).toFixed(2);
        }
      } else {
        displayValue = value.toFixed(2);
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
        <h2 className="text-2xl font-bold">Property Dimensions</h2>
        <p className="text-muted-foreground">
          Provide the measurements of your property.
        </p>
      </div>
      
      <div className="flex items-center justify-end space-x-2 mb-4">
        <span className={`text-sm ${unitPreference === "metric" ? "font-semibold" : ""}`}>Metric</span>
        <Toggle 
          pressed={unitPreference === "imperial"} 
          onPressedChange={toggleUnitPreference}
          variant="outline"
          aria-label="Toggle unit system"
        >
          {unitPreference === "metric" ? "Switch to Imperial" : "Switch to Metric"}
        </Toggle>
        <span className={`text-sm ${unitPreference === "imperial" ? "font-semibold" : ""}`}>Imperial</span>
      </div>

      <Card className="p-6 space-y-6">
        <FormField
          control={control}
          name="size_sqft"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{unitLabels.area}</FormLabel>
              <FormControl>
                <Input 
                  ref={inputRefs.size_sqft}
                  type="text"
                  inputMode="decimal"
                  placeholder={unitLabels.areaPlaceholder} 
                  value={displayValues.size_sqft}
                  onChange={(e) => handleInputChange("size_sqft", e.target.value)}
                  onBlur={() => handleBlur("size_sqft", field.onBlur)}
                  className="no-spinner"
                />
              </FormControl>
              <FormDescription>
                The total usable area of your property.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="length_ft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{unitLabels.length}</FormLabel>
                <FormControl>
                  <Input 
                    ref={inputRefs.length_ft}
                    type="text"
                    inputMode="decimal"
                    placeholder={unitLabels.lengthPlaceholder} 
                    value={displayValues.length_ft}
                    onChange={(e) => handleInputChange("length_ft", e.target.value)}
                    onBlur={() => handleBlur("length_ft", field.onBlur)}
                    className="no-spinner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="width_ft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{unitLabels.width}</FormLabel>
                <FormControl>
                  <Input 
                    ref={inputRefs.width_ft}
                    type="text"
                    inputMode="decimal"
                    placeholder={unitLabels.widthPlaceholder} 
                    value={displayValues.width_ft}
                    onChange={(e) => handleInputChange("width_ft", e.target.value)}
                    onBlur={() => handleBlur("width_ft", field.onBlur)}
                    className="no-spinner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ceiling_height_ft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{unitLabels.height}</FormLabel>
                <FormControl>
                  <Input 
                    ref={inputRefs.ceiling_height_ft}
                    type="text"
                    inputMode="decimal"
                    placeholder={unitLabels.heightPlaceholder} 
                    value={displayValues.ceiling_height_ft}
                    onChange={(e) => handleInputChange("ceiling_height_ft", e.target.value)}
                    onBlur={() => handleBlur("ceiling_height_ft", field.onBlur)}
                    className="no-spinner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormDescription className="pt-2">
          Accurate dimensions help production teams plan their shoots more effectively. If your property has multiple rooms with different dimensions, provide details for the main filming area.
        </FormDescription>
      </Card>
    </div>
  )
}
