'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  Grid,
  List,
  Calendar
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { format } from 'date-fns';

type Property = {
  id: string;
  name: string;
  status: string;
  property_type: string;
  created_at: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  description: string;
  bookings_count?: number;
  views_count?: number;
  property_photos: {
    id: string;
    image_url: string;
    is_main_image: boolean;
  }[];
};

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      try {
        console.log('Fetching properties for user ID:', user.id);
        
        // Fetch all properties for the current user
        // We need to query with OR condition since the database has both user_id and owner_id fields
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            property_photos (
              id, image_url, is_main_image
            )
          `)
          .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        
        console.log('Properties query result:', { data, error });
          
        if (error) throw error;
        
        // Add placeholder stats for now
        const propertiesWithStats = data?.map(property => ({
          ...property,
          bookings_count: Math.floor(Math.random() * 5),
          views_count: Math.floor(Math.random() * 100) + 10
        })) || [];
        
        console.log('Properties with stats:', propertiesWithStats);
        setProperties(propertiesWithStats);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProperties();
  }, [user]);

  // Filter properties based on search query and status filter
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchQuery || 
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !filterStatus || property.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Handle property deletion
  const confirmDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;
    
    setIsLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      // Delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete.id);
        
      if (error) throw error;
      
      // Update local state
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get primary image URL or a placeholder
  const getPrimaryImageUrl = (property: Property) => {
    console.log('Property photos for', property.name, ':', property.property_photos);
    const primaryImage = property.property_photos?.find(img => img.is_main_image);
    return primaryImage?.image_url || property.property_photos?.[0]?.image_url || '';
  };

  // Property type display name
  const getPropertyTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'residential': 'Residential',
      'commercial': 'Commercial',
      'industrial': 'Industrial',
      'land': 'Land',
      'studio': 'Studio',
      'outdoor': 'Outdoor'
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your property listings
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button asChild>
            <Link href="/properties/list">
              <Plus className="h-4 w-4 mr-2" />
              List New Property
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Status
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                All Properties
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filter Pills */}
      {filterStatus && (
        <div className="flex gap-2 mb-6">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            Status: {filterStatus}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 ml-1 p-0"
              onClick={() => setFilterStatus(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-800 h-20 rounded-md animate-pulse" />
          ))}
        </div>
      )}
      
      {/* Properties List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="space-y-4">
          {filteredProperties.length > 0 ? (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm text-muted-foreground">
                <div className="col-span-5">Property</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Added</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {filteredProperties.map(property => (
                <div 
                  key={property.id}
                  className="border rounded-lg bg-card hover:bg-accent/40 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-1 md:col-span-5 flex items-center">
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 mr-3 flex-shrink-0">
                        {getPrimaryImageUrl(property) ? (
                          <img 
                            src={getPrimaryImageUrl(property)} 
                            alt={property.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building className="h-full w-full p-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{property.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {property.address?.city}, {property.address?.state}
                        </div>
                        
                        <div className="flex items-center text-xs text-muted-foreground space-x-2 mt-1 md:hidden">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {property.views_count}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {property.bookings_count}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 text-sm">
                      <span className="md:hidden font-medium mr-2">Type:</span>
                      {getPropertyTypeDisplay(property.property_type)}
                    </div>
                    
                    <div className="col-span-1">
                      <span className="md:hidden font-medium mr-2">Status:</span>
                      <Badge variant={
                        property.status === 'active' ? 'success' :
                        property.status === 'draft' ? 'secondary' : 'outline'
                      }>
                        {property.status === 'active' ? 'Active' : 
                         property.status === 'draft' ? 'Draft' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 text-sm">
                      <span className="md:hidden font-medium mr-2">Added:</span>
                      {format(new Date(property.created_at), 'MMM d, yyyy')}
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex items-center justify-end md:justify-start gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/properties/${property.id}`}>
                          <Eye className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">View</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/properties/${property.id}/edit`}>
                          <Edit className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Edit</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => confirmDelete(property)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Building className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-medium">No properties found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {properties.length === 0 
                  ? "You haven't listed any properties yet." 
                  : "No properties match your current filters."
                }
              </p>
              {properties.length === 0 && (
                <Button asChild className="mt-4">
                  <Link href="/properties/list">
                    <Plus className="h-4 w-4 mr-2" />
                    List Your First Property
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Properties Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <Card key={property.id} className="overflow-hidden flex flex-col h-full">
                <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {getPrimaryImageUrl(property) ? (
                    <img 
                      src={getPrimaryImageUrl(property)} 
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building className="h-full w-full p-8 text-muted-foreground" />
                  )}
                  <Badge 
                    variant={
                      property.status === 'active' ? 'success' :
                      property.status === 'draft' ? 'secondary' : 'outline'
                    }
                    className="absolute top-2 right-2"
                  >
                    {property.status === 'active' ? 'Active' : 
                     property.status === 'draft' ? 'Draft' : 'Inactive'}
                  </Badge>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate">{property.name}</CardTitle>
                  <CardDescription className="truncate">
                    {property.address?.city}, {property.address?.state}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{getPropertyTypeDisplay(property.property_type)}</span>
                    <span>{format(new Date(property.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-muted-foreground space-x-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {property.views_count} views
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {property.bookings_count} bookings
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t flex gap-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/properties/${property.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/properties/${property.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => confirmDelete(property)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 space-y-3">
              <Building className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-medium">No properties found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {properties.length === 0 
                  ? "You haven't listed any properties yet." 
                  : "No properties match your current filters."
                }
              </p>
              {properties.length === 0 && (
                <Button asChild className="mt-4">
                  <Link href="/properties/list">
                    <Plus className="h-4 w-4 mr-2" />
                    List Your First Property
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
