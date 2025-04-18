'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUp, 
  ArrowDown, 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Eye, 
  Plus,
  ChevronRight,
  Camera
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { createBrowserClient } from '@supabase/ssr';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    totalEarnings: 0,
    propertyViews: 0,
    notifications: 0,
    rating: 0,
    joinedDays: 0,
    completionPercentage: 0
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      setIsLoading(true);
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      try {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no profile found, which we'll handle
          console.error('Error fetching profile:', profileError);
        }
        
        // Set user profile data
        setUserProfile(profileData || {
          id: user.id,
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: '',
          email: user.email || '',
          created_at: new Date().toISOString()
        });
        
        // Fetch property count
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id, created_at, name, title, status, property_type, address, property_photos(id, image_url, is_main_image)')
          .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (propertiesError) throw propertiesError;
        
        // Fetch bookings data
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id, created_at, start_date, end_date, status, total_price, 
            properties(id, name, title),
            profiles(id, full_name, avatar_url)
          `)
          .or(`renter_id.eq.${user.id},properties.owner_id.eq.${user.id}`)
          .order('start_date', { ascending: true })
          .limit(5);
          
        if (bookingsError) throw bookingsError;
        
        // Calculate earnings from bookings
        const earnings = bookings?.reduce((sum, booking) => {
          return booking.status === 'completed' ? sum + (booking.total_price || 0) : sum;
        }, 0);
        
        // Fetch property views (placeholder for now)
        const propertyViews = properties?.reduce((sum, property) => {
          // In a real app, this would come from analytics data
          return sum + Math.floor(Math.random() * 100);
        }, 0);
        
        // Fetch recent activity (combine various actions)
        const recentActivity = [
          ...bookings?.map(booking => ({
            type: 'booking',
            data: booking,
            date: new Date(booking.created_at),
            message: `New booking for ${booking.properties?.name || 'a property'}`
          })) || [],
          ...properties?.map(property => ({
            type: 'property',
            data: property,
            date: new Date(property.created_at),
            message: `Listed property: ${property.title || property.name || 'New property'}`
          })) || []
        ].sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);
        
        setActivity(recentActivity);
        
        // Calculate profile completion percentage
        const profileFields = profileData ? Object.keys(profileData).filter(k => 
          k !== 'id' && k !== 'created_at' && k !== 'updated_at'
        ) : [];
        const filledFields = profileFields.filter(k => !!profileData[k]);
        const completionPercentage = profileFields.length > 0 
          ? Math.round((filledFields.length / profileFields.length) * 100) 
          : 0;
        
        // Calculate days since joined
        const joinedDate = profileData?.created_at || new Date().toISOString();
        const daysSinceJoined = Math.floor((new Date().getTime() - new Date(joinedDate).getTime()) / (1000 * 60 * 60 * 24));
        
        // Set dashboard data
        setStats({
          totalProperties: properties?.length || 0,
          activeBookings: bookings?.filter(b => ['confirmed', 'pending'].includes(b.status))?.length || 0,
          totalEarnings: earnings || 0,
          propertyViews: propertyViews || 0,
          notifications: Math.floor(Math.random() * 10), // Placeholder
          rating: 4.7, // Placeholder
          joinedDays: daysSinceJoined,
          completionPercentage: completionPercentage
        });
        
        setRecentProperties(properties?.slice(0, 3) || []);
        setUpcomingBookings(
          bookings?.filter(b => new Date(b.start_date) > new Date())?.slice(0, 3) || []
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
            {stats.joinedDays > 0 && <span className="text-xs text-muted-foreground ml-2">
              • Member for {stats.joinedDays} {stats.joinedDays === 1 ? 'day' : 'days'}
            </span>}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/properties/list">
              <Plus className="h-4 w-4 mr-2" />
              List New Property
            </Link>
          </Button>
        </div>
      </div>
      
      {/* User Profile Summary */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-card">
                  <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || 'User'} />
                  <AvatarFallback className="text-xl">
                    {(userProfile?.full_name || 'U').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Link href="/dashboard/profile" className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="flex-grow space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{userProfile?.full_name || 'Complete Your Profile'}</h3>
                <p className="text-muted-foreground">{userProfile?.email || user?.email}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-1">Profile completion: {stats.completionPercentage}%</p>
                  <Progress value={stats.completionPercentage} className="h-2" />
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard/profile">
                    Complete Profile
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-2 md:border-l md:pl-6">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{stats.totalProperties > 0 ? 'Host' : 'Guest'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Rating:</span>
                <span className="font-medium">{stats.rating}/5.0</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Properties:</span>
                <span className="font-medium">{stats.totalProperties}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProperties > 0
                ? `${Math.floor(stats.totalProperties * 0.8)} active`
                : 'No properties yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeBookings > 0
                ? `${Math.ceil(stats.activeBookings * 0.3)} need action`
                : 'No active bookings'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Property Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.propertyViews.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>18% increase</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Activity & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent activity on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'booking' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {item.type === 'booking' ? (
                          <Calendar className={`h-5 w-5 ${item.type === 'booking' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                        ) : (
                          <Building className={`h-5 w-5 ${item.type === 'booking' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.message}</div>
                        <div className="text-sm text-muted-foreground">{formatDistanceToNow(item.date, { addSuffix: true })}</div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={item.type === 'booking' ? `/bookings/${item.data.id}` : `/properties/${item.data.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="font-medium">No recent activity</h3>
                  <p className="text-sm text-muted-foreground">
                    Your recent activity will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        
          {/* Properties */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Your Properties</CardTitle>
                <CardDescription>
                  Properties you have listed.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/properties">
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentProperties.length > 0 ? (
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <div key={property.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="w-16 h-16 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                        {property.property_photos?.find((photo: any) => photo.is_main_image)?.image_url ? (
                          <img 
                            src={property.property_photos.find((photo: any) => photo.is_main_image)?.image_url} 
                            alt={property.title || property.name || 'Property'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Building className="w-full h-full p-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{property.title || property.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{property.address}</div>
                        <div className="flex items-center text-xs mt-1 space-x-2">
                          <span className={`px-2 py-0.5 rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {property.status === 'active' ? 'Active' : 'Draft'}
                          </span>
                          <span className="text-muted-foreground">{property.property_type}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/properties/${property.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Building className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="font-medium">No properties yet</h3>
                  <p className="text-sm text-muted-foreground">
                    List your first property to get started.
                  </p>
                  <Button className="mt-2" asChild>
                    <Link href="/properties/list">
                      <Plus className="h-4 w-4 mr-2" />
                      List a Property
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Side - Bookings & Info */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">Booking Rate</div>
                  <div>72%</div>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">Response Rate</div>
                  <div>94%</div>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">Rating</div>
                  <div className="flex items-center">
                    {stats.rating}
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                  </div>
                </div>
                <Progress value={stats.rating * 20} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>
                Your scheduled bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                        {booking.profiles?.avatar_url ? (
                          <img 
                            src={booking.profiles.avatar_url} 
                            alt={booking.profiles.first_name || 'User'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Users className="w-full h-full p-2 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{booking.profiles?.first_name || 'Anonymous User'}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {booking.properties?.name}
                        </div>
                        <div className="flex items-center text-xs mt-1 space-x-2">
                          <span className={`px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="font-medium">No upcoming bookings</h3>
                  <p className="text-sm text-muted-foreground">
                    Bookings will appear here once you receive them.
                  </p>
                </div>
              )}
            </CardContent>
            {upcomingBookings.length > 0 && (
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/bookings">View All Bookings</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg text-sm">
                  <p><strong>Pro tip:</strong> Complete your profile to attract more bookings.</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm">
                  <p><strong>Did you know?</strong> Properties with 5+ high-quality photos get 40% more views.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
