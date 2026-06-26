export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          date: string;
          category: string;
          expense_type: string;
          payment_method: string;
          source: "manual" | "ocr";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description?: string;
          date: string;
          category: string;
          expense_type: string;
          payment_method: string;
          source?: "manual" | "ocr";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          date?: string;
          category?: string;
          expense_type?: string;
          payment_method?: string;
          source?: "manual" | "ocr";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      receipts: {
        Row: {
          id: string;
          user_id: string;
          expense_id: string | null;
          file_path: string;
          file_name: string;
          file_type: "image/png" | "image/jpeg" | "image/webp";
          file_size: number;
          status: "uploaded" | "processing" | "processed" | "failed" | "reviewed";
          ocr_text: string | null;
          extracted_amount: number | null;
          extracted_date: string | null;
          extracted_recipient: string | null;
          ocr_status: "pending" | "processing" | "processed" | "failed" | null;
          ocr_confidence: number | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expense_id?: string | null;
          file_path: string;
          file_name: string;
          file_type: "image/png" | "image/jpeg" | "image/webp";
          file_size: number;
          status?: "uploaded" | "processing" | "processed" | "failed" | "reviewed";
          ocr_text?: string | null;
          extracted_amount?: number | null;
          extracted_date?: string | null;
          extracted_recipient?: string | null;
          ocr_status?: "pending" | "processing" | "processed" | "failed" | null;
          ocr_confidence?: number | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          expense_id?: string | null;
          file_path?: string;
          file_name?: string;
          file_type?: "image/png" | "image/jpeg" | "image/webp";
          file_size?: number;
          status?: "uploaded" | "processing" | "processed" | "failed" | "reviewed";
          ocr_text?: string | null;
          extracted_amount?: number | null;
          extracted_date?: string | null;
          extracted_recipient?: string | null;
          ocr_status?: "pending" | "processing" | "processed" | "failed" | null;
          ocr_confidence?: number | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "receipts_expense_id_fkey";
            columns: ["expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
        ];
      };
      user_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_expense_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_expense_types_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_payment_methods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_payment_methods_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
