"use client"

import { useFormContext } from "react-hook-form"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function RulesStep() {
  const { control } = useFormContext<PropertyFormValues>()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">House Rules & Policies</h2>
        <p className="text-muted-foreground">
          Set the rules and policies for your property.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Rules</h3>
          <FormField
            control={control}
            name="rules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Rules</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe any specific rules or guidelines for using your property..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide any specific rules or guidelines that renters should follow when using your property.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Common Restrictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="noise_restrictions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Noise Restrictions
                    </FormLabel>
                    <FormDescription>
                      Limit excessive noise during certain hours
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="no_smoking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      No Smoking
                    </FormLabel>
                    <FormDescription>
                      No smoking allowed on the property
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="no_pets"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      No Pets
                    </FormLabel>
                    <FormDescription>
                      No pets allowed on the property
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="no_parties"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      No Parties
                    </FormLabel>
                    <FormDescription>
                      No parties or events allowed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cancellation Policy</h3>
          <FormField
            control={control}
            name="cancellation_policy"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Select a cancellation policy</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="flexible" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium cursor-pointer">
                          Flexible
                        </FormLabel>
                        <FormDescription>
                          Full refund if cancelled at least 24 hours before the start time
                        </FormDescription>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="moderate" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium cursor-pointer">
                          Moderate
                        </FormLabel>
                        <FormDescription>
                          Full refund if cancelled at least 5 days before the start time
                        </FormDescription>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="strict" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium cursor-pointer">
                          Strict
                        </FormLabel>
                        <FormDescription>
                          50% refund if cancelled at least 7 days before the start time, no refund after that
                        </FormDescription>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  )
}
