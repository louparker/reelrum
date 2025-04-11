import { z } from "zod";

// Property types
export const propertyTypes = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" },
  { value: "loft", label: "Loft" },
  { value: "warehouse", label: "Warehouse" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail Space" },
  { value: "outdoor", label: "Outdoor Area" },
  { value: "garden", label: "Garden" },
  { value: "other", label: "Other" },
] as const;

// Amenities
export const amenities = [
  { value: "parking", label: "Parking" },
  { value: "wifi", label: "WiFi" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "furniture", label: "Furniture" },
  { value: "heating", label: "Heating" },
  { value: "air_conditioning", label: "Air Conditioning" },
  { value: "natural_light", label: "Natural Light" },
  { value: "blackout", label: "Blackout Capability" },
  { value: "power_outlets", label: "Multiple Power Outlets" },
  { value: "loading_area", label: "Loading Area" },
  { value: "sound_system", label: "Sound System" },
  { value: "green_screen", label: "Green Screen" },
] as const;

// Nearby facilities
export const nearbyFacilities = [
  { value: "restaurants", label: "Restaurants" },
  { value: "cafes", label: "Cafes" },
  { value: "public_transport", label: "Public Transport" },
  { value: "parking", label: "Public Parking" },
  { value: "shops", label: "Shops" },
  { value: "parks", label: "Parks" },
  { value: "hospitals", label: "Hospitals" },
  { value: "schools", label: "Schools" },
] as const;

// Basic details schema
export const propertyBasicSchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  type: z.enum(propertyTypes.map(t => t.value) as [string, ...string[]]),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

// Address schema
export const propertyAddressSchema = z.object({
  address_line1: z.string().min(3, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postnumber: z.string().min(1, "Post number is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Dimensions schema
export const propertyDimensionsSchema = z.object({
  size_sqft: z.coerce.number().positive("Size must be a positive number"),
  ceiling_height_ft: z.coerce.number().positive("Ceiling height must be a positive number").optional(),
  width_ft: z.coerce.number().positive("Width must be a positive number").optional(),
  length_ft: z.coerce.number().positive("Length must be a positive number").optional(),
  unit_preference: z.enum(["metric", "imperial"]).default("metric"),
});

// Amenities schema
export const propertyAmenitiesSchema = z.object({
  max_guests: z.coerce.number().int().positive("Maximum guests must be a positive number"),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.coerce.number().int().min(0, "Bathrooms must be 0 or more"),
  amenities: z.array(z.enum(amenities.map(a => a.value) as [string, ...string[]])).optional(),
  nearby_facilities: z.array(z.enum(nearbyFacilities.map(f => f.value) as [string, ...string[]])).optional(),
  additional_info: z.string().optional(),
});

// Define the image type
export type PropertyImage = {
  path: string;
  url: string;
  name: string;
  size: number;
  type: string;
  id: string;
};

// Photos schema
export const propertyPhotosSchema = z.object({
  images: z.array(
    z.object({
      path: z.string(),
      url: z.string(),
      name: z.string(),
      size: z.number(),
      type: z.string(),
      id: z.string(),
    })
  ).optional().default([]),
  cover_image_index: z.number().optional(),
});

// Pricing schema
export const propertyPricingSchema = z.object({
  price_per_hour: z.coerce.number().positive("Hourly rate must be a positive number"),
  price_per_day: z.coerce.number().positive("Daily rate must be a positive number"),
  minimum_hours: z.coerce.number().int().positive("Minimum hours must be a positive integer").optional(),
  discount_weekly: z.coerce.number().min(0).max(100, "Weekly discount must be between 0 and 100").optional(),
  discount_monthly: z.coerce.number().min(0).max(100, "Monthly discount must be between 0 and 100").optional(),
});

// Rules schema
export const propertyRulesSchema = z.object({
  rules: z.string().optional(),
  cancellation_policy: z.enum(["flexible", "moderate", "strict"]),
  noise_restrictions: z.boolean().optional(),
  no_smoking: z.boolean().optional(),
  no_pets: z.boolean().optional(),
  no_parties: z.boolean().optional(),
});

// Complete property schema
export const propertySchema = z.object({
  ...propertyBasicSchema.shape,
  ...propertyAddressSchema.shape,
  ...propertyDimensionsSchema.shape,
  ...propertyAmenitiesSchema.shape,
  ...propertyPhotosSchema.shape,
  ...propertyPricingSchema.shape,
  ...propertyRulesSchema.shape,
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
export type PropertyBasicValues = z.infer<typeof propertyBasicSchema>;
export type PropertyAddressValues = z.infer<typeof propertyAddressSchema>;
export type PropertyDimensionsValues = z.infer<typeof propertyDimensionsSchema>;
export type PropertyAmenitiesValues = z.infer<typeof propertyAmenitiesSchema>;
export type PropertyPhotosValues = z.infer<typeof propertyPhotosSchema>;
export type PropertyPricingValues = z.infer<typeof propertyPricingSchema>;
export type PropertyRulesValues = z.infer<typeof propertyRulesSchema>;
