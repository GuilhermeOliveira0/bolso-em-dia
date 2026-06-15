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
          source: "manual";
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
          source?: "manual";
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
          source?: "manual";
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
          status: "uploaded";
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
          status?: "uploaded";
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
          status?: "uploaded";
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
