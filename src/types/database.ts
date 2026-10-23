export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type Timestamped = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Timestamped & {
          slug: string;
          name: string;
          headline: string | null;
          subtitle: string | null;
          introduction: string | null;
          biography: string | null;
          professional_interests: string[];
          working_approach: string[];
          social_links: Json;
          availability_label: string | null;
          is_available: boolean;
          avatar_url: string | null;
          avatar_alt: string | null;
          professional_title: string | null;
          phone: string | null;
          primary_cta_text: string | null;
          primary_cta_href: string | null;
          secondary_cta_text: string | null;
          secondary_cta_href: string | null;
          courses: string[];
          achievements: string[];
          email: string | null;
          location: string | null;
          is_published: boolean;
        }
      >;
      site_settings: Table<{
        id: number;
        site_title: string;
        default_description: string;
        website_url: string | null;
        logo_url: string | null;
        favicon_url: string | null;
        footer_text: string | null;
        theme_default: "light" | "dark" | "system";
        resume_asset_id: string | null;
        analytics_enabled: boolean;
        analytics_id: string | null;
        is_published: boolean;
        updated_at: string;
      }>;
      project_categories: Table<
        Timestamped & {
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
        }
      >;
      projects: Table<
        Timestamped & {
          category_id: string | null;
          title: string;
          slug: string;
          summary: string;
          description: string | null;
          category: string | null;
          external_url: string | null;
          source_url: string | null;
          problem: string | null;
          approach: string | null;
          solution: string | null;
          tools: string[];
          verified_results: Json;
          screenshots: Json;
          featured: boolean;
          thumbnail_url: string | null;
          thumbnail_alt: string | null;
          seo_title: string | null;
          seo_description: string | null;
          status: "draft" | "published";
          display_order: number;
          published_at: string | null;
        }
      >;
      skill_categories: Table<
        Timestamped & {
          name: string;
          slug: string;
          display_order: number;
        }
      >;
      skills: Table<
        Timestamped & {
          category_id: string | null;
          name: string;
          category_name: string | null;
          description: string | null;
          icon: string | null;
          proficiency: number | null;
          display_order: number;
          is_published: boolean;
        }
      >;
      services: Table<
        Timestamped & {
          title: string;
          slug: string;
          description: string;
          deliverables: string[];
          price_amount: number | null;
          price_currency: string | null;
          availability: string | null;
          icon: string | null;
          is_available: boolean;
          display_order: number;
          is_published: boolean;
        }
      >;
      experiences: Table<
        Timestamped & {
          role: string;
          organization: string | null;
          kind:
            | "work"
            | "freelance"
            | "training"
            | "course"
            | "achievement"
            | "teaching"
            | "leadership"
            | "community";
          description: string | null;
          external_url: string | null;
          skills: string[];
          period_label: string | null;
          start_date: string | null;
          end_date: string | null;
          is_current: boolean;
          display_order: number;
          is_published: boolean;
        }
      >;
      research_publications: Table<
        Timestamped & {
          title: string | null;
          description: string | null;
          authors: string[];
          author_contribution: string | null;
          venue: string | null;
          publication_year: number | null;
          doi: string | null;
          source_url: string;
          display_order: number;
          is_published: boolean;
        }
      >;
      testimonials: Table<
        Timestamped & {
          author_name: string;
          author_role: string | null;
          organization: string | null;
          quote: string;
          source_url: string | null;
          display_order: number;
          is_published: boolean;
        }
      >;
      education: Table<
        Timestamped & {
          institution: string;
          qualification: string;
          field_of_study: string | null;
          description: string | null;
          external_url: string | null;
          skills: string[];
          start_date: string | null;
          end_date: string | null;
          display_order: number;
          is_published: boolean;
        }
      >;
      certifications: Table<
        Timestamped & {
          name: string;
          issuer: string;
          kind: "certification" | "training" | "course" | "achievement";
          description: string | null;
          skills: string[];
          credential_url: string | null;
          issued_on: string | null;
          expires_on: string | null;
          display_order: number;
          is_published: boolean;
        }
      >;
      contact_messages: Table<{
        id: string;
        name: string;
        email: string;
        subject: string;
        message: string;
        status: "received" | "read" | "archived";
        created_at: string;
      }>;
      media_assets: Table<
        Timestamped & {
          storage_bucket: string;
          storage_path: string;
          alt_text: string | null;
          media_type: string;
          is_published: boolean;
        }
      >;
      resume_assets: Table<
        Timestamped & {
          storage_bucket: string;
          storage_path: string;
          file_name: string;
          display_order: number;
          is_published: boolean;
        }
      >;
      project_related: Table<{
        project_id: string;
        related_project_id: string;
        display_order: number;
        created_at: string;
      }>;
      admin_users: Table<{
        user_id: string;
        role: "admin";
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      submit_contact_message: {
        Args: {
          p_name: string;
          p_email: string;
          p_subject: string;
          p_message: string;
          p_request_identity_hash: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
