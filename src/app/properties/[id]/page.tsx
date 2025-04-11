import React from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/auth-server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Home, 
  Ruler, 
  ClipboardList,
  Camera,
  Edit,
  Share2
} from "lucide-react"

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = await createServerSupabaseClient()
  const session = await getServerSession(authOptions)
  
  // Fetch the property details
  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      ),
      property_images (
        id,
        url,
        is_primary,
        position
      )
    `)
    .eq("id", id)
    .single()
  
  if (error || !property) {
    console.error("Error fetching property:", error)
    notFound()
  }
  
  // Sort images by position
  const sortedImages = [...property.property_images].sort((a, b) => a.position - b.position)
  
  // Check if the current user is the owner of this property
  const isOwner = session?.user?.id === property.user_id
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }
  
  // Get the primary image or the first image
  const primaryImage = sortedImages.find(img => img.is_primary) || sortedImages[0]
  
  // Format the property status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>
      case "published":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Published</Badge>
      case "archived":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{property.name}</h1>
            {getStatusBadge(property.status)}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {property.city}, {property.state}, {property.country}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/properties/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/properties/${id}/photos`}>
                  <Camera className="mr-2 h-4 w-4" />
                  Manage Photos
                </Link>
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Property Images */}
          <Card className="mb-6 overflow-hidden">
            <div className="relative aspect-video">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Home className="h-16 w-16 text-gray-400" />
                  <p className="text-gray-500 mt-2">No images available</p>
                </div>
              )}
            </div>
            
            {sortedImages.length > 1 && (
              <div className="p-4 overflow-x-auto">
                <div className="flex gap-2">
                  {sortedImages.map((image) => (
                    <div 
                      key={image.id} 
                      className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 ${
                        image.is_primary ? 'border-rum-500' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={property.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          {/* Property Details Tabs */}
          <Tabs defaultValue="details" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{property.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Location</h3>
                <p className="text-gray-700">
                  {property.address_line1}
                  {property.address_line2 && <>, {property.address_line2}</>}<br />
                  {property.city}, {property.state} {property.postal_code}<br />
                  {property.country}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Ruler className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-medium">{property.size_sqft} sq ft</p>
                    </div>
                  </div>
                  
                  {property.ceiling_height_ft && (
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Ceiling Height</p>
                        <p className="font-medium">{property.ceiling_height_ft} ft</p>
                      </div>
                    </div>
                  )}
                  
                  {property.width_ft && (
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Width</p>
                        <p className="font-medium">{property.width_ft} ft</p>
                      </div>
                    </div>
                  )}
                  
                  {property.length_ft && (
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Length</p>
                        <p className="font-medium">{property.length_ft} ft</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="amenities">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Amenities</h3>
                  {property.amenities && property.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity: string) => (
                        <div key={amenity} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-rum-500 mr-2" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No amenities listed</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Nearby Facilities</h3>
                  {property.nearby_facilities && property.nearby_facilities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {property.nearby_facilities.map((facility: string) => (
                        <div key={facility} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-teal-500 mr-2" />
                          <span className="text-gray-700">{facility}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No nearby facilities listed</p>
                  )}
                </div>
                
                {property.additional_info && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                    <p className="text-gray-700">{property.additional_info}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rules">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">House Rules</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {property.no_smoking && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                        <span className="text-gray-700">No Smoking</span>
                      </div>
                    )}
                    {property.no_pets && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                        <span className="text-gray-700">No Pets</span>
                      </div>
                    )}
                    {property.no_parties && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                        <span className="text-gray-700">No Parties</span>
                      </div>
                    )}
                    {property.noise_restrictions && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                        <span className="text-gray-700">Noise Restrictions</span>
                      </div>
                    )}
                  </div>
                  
                  {property.rules && (
                    <div className="mt-4">
                      <p className="text-gray-700">{property.rules}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Cancellation Policy</h3>
                  <p className="text-gray-700">{property.cancellation_policy}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          {/* Pricing Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Pricing</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Hourly Rate</span>
                  </div>
                  <span className="font-semibold">{formatPrice(property.price_per_hour)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Daily Rate</span>
                  </div>
                  <span className="font-semibold">{formatPrice(property.price_per_day)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Minimum Booking</span>
                  </div>
                  <span className="font-semibold">{property.minimum_hours} hours</span>
                </div>
                
                {(property.discount_weekly > 0 || property.discount_monthly > 0) && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium mb-2">Discounts</h4>
                    
                    {property.discount_weekly > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Weekly Discount</span>
                        <span className="font-medium text-green-600">{property.discount_weekly}% off</span>
                      </div>
                    )}
                    
                    {property.discount_monthly > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Monthly Discount</span>
                        <span className="font-medium text-green-600">{property.discount_monthly}% off</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="rum">
                Check Availability
              </Button>
            </CardFooter>
          </Card>
          
          {/* Owner Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Property Owner</h3>
              
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-4">
                  {property.profiles.avatar_url ? (
                    <Image
                      src={property.profiles.avatar_url}
                      alt={property.profiles.full_name || "Property Owner"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-rum-100 text-rum-800 font-semibold text-lg">
                      {(property.profiles.full_name || "U").charAt(0)}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="font-medium">
                    {property.profiles.full_name || "Property Owner"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(property.created_at).getFullYear()}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Contact Host
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
