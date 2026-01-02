/**
 * Database Types
 *
 * TypeScript types for the Supabase database schema.
 * These are used for type-safe database operations.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          desired_job_title: string | null;
          desired_salary_min: number | null;
          desired_salary_max: number | null;
          desired_location: string | null;
          remote_preference: 'remote' | 'hybrid' | 'onsite' | 'any' | null;
          resume_data: Record<string, any> | null;
          subscription_tier: 'free' | 'starter' | 'pro' | 'unlimited';
          applications_this_month: number;
          applications_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          desired_job_title?: string | null;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          desired_location?: string | null;
          remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any' | null;
          resume_data?: Record<string, any> | null;
          subscription_tier?: 'free' | 'starter' | 'pro' | 'unlimited';
          applications_this_month?: number;
          applications_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          desired_job_title?: string | null;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          desired_location?: string | null;
          remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any' | null;
          resume_data?: Record<string, any> | null;
          subscription_tier?: 'free' | 'starter' | 'pro' | 'unlimited';
          applications_this_month?: number;
          applications_reset_date?: string;
          updated_at?: string;
        };
      };

      site_connections: {
        Row: {
          id: string;
          user_id: string;
          site_id: string;
          site_name: string;
          is_connected: boolean;
          last_verified_at: string | null;
          session_data_encrypted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          site_id: string;
          site_name: string;
          is_connected?: boolean;
          last_verified_at?: string | null;
          session_data_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          site_id?: string;
          site_name?: string;
          is_connected?: boolean;
          last_verified_at?: string | null;
          session_data_encrypted?: string | null;
          updated_at?: string;
        };
      };

      job_applications: {
        Row: {
          id: string;
          user_id: string;
          site_id: string;
          job_title: string;
          company_name: string | null;
          job_url: string | null;
          job_location: string | null;
          salary_range: string | null;
          status: 'pending' | 'in_progress' | 'applied' | 'failed' | 'skipped';
          applied_at: string | null;
          error_message: string | null;
          screenshot_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          site_id: string;
          job_title: string;
          company_name?: string | null;
          job_url?: string | null;
          job_location?: string | null;
          salary_range?: string | null;
          status?: 'pending' | 'in_progress' | 'applied' | 'failed' | 'skipped';
          applied_at?: string | null;
          error_message?: string | null;
          screenshot_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          site_id?: string;
          job_title?: string;
          company_name?: string | null;
          job_url?: string | null;
          job_location?: string | null;
          salary_range?: string | null;
          status?: 'pending' | 'in_progress' | 'applied' | 'failed' | 'skipped';
          applied_at?: string | null;
          error_message?: string | null;
          screenshot_url?: string | null;
          updated_at?: string | null;
        };
      };

      job_queue: {
        Row: {
          id: string;
          user_id: string;
          queue_name: string;
          job_type: string;
          payload: Record<string, any>;
          status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
          priority: number;
          attempts: number;
          max_attempts: number;
          scheduled_for: string | null;
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          queue_name?: string;
          job_type: string;
          payload?: Record<string, any>;
          status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
          priority?: number;
          attempts?: number;
          max_attempts?: number;
          scheduled_for?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          queue_name?: string;
          job_type?: string;
          payload?: Record<string, any>;
          status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
          priority?: number;
          attempts?: number;
          max_attempts?: number;
          scheduled_for?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          updated_at?: string;
        };
      };

      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          cost_cents: number;
          details: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          cost_cents?: number;
          details?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          cost_cents?: number;
          details?: Record<string, any>;
        };
      };
    };

    Views: {
      user_dashboard_stats: {
        Row: {
          user_id: string;
          subscription_tier: string;
          applications_this_month: number;
          applications_limit: number;
          connected_sites: number;
          total_applied: number;
          pending_applications: number;
          queue_size: number;
        };
      };
    };

    Functions: {
      can_user_apply: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      increment_application_count: {
        Args: { p_user_id: string };
        Returns: void;
      };
      reset_monthly_applications: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
