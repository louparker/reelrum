# ReelRum Database Schema

This document outlines the database schema for the ReelRum platform, including tables, relationships, and security policies.

## Tables

### profiles
Extends the Supabase auth.users table with additional user information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| avatar_url | TEXT | URL to user's avatar image |
| email | TEXT | User's email (unique) |
| phone | TEXT | User's phone number |
| bio | TEXT | User's biography |
| is_provider | BOOLEAN | Whether the user is a property provider |
| stripe_customer_id | TEXT | Stripe customer ID for payments |
| stripe_account_id | TEXT | Stripe connect account ID for providers |

### properties
Stores information about properties available for rent.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| user_id | UUID | References profiles(id), property owner |
| title | TEXT | Property title |
| description | TEXT | Property description |
| property_type | TEXT | Type of property (studio, house, etc.) |
| address | JSONB | Property address as JSON |
| dimensions | JSONB | Property dimensions as JSON |
| amenities | TEXT[] | Array of available amenities |
| nearby_facilities | TEXT[] | Array of nearby facilities |
| hourly_rate | INTEGER | Hourly rental rate in cents |
| daily_rate | INTEGER | Daily rental rate in cents |
| images | TEXT[] | Array of image URLs |
| is_published | BOOLEAN | Whether the property is published |
| avg_rating | NUMERIC | Average rating from reviews |

### availability
Tracks availability and special pricing for properties.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| property_id | UUID | References properties(id) |
| date | DATE | The date |
| is_available | BOOLEAN | Whether the property is available on this date |
| special_price | INTEGER | Special price for this date (if any) |

### bookings
Stores booking information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| property_id | UUID | References properties(id) |
| user_id | UUID | References profiles(id), the renter |
| start_date | TIMESTAMP | Booking start date and time |
| end_date | TIMESTAMP | Booking end date and time |
| total_price | INTEGER | Total price in cents |
| status | TEXT | Booking status (pending, confirmed, cancelled, completed) |
| payment_intent_id | TEXT | Stripe payment intent ID |
| payment_status | TEXT | Payment status (unpaid, paid, refunded) |
| special_requests | TEXT | Special requests from the renter |

### reviews
Stores reviews for properties.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| property_id | UUID | References properties(id) |
| booking_id | UUID | References bookings(id) |
| user_id | UUID | References profiles(id), reviewer |
| rating | INTEGER | Rating (1-5) |
| comment | TEXT | Review comment |
| response | TEXT | Owner's response to the review |
| response_at | TIMESTAMP | When the response was added |

### saved_properties
Tracks users' saved/favorite properties.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| user_id | UUID | References profiles(id) |
| property_id | UUID | References properties(id) |

### notifications
Stores user notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| user_id | UUID | References profiles(id) |
| type | TEXT | Notification type |
| message | TEXT | Notification message |
| is_read | BOOLEAN | Whether the notification has been read |
| data | JSONB | Additional data as JSON |

### documents
Stores legal documents and contracts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| user_id | UUID | References profiles(id) |
| booking_id | UUID | References bookings(id), optional |
| property_id | UUID | References properties(id), optional |
| type | TEXT | Document type |
| name | TEXT | Document name |
| url | TEXT | Document URL |
| status | TEXT | Document status (pending, signed, rejected) |

## Relationships

- **profiles** ← one-to-many → **properties**: A user can own multiple properties
- **profiles** ← one-to-many → **bookings**: A user can make multiple bookings
- **profiles** ← one-to-many → **reviews**: A user can write multiple reviews
- **profiles** ← one-to-many → **saved_properties**: A user can save multiple properties
- **profiles** ← one-to-many → **notifications**: A user can have multiple notifications
- **profiles** ← one-to-many → **documents**: A user can have multiple documents

- **properties** ← one-to-many → **availability**: A property has multiple availability dates
- **properties** ← one-to-many → **bookings**: A property can have multiple bookings
- **properties** ← one-to-many → **reviews**: A property can have multiple reviews
- **properties** ← one-to-many → **saved_properties**: A property can be saved by multiple users
- **properties** ← one-to-many → **documents**: A property can have multiple documents

- **bookings** ← one-to-one → **reviews**: A booking can have one review
- **bookings** ← one-to-many → **documents**: A booking can have multiple documents

## Row Level Security (RLS) Policies

All tables have Row Level Security enabled with policies that:

1. Restrict data access based on user roles and ownership
2. Allow users to view their own data
3. Allow property owners to manage their properties and related data
4. Allow public access to published property information
5. Protect sensitive user data from unauthorized access

See the `02_rls_policies.sql` file for detailed security policies.
