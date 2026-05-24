export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          reputation_points: number;
          role: "member" | "trusted" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          reputation_points?: number;
          role?: "member" | "trusted" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          reputation_points?: number;
          role?: "member" | "trusted" | "admin";
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type Tool = {
  id: string
  slug: string
  name: string
  description: string
  homepage_url: string
  repo_url: string | null
  logo_url: string | null
  normalized_url: string
  pricing_model: 'open_source' | 'freemium' | 'paid' | 'free'
  deployment: string[]
  is_byok: boolean
  has_api: boolean
  submitted_by: string | null
  is_pinned: boolean
  pin_order: number | null
  upvote_count: number
  search_vector: string | null
  created_at: string
  updated_at: string
}

export type Tag = {
  id: string
  name: string
  slug: string
  type: string
  created_at: string
}

export type ToolTag = {
  tool_id: string
  tag_id: string
}

export type ToolMedia = {
  id: string
  tool_id: string
  type: 'image' | 'video'
  url: string
  added_by: string | null
  created_at: string
}

export type Upvote = {
  user_id: string
  tool_id: string
  created_at: string
}

export type Favorite = {
  user_id: string
  tool_id: string
  created_at: string
}

export type Review = {
  id: string
  tool_id: string
  user_id: string
  rating: number
  body: string
  created_at: string
}

export type Comment = {
  id: string
  tool_id: string
  parent_id: string | null
  user_id: string
  body: string
  created_at: string
}

export type Collection = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string
  is_public: boolean
  created_at: string
}

export type CollectionItem = {
  collection_id: string
  tool_id: string
  position: number
}
