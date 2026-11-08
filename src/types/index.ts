export type ListingType = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'villa' | 'loft' | 'land';
export type UserRole = 'user' | 'admin';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  listing_type: ListingType;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  featured: boolean;
  created_at: string;
  created_by: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface PropertyFilters {
  listingType?: ListingType;
  query?: string;
  propertyType?: PropertyType | '';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSqft?: number;
  maxSqft?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export type ConversationStatus = 'open' | 'closed';
export type MessageSender = 'customer' | 'admin';

export interface Conversation {
  id: string;
  customer_name: string;
  customer_email: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  customer_unread_count: number;
  admin_unread_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  content: string;
  created_at: string;
}
