import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to create a property' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    
    // Parse the form data
    const formData = await request.formData()
    const propertyDataJson = formData.get('propertyData')
    
    if (!propertyDataJson || typeof propertyDataJson !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid property data' },
        { status: 400 }
      )
    }
    
    const data = JSON.parse(propertyDataJson)
    
    // Create a direct Supabase client with service role key for admin access
    // This bypasses RLS policies for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate numeric fields to prevent overflow
    const MAX_NUMERIC_VALUE = 99999999.99; // 10^8 - 0.01 (for precision 10, scale 2)
    
    // Helper function to validate and sanitize numeric values
    const sanitizeNumericField = (value: any, fieldName: string): number | null => {
      if (value === null || value === undefined) return null;
      
      const numValue = Number(value);
      if (isNaN(numValue)) {
        console.warn(`Invalid numeric value for ${fieldName}: ${value}`);
        return null;
      }
      
      if (Math.abs(numValue) >= MAX_NUMERIC_VALUE) {
        console.warn(`Value too large for ${fieldName}: ${numValue}, capping at ${MAX_NUMERIC_VALUE}`);
        return numValue > 0 ? MAX_NUMERIC_VALUE : -MAX_NUMERIC_VALUE;
      }
      
      return numValue;
    };

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
      latitude: sanitizeNumericField(data.latitude, 'latitude'),
      longitude: sanitizeNumericField(data.longitude, 'longitude'),
      size_sqft: sanitizeNumericField(data.size_sqft, 'size_sqft'),
      ceiling_height_ft: sanitizeNumericField(data.ceiling_height_ft, 'ceiling_height_ft'),
      width_ft: sanitizeNumericField(data.width_ft, 'width_ft'),
      length_ft: sanitizeNumericField(data.length_ft, 'length_ft'),
      amenities: data.amenities || [],
      nearby_facilities: data.nearby_facilities || [],
      additional_info: data.additional_info || null,
      price_per_hour: sanitizeNumericField(data.price_per_hour, 'price_per_hour'),
      price_per_day: sanitizeNumericField(data.price_per_day, 'price_per_day'),
      minimum_hours: sanitizeNumericField(data.minimum_hours, 'minimum_hours') || 1,
      discount_weekly: sanitizeNumericField(data.discount_weekly, 'discount_weekly') || 0,
      discount_monthly: sanitizeNumericField(data.discount_monthly, 'discount_monthly') || 0,
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
      max_guests: sanitizeNumericField(data.max_guests, 'max_guests') || 10, // Default value
      bedrooms: sanitizeNumericField(data.bedrooms, 'bedrooms') || 1, // Default value
      bathrooms: sanitizeNumericField(data.bathrooms, 'bathrooms') || 1, // Default value
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
      return NextResponse.json(
        { success: false, error: `Failed to create property: ${error.message}` },
        { status: 500 }
      )
    }

    // If we have images, save them to the property_images table
    if (data.images && data.images.length > 0) {
      const propertyId = property.id
      
      // Prepare the image data for insertion
      const imageData = data.images.map((image: any, index: number) => ({
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
    return NextResponse.json({ success: true, property })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      },
      { status: 500 }
    )
  }
}
