import { z } from "zod";

// Define the availability date type
export type AvailabilityDate = {
  date: Date;
  isAvailable: boolean;
  specialPrice?: number | null;
};

// Schema for a single availability date
export const availabilityDateSchema = z.object({
  date: z.date(),
  isAvailable: z.boolean(),
  specialPrice: z.number().nullable().optional(),
});

// Schema for the availability step in the property form
export const propertyAvailabilitySchema = z.object({
  availability: z.array(availabilityDateSchema).optional().default([]),
  defaultAvailability: z.boolean().default(true),
});

export type PropertyAvailabilityValues = z.infer<typeof propertyAvailabilitySchema>;
