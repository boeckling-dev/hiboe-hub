CREATE TABLE "family_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"family_members" jsonb DEFAULT '[]'::jsonb,
	"dietary_restrictions" jsonb DEFAULT '[]'::jsonb,
	"kitchen_equipment" jsonb DEFAULT '[]'::jsonb,
	"max_prep_time_weekday" integer DEFAULT 30,
	"max_prep_time_weekend" integer DEFAULT 60,
	"delivery_services" jsonb DEFAULT '[]'::jsonb,
	"cookidoo_email" text,
	"cookidoo_password_encrypted" text,
	"thermomix_model" varchar(10) DEFAULT 'TM6',
	"prefer_cookidoo_recipes" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"location_room" varchar(100),
	"location_detail" text,
	"notes" text,
	"photo_url" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_plan_id" integer NOT NULL,
	"day" varchar(10) NOT NULL,
	"meal_type" varchar(20) NOT NULL,
	"category" varchar(20) NOT NULL,
	"recipe_id" integer,
	"custom_meal_note" text,
	"meal_source" varchar(20) DEFAULT 'rezept' NOT NULL,
	"delivery_service_name" varchar(100),
	"vorrat_note" text
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_start_date" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer,
	"meal_plan_entry_id" integer,
	"rating" integer NOT NULL,
	"kids_liked_it" boolean,
	"note" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"source_url" text,
	"expose_url" text,
	"extracted_data" jsonb,
	"score" integer,
	"score_details" jsonb,
	"open_questions" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'neu' NOT NULL,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"budget_max" numeric(12, 2),
	"min_size_sqm" integer,
	"preferred_locations" jsonb DEFAULT '[]'::jsonb,
	"must_haves" jsonb DEFAULT '[]'::jsonb,
	"deal_breakers" jsonb DEFAULT '[]'::jsonb,
	"financing" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"prep_time" integer,
	"cook_time" integer,
	"servings" integer DEFAULT 4,
	"difficulty" varchar(50),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"ingredients" jsonb DEFAULT '[]'::jsonb,
	"instructions" jsonb DEFAULT '[]'::jsonb,
	"image_url" text,
	"source_url" text,
	"cookidoo_id" text,
	"recipe_source" varchar(20),
	"thermomix_model" varchar(10),
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopping_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_plan_id" integer NOT NULL,
	"ingredient" varchar(255) NOT NULL,
	"quantity" varchar(100),
	"unit" varchar(50),
	"category" varchar(100),
	"checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_ratings" ADD CONSTRAINT "meal_ratings_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_ratings" ADD CONSTRAINT "meal_ratings_meal_plan_entry_id_meal_plan_entries_id_fk" FOREIGN KEY ("meal_plan_entry_id") REFERENCES "public"."meal_plan_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;