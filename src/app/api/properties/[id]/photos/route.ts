import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Supported image types
const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Get Supabase client
    const supabase = await createServerSupabaseClient()
    
    // Verify the user owns this property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("user_id")
      .eq("id", propertyId)
      .single()
    
    if (propertyError) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      )
    }
    
    if (property.user_id !== userId) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to upload photos for this property" },
        { status: 403 }
      )
    }
    
    // Parse the multipart form data
    const formData = await request.formData()
    
    // Get all files from the form data
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        files.push(value)
      }
    }
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      )
    }
    
    // Validate files
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} exceeds the maximum size of 5MB` },
          { status: 400 }
        )
      }
      
      // Check file type
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} has an unsupported format` },
          { status: 400 }
        )
      }
    }
    
    // Upload files to Supabase Storage
    const uploadResults = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Generate a unique file name
      const timestamp = Date.now()
      const extension = file.name.split(".").pop()
      const fileName = `${propertyId}_${timestamp}_${i}.${extension}`
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("property-images")
        .upload(`${propertyId}/${fileName}`, file, {
          contentType: file.type,
          upsert: false,
        })
      
      if (uploadError) {
        console.error(`Error uploading ${file.name}:`, uploadError)
        return NextResponse.json(
          { success: false, message: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        )
      }
      
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase
        .storage
        .from("property-images")
        .getPublicUrl(`${propertyId}/${fileName}`)
      
      const publicUrl = publicUrlData.publicUrl
      
      // Insert a record in the property_images table
      const { data: imageData, error: imageError } = await supabase
        .from("property_images")
        .insert({
          property_id: propertyId,
          storage_path: `${propertyId}/${fileName}`,
          url: publicUrl,
          position: i, // Use the index as the initial position
          is_primary: i === 0, // Make the first image the primary image
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (imageError) {
        console.error(`Error saving image record for ${file.name}:`, imageError)
        return NextResponse.json(
          { success: false, message: `Failed to save image record: ${imageError.message}` },
          { status: 500 }
        )
      }
      
      uploadResults.push({
        fileName,
        publicUrl,
        imageData,
      })
    }
    
    // Revalidate the property page to show the new images
    revalidatePath(`/properties/${propertyId}`)
    revalidatePath(`/dashboard`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${files.length} images`,
      data: uploadResults,
    })
  } catch (error) {
    console.error("Error in property photos API:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      },
      { status: 500 }
    )
  }
}
