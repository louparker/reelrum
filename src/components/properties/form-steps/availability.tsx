"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { format, addDays, isSameDay, isAfter, isBefore, startOfDay } from "date-fns"
import "react-day-picker/dist/style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DayPicker } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { AvailabilityDate } from "@/lib/schemas/availability-schema"
import { CalendarX, CalendarCheck, Info } from "lucide-react"

export function AvailabilityStep() {
  const { register, setValue, watch } = useFormContext<PropertyFormValues>()
  const [selectedTab, setSelectedTab] = useState<"calendar" | "settings">("calendar")
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [dateAction, setDateAction] = useState<"block" | "unblock" | "price">("block")
  const [specialPrice, setSpecialPrice] = useState<string>("")
  
  // Get the current availability from the form
  const availability: AvailabilityDate[] = watch("availability") || []
  const defaultAvailability: boolean = watch("defaultAvailability") ?? true
  
  // Function to check if a date is blocked
  const isDateBlocked = (date: Date): boolean => {
    const found = availability.find(a => isSameDay(new Date(a.date), date))
    if (found) {
      return !found.isAvailable
    }
    return !defaultAvailability
  }
  
  // Function to check if a date is explicitly available (not just default)
  const isDateAvailable = (date: Date): boolean => {
    const found = availability.find(a => isSameDay(new Date(a.date), date))
    if (found) {
      return found.isAvailable && !found.specialPrice
    }
    return false
  }
  
  // Function to get special price for a date
  const getSpecialPrice = (date: Date): number | null | undefined => {
    const found = availability.find(a => isSameDay(new Date(a.date), date))
    return found?.specialPrice
  }
  
  // Function to toggle default availability
  const toggleDefaultAvailability = () => {
    setValue("defaultAvailability", !defaultAvailability)
  }
  
  // Function to handle date selection
  const handleDateSelect = (date: Date) => {
    if (selectedDates.some(d => isSameDay(d, date))) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }
  
  // Function to apply the selected action to the selected dates
  const applyAction = () => {
    if (selectedDates.length === 0) return
    
    const newAvailability: AvailabilityDate[] = [...availability]
    
    selectedDates.forEach(date => {
      // Find if this date already has an entry
      const existingIndex = newAvailability.findIndex(a => 
        isSameDay(new Date(a.date), date)
      )
      
      // Create the new availability entry
      const newEntry: AvailabilityDate = {
        date,
        isAvailable: dateAction !== "block",
        specialPrice: dateAction === "price" ? Number(specialPrice) || null : null
      }
      
      // Update or add the entry
      if (existingIndex >= 0) {
        newAvailability[existingIndex] = newEntry
      } else {
        newAvailability.push(newEntry)
      }
    })
    
    // Update the form value
    setValue("availability", newAvailability)
    
    // Reset selection
    setSelectedDates([])
    setSpecialPrice("")
  }
  
  // Function to clear all selections
  const clearSelection = () => {
    setSelectedDates([])
    setSpecialPrice("")
  }
  
  // Function to reset all availability settings
  const resetAvailability = () => {
    setValue("availability", [])
    setValue("defaultAvailability", true)
    setSelectedDates([])
    setSpecialPrice("")
  }
  
  // Custom CSS classes for different date states
  const getDayClass = (date: Date) => {
    const isBlocked = isDateBlocked(date)
    const hasSpecialPrice = !!getSpecialPrice(date)
    const isSelected = selectedDates.some(d => isSameDay(d, date))
    const isAvailable = isDateAvailable(date)
    
    if (isSelected) return "bg-primary text-primary-foreground hover:bg-primary/90"
    if (isBlocked) return "bg-red-100 text-red-600 hover:bg-red-200"
    if (hasSpecialPrice) return "bg-green-100 text-green-600 hover:bg-green-200"
    if (isAvailable) return "bg-orange-100 text-orange-600 hover:bg-orange-200"
    return ""
  }
  
  // Custom modifiers for the calendar
  const modifiers = {
    blocked: (date: Date) => isDateBlocked(date),
    special: (date: Date) => !!getSpecialPrice(date),
    selected: (date: Date) => selectedDates.some(d => isSameDay(d, date)),
    available: (date: Date) => isDateAvailable(date),
  }
  
  // Custom styles for the modifiers
  const modifiersStyles = {
    blocked: { 
      backgroundColor: "#FEE2E2", 
      color: "#DC2626", 
      fontWeight: "bold",
      borderRadius: "50%" 
    },
    special: { 
      backgroundColor: "#DCFCE7", 
      color: "#16A34A", 
      fontWeight: "bold",
      borderRadius: "50%" 
    },
    selected: { 
      backgroundColor: dateAction === "block" ? "#FEE2E2" : 
                      dateAction === "price" ? "#DCFCE7" : "#FFEDD5", 
      color: dateAction === "block" ? "#DC2626" : 
             dateAction === "price" ? "#16A34A" : "#EA580C", 
      fontWeight: "bold",
      borderRadius: "50%" 
    },
    available: {
      backgroundColor: "#FFEDD5",
      color: "#EA580C",
      fontWeight: "bold",
      borderRadius: "50%"
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Availability Calendar</h2>
        <p className="text-muted-foreground">
          Set your property's availability and special pricing
        </p>
      </div>
      
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Manage Availability</CardTitle>
              <CardDescription>
                Select dates to block, unblock, or set special pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar Column */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-full max-w-[280px] mx-auto">
                      <DayPicker
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => {
                          if (!dates) return;
                          setSelectedDates(Array.isArray(dates) ? dates : [dates]);
                        }}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        className="w-full pt-2 pb-2 mt-2 mb-2 border-t border-b"
                        showOutsideDays
                        disabled={[{ before: startOfDay(new Date()) }]}
                        classNames={{
                          months: "flex flex-col space-y-2",
                          month: "space-y-1",
                          caption: "flex justify-center relative items-center text-xs",
                          caption_label: "text-xs font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse",
                          head_row: "flex",
                          head_cell: "text-muted-foreground w-7 font-normal text-[0.65rem] flex-1 text-center",
                          row: "flex w-full mt-0.5",
                          cell: "h-7 w-7 flex-1 text-center text-[0.65rem] p-0 relative",
                          day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-full",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full",
                          day_today: "bg-accent text-accent-foreground rounded-full",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
                      <span className="text-sm">Blocked Dates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200"></div>
                      <span className="text-sm">Special Pricing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-orange-100 border border-orange-200"></div>
                      <span className="text-sm">Available Dates</span>
                    </div>
                  </div>
                </div>
                
                {/* Controls Column */}
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Selected Dates: {selectedDates.length}</h3>
                    {selectedDates.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        What would you like to do with these dates?
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click on dates in the calendar to select them
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button 
                          type="button" 
                          variant={dateAction === "block" ? "default" : "outline"}
                          onClick={() => setDateAction("block")}
                          className="justify-start"
                        >
                          <CalendarX className="mr-2 h-4 w-4" />
                          Block Dates
                        </Button>
                        <Button 
                          type="button" 
                          variant={dateAction === "unblock" ? "default" : "outline"}
                          onClick={() => setDateAction("unblock")}
                          className="justify-start"
                        >
                          <CalendarCheck className="mr-2 h-4 w-4" />
                          Make Dates Available
                        </Button>
                        <Button 
                          type="button" 
                          variant={dateAction === "price" ? "default" : "outline"}
                          onClick={() => setDateAction("price")}
                          className="justify-start"
                        >
                          <span className="mr-2 font-semibold">kr</span>
                          Set Special Price
                        </Button>
                      </div>
                    </div>
                    
                    {dateAction === "price" && (
                      <div>
                        <Label htmlFor="specialPrice">Special Price (SEK per night)</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">kr</span>
                          <Input
                            id="specialPrice"
                            type="number"
                            value={specialPrice}
                            onChange={(e) => setSpecialPrice(e.target.value)}
                            className="pl-8"
                            placeholder="Enter special price"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        type="button" 
                        onClick={applyAction}
                        disabled={selectedDates.length === 0}
                        className="flex-1"
                      >
                        Apply
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={clearSelection}
                        disabled={selectedDates.length === 0}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Default Availability</CardTitle>
              <CardDescription>
                Configure your default availability settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="defaultAvailability">Default Availability</Label>
                  <p className="text-sm text-muted-foreground">
                    By default, your property is {defaultAvailability ? "available" : "unavailable"} for booking
                  </p>
                </div>
                <Switch
                  id="defaultAvailability"
                  checked={defaultAvailability}
                  onCheckedChange={toggleDefaultAvailability}
                />
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md flex">
                <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Setting your property as unavailable by default means you'll need to manually select dates when it's available. 
                  This is useful if you only want to rent out your property occasionally.
                </p>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetAvailability}
                className="w-full"
              >
                Reset All Availability Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
