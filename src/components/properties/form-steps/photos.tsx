"use client"

import { useState, useCallback, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PropertyFormValues } from "@/lib/schemas/property-schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, Star, StarIcon, GripVertical, ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { v4 as uuidv4 } from 'uuid'

// Define the type for our image objects
type ImageFile = {
  path: string
  url: string
  name: string
  size: number
  type: string
  id: string
}

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Sortable image component
function SortableImage({ image, index, onRemove, onSetCover, isCover }: { 
  image: ImageFile, 
  index: number, 
  onRemove: (id: string) => void,
  onSetCover: (index: number) => void,
  isCover: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group bg-white border rounded-md overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={image.url}
          alt={image.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
      </div>
      
      <div className="absolute top-2 left-2 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-white drop-shadow-md" />
      </div>
      
      <div className="absolute top-2 right-2 flex gap-1">
        <Button 
          type="button" 
          variant="destructive" 
          size="icon" 
          className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(image.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <Button
        type="button"
        variant={isCover ? "default" : "outline"}
        size="sm"
        className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onSetCover(index)}
      >
        {isCover ? (
          <>
            <StarIcon className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            Cover
          </>
        ) : (
          <>
            <Star className="h-3 w-3 mr-1" />
            Set as Cover
          </>
        )}
      </Button>
      
      <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
        {(image.size / 1024 / 1024).toFixed(1)} MB
      </div>
    </div>
  )
}

export function PhotosStep() {
  const { control, setValue, watch } = useFormContext<PropertyFormValues>()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  
  // Watch the images and cover_image_index values
  const images = watch('images') || []
  const coverImageIndex = watch('cover_image_index')
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !session?.user?.id) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      const userId = session.user.id
      const newImages: ImageFile[] = []
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          console.error(`File type not allowed: ${file.type}`)
          continue
        }
        
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          console.error(`File too large: ${file.size} bytes`)
          continue
        }
        
        // Create a unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `properties/${userId}/${fileName}`
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file)
        
        if (error) {
          console.error('Error uploading file:', error)
          continue
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)
        
        // Add to our images array
        newImages.push({
          path: filePath,
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          id: uuidv4() // Generate a unique ID for drag and drop
        })
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }
      
      // Update the form with the new images
      setValue('images', [...images, ...newImages])
      
      // If this is the first image, set it as the cover
      if (images.length === 0 && newImages.length > 0 && coverImageIndex === undefined) {
        setValue('cover_image_index', 0)
      }
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [images, setValue, session, coverImageIndex])
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }
  
  // Handle removing an image
  const handleRemoveImage = async (id: string) => {
    const imageIndex = images.findIndex(img => img.id === id)
    if (imageIndex === -1) return
    
    const image = images[imageIndex]
    
    try {
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('property-images')
        .remove([image.path])
      
      if (error) {
        console.error('Error deleting file:', error)
        return
      }
      
      // Remove from our images array
      const newImages = [...images]
      newImages.splice(imageIndex, 1)
      setValue('images', newImages)
      
      // Update cover image index if needed
      if (coverImageIndex === imageIndex) {
        setValue('cover_image_index', newImages.length > 0 ? 0 : undefined)
      } else if (coverImageIndex !== undefined && coverImageIndex > imageIndex) {
        setValue('cover_image_index', coverImageIndex - 1)
      }
    } catch (error) {
      console.error('Error removing image:', error)
    }
  }
  
  // Handle setting an image as the cover
  const handleSetCover = (index: number) => {
    setValue('cover_image_index', index)
  }
  
  // Handle drag end (reordering)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id)
      const newIndex = images.findIndex(img => img.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with the reordered items
        const newImages = [...images]
        const [movedItem] = newImages.splice(oldIndex, 1)
        newImages.splice(newIndex, 0, movedItem)
        
        // Update the form
        setValue('images', newImages)
        
        // Update cover image index if needed
        if (coverImageIndex === oldIndex) {
          setValue('cover_image_index', newIndex)
        } else if (
          coverImageIndex !== undefined && 
          ((oldIndex < coverImageIndex && newIndex >= coverImageIndex) || 
           (oldIndex > coverImageIndex && newIndex <= coverImageIndex))
        ) {
          const newCoverIndex = oldIndex < coverImageIndex ? coverImageIndex - 1 : coverImageIndex + 1
          setValue('cover_image_index', newCoverIndex)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Property Photos</h2>
        <p className="text-muted-foreground">
          Upload high-quality photos of your property to attract more bookings.
        </p>
      </div>

      <Card className="p-6">
        <FormField
          control={control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Images</FormLabel>
              <FormDescription>
                Upload up to 10 images of your property. The first image will be used as the cover image.
                Drag and drop to reorder images. Images should be less than 5MB in size.
              </FormDescription>
              
              <FormControl>
                <div 
                  className={`
                    mt-2 border-2 border-dashed rounded-lg p-6 
                    ${dragActive ? 'border-primary bg-primary/5' : 'border-border'} 
                    transition-colors duration-200
                  `}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-center font-medium">
                      Drag and drop your images here, or click to browse
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                      Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
                    </p>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mt-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading... {uploadProgress}%
                        </>
                      ) : (
                        'Select Files'
                      )}
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </FormControl>
              
              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Uploaded Images</h3>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToParentElement]}
                  >
                    <SortableContext
                      items={images.map(img => img.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <SortableImage
                            key={image.id}
                            image={image}
                            index={index}
                            onRemove={handleRemoveImage}
                            onSetCover={handleSetCover}
                            isCover={coverImageIndex === index}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
              
              {images.length === 0 && !isUploading && (
                <div className="mt-6 flex flex-col items-center justify-center p-8 border rounded-md bg-muted/20">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    No images uploaded yet. Add photos to showcase your property.
                  </p>
                </div>
              )}
              
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>
    </div>
  )
}
