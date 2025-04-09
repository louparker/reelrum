-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view any profile
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Properties policies
-- Properties are viewable by everyone if published
CREATE POLICY "Published properties are viewable by everyone" 
ON properties FOR SELECT 
USING (is_published = true OR auth.uid() = user_id);

-- Only property owners can update their properties
CREATE POLICY "Property owners can update their properties" 
ON properties FOR UPDATE 
USING (auth.uid() = user_id);

-- Only property owners can delete their properties
CREATE POLICY "Property owners can delete their properties" 
ON properties FOR DELETE 
USING (auth.uid() = user_id);

-- Only authenticated users can insert properties
CREATE POLICY "Authenticated users can insert properties" 
ON properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Availability policies
-- Availability is viewable by everyone
CREATE POLICY "Availability is viewable by everyone" 
ON availability FOR SELECT 
USING (true);

-- Only property owners can update availability
CREATE POLICY "Property owners can update availability" 
ON availability FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = availability.property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Only property owners can insert availability
CREATE POLICY "Property owners can insert availability" 
ON availability FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Only property owners can delete availability
CREATE POLICY "Property owners can delete availability" 
ON availability FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = availability.property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Bookings policies
-- Users can view bookings they're involved in
CREATE POLICY "Users can view their bookings" 
ON bookings FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = bookings.property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Users can insert bookings for themselves
CREATE POLICY "Users can insert bookings" 
ON bookings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings" 
ON bookings FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = bookings.property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Reviews policies
-- Reviews are viewable by everyone
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

-- Users can insert reviews for their own bookings
CREATE POLICY "Users can insert reviews for their bookings" 
ON reviews FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = booking_id 
    AND bookings.user_id = auth.uid()
    AND bookings.status = 'completed'
  )
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- Property owners can update reviews to add responses
CREATE POLICY "Property owners can update reviews to add responses" 
ON reviews FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = reviews.property_id 
    AND properties.user_id = auth.uid()
  )
);

-- Saved properties policies
-- Users can view their saved properties
CREATE POLICY "Users can view their saved properties" 
ON saved_properties FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert saved properties
CREATE POLICY "Users can insert saved properties" 
ON saved_properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their saved properties
CREATE POLICY "Users can delete their saved properties" 
ON saved_properties FOR DELETE 
USING (auth.uid() = user_id);

-- Notifications policies
-- Users can view their notifications
CREATE POLICY "Users can view their notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update their notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Documents policies
-- Users can view documents they're involved in
CREATE POLICY "Users can view their documents" 
ON documents FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = documents.property_id 
    AND properties.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = documents.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Users can insert documents
CREATE POLICY "Users can insert documents" 
ON documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" 
ON documents FOR UPDATE 
USING (auth.uid() = user_id);
