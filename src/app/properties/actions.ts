"use server"

import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

export async function createProperty(data: PropertyFormValues) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new Error("You must be logged in to create a property")
    }

    const userId = session.user.id
    
    // Create a direct Supabase client with service role key for admin access
    // This bypasses RLS policies for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract the data we want to save to the properties table
    const propertyData = {
      owner_id: userId, 
      name: data.name,
      title: data.name, // Map name to title to satisfy the not-null constraint
      type: data.type,
      property_type: data.type, // Map type to property_type
      description: data.description,
      address_line1: data.address_line1,
      address_line2: data.address_line2 || null,
      address: data.address_line1, // Map address_line1 to address
      city: data.city,
      state: data.state,
      postnumber: data.postnumber,
      zip_code: data.postnumber, // Map postnumber to zip_code
      country: data.country,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      size_sqft: data.size_sqft,
      ceiling_height_ft: data.ceiling_height_ft || null,
      width_ft: data.width_ft || null,
      length_ft: data.length_ft || null,
      amenities: data.amenities || [],
      nearby_facilities: data.nearby_facilities || [],
      additional_info: data.additional_info || null,
      price_per_hour: data.price_per_hour,
      price_per_day: data.price_per_day,
      minimum_hours: data.minimum_hours || 1,
      discount_weekly: data.discount_weekly || 0,
      discount_monthly: data.discount_monthly || 0,
      rules: data.rules || null,
      cancellation_policy: data.cancellation_policy,
      noise_restrictions: data.noise_restrictions || false,
      no_smoking: data.no_smoking || false,
      no_pets: data.no_pets || false,
      no_parties: data.no_parties || false,
      status: "draft",
      is_published: false, // Explicitly set is_published to false
      unit_preference: data.unit_preference || "metric",
      // Add default values for other required fields
      max_guests: data.max_guests || 10, // Default value
      bedrooms: data.bedrooms || 1, // Default value
      bathrooms: data.bathrooms || 1, // Default value
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert the property data into the properties table
    const { data: property, error } = await supabase
      .from("properties")
      .insert(propertyData)
      .select()
      .single()

    if (error) {
      console.error("Error creating property:", error)
      throw new Error(`Failed to create property: ${error.message}`)
    }

    // If we have images, save them to the property_images table
    if (data.images && data.images.length > 0) {
      const propertyId = property.id
      
      // Prepare the image data for insertion
      const imageData = data.images.map((image, index) => ({
        property_id: propertyId,
        path: image.path,
        url: image.url,
        name: image.name,
        size: image.size,
        type: image.type,
        position: index,
        is_cover: index === (data.cover_image_index || 0),
        created_at: new Date().toISOString(),
      }))
      
      // Insert the image data into the property_images table
      const { error: imageError } = await supabase
        .from("property_images")
        .insert(imageData)
      
      if (imageError) {
        console.error("Error saving property images:", imageError)
        // We don't throw here to avoid failing the entire property creation
      }
    }

    // Revalidate the properties page to show the new property
    revalidatePath("/properties")
    revalidatePath("/dashboard")

    // Return the created property
    return { success: true, property }
  } catch (error) {
    console.error("Error in createProperty:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    }
  }
}

export async function updatePropertyStatus(propertyId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new Error("You must be logged in to update a property")
    }

    const userId = session.user.id
    
    // Create a direct Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, check if the user owns this property
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("owner_id") 
      .eq("id", propertyId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch property: ${fetchError.message}`)
    }

    if (property.owner_id !== userId) { 
      throw new Error("You don't have permission to update this property")
    }

    // Update the property status
    const { error } = await supabase
      .from("properties")
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", propertyId)

    if (error) {
      throw new Error(`Failed to update property status: ${error.message}`)
    }

    // Revalidate the properties page to show the updated property
    revalidatePath("/properties")
    revalidatePath("/dashboard")
    revalidatePath(`/properties/${propertyId}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updatePropertyStatus:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    }
  }
}
