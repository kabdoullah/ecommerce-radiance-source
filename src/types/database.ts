export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          display_name: string;
          id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string;
          id: string;
          image_path: string | null;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          line_total: number;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          line_total: number;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: string;
          line_total?: number;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          admin_note: string | null;
          created_at: string;
          customer_name: string;
          customer_note: string | null;
          customer_phone: string;
          delivery_address: string | null;
          delivery_fee: number;
          id: string;
          order_number: string;
          paid_at: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          admin_note?: string | null;
          created_at?: string;
          customer_name: string;
          customer_note?: string | null;
          customer_phone: string;
          delivery_address?: string | null;
          delivery_fee?: number;
          id?: string;
          order_number: string;
          paid_at?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
        };
        Update: {
          admin_note?: string | null;
          created_at?: string;
          customer_name?: string;
          customer_note?: string | null;
          customer_phone?: string;
          delivery_address?: string | null;
          delivery_fee?: number;
          id?: string;
          order_number?: string;
          paid_at?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string;
          created_at: string;
          id: string;
          product_id: string;
          sort_order: number;
          storage_path: string;
        };
        ComputedFields: never;
        Insert: {
          alt_text?: string;
          created_at?: string;
          id?: string;
          product_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          compare_at_price: number | null;
          created_at: string;
          description: string;
          highlights: string;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          precautions: string;
          price: number;
          skin_type: string;
          slug: string;
          stock_quantity: number | null;
          subtitle: string;
          updated_at: string;
          usage_tips: string;
          volume: string;
        };
        ComputedFields: never;
        Insert: {
          category_id?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string;
          highlights?: string;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          precautions?: string;
          price: number;
          skin_type?: string;
          slug: string;
          stock_quantity?: number | null;
          subtitle?: string;
          updated_at?: string;
          usage_tips?: string;
          volume?: string;
        };
        Update: {
          category_id?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string;
          highlights?: string;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          precautions?: string;
          price?: number;
          skin_type?: string;
          slug?: string;
          stock_quantity?: number | null;
          subtitle?: string;
          updated_at?: string;
          usage_tips?: string;
          volume?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          author_name: string;
          comment: string;
          created_at: string;
          id: string;
          product_id: string;
          rating: number;
          status: Database["public"]["Enums"]["review_status"];
        };
        ComputedFields: never;
        Insert: {
          author_name: string;
          comment: string;
          created_at?: string;
          id?: string;
          product_id: string;
          rating: number;
          status?: Database["public"]["Enums"]["review_status"];
        };
        Update: {
          author_name?: string;
          comment?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
          rating?: number;
          status?: Database["public"]["Enums"]["review_status"];
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          about_highlights: string;
          about_image_path: string | null;
          about_text: string;
          about_title: string;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          delivery_fee: number | null;
          delivery_info: string | null;
          delivery_summary: string;
          facebook_url: string | null;
          footer_text: string;
          hero_image_path: string | null;
          hero_script: string;
          hero_side_quote: string;
          hero_subtitle: string;
          hero_title: string;
          id: boolean;
          instagram_url: string | null;
          logo_path: string | null;
          opening_hours: string | null;
          order_message_intro: string;
          payment_info: string;
          payment_summary: string;
          store_name: string;
          tagline: string;
          tiktok_url: string | null;
          updated_at: string;
          whatsapp_number: string | null;
        };
        ComputedFields: never;
        Insert: {
          about_highlights?: string;
          about_image_path?: string | null;
          about_text?: string;
          about_title?: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          delivery_fee?: number | null;
          delivery_info?: string | null;
          delivery_summary?: string;
          facebook_url?: string | null;
          footer_text?: string;
          hero_image_path?: string | null;
          hero_script?: string;
          hero_side_quote?: string;
          hero_subtitle?: string;
          hero_title?: string;
          id?: boolean;
          instagram_url?: string | null;
          logo_path?: string | null;
          opening_hours?: string | null;
          order_message_intro?: string;
          payment_info?: string;
          payment_summary?: string;
          store_name?: string;
          tagline?: string;
          tiktok_url?: string | null;
          updated_at?: string;
          whatsapp_number?: string | null;
        };
        Update: {
          about_highlights?: string;
          about_image_path?: string | null;
          about_text?: string;
          about_title?: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          delivery_fee?: number | null;
          delivery_info?: string | null;
          delivery_summary?: string;
          facebook_url?: string | null;
          footer_text?: string;
          hero_image_path?: string | null;
          hero_script?: string;
          hero_side_quote?: string;
          hero_subtitle?: string;
          hero_title?: string;
          id?: boolean;
          instagram_url?: string | null;
          logo_path?: string | null;
          opening_hours?: string | null;
          order_message_intro?: string;
          payment_info?: string;
          payment_summary?: string;
          store_name?: string;
          tagline?: string;
          tiktok_url?: string | null;
          updated_at?: string;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order: {
        Args: {
          p_customer_name: string;
          p_customer_note: string;
          p_customer_phone: string;
          p_delivery_address: string;
          p_items: Json;
        };
        Returns: Json;
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      order_status_rank: {
        Args: { s: Database["public"]["Enums"]["order_status"] };
        Returns: number;
      };
      submit_review: {
        Args: { p_author_name: string; p_comment: string; p_product_id: string; p_rating: number };
        Returns: undefined;
      };
    };
    Enums: {
      order_status: "pending" | "confirmed" | "preparing" | "shipping" | "completed" | "cancelled";
      payment_status: "unpaid" | "paid";
      review_status: "pending" | "approved" | "hidden";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: ["pending", "confirmed", "preparing", "shipping", "completed", "cancelled"],
      payment_status: ["unpaid", "paid"],
      review_status: ["pending", "approved", "hidden"],
    },
  },
} as const;
