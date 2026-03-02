import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  varchar,
  decimal,
} from 'drizzle-orm/pg-core'

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  prepTime: integer('prep_time'), // minutes
  cookTime: integer('cook_time'), // minutes
  servings: integer('servings').default(4),
  difficulty: varchar('difficulty', { length: 50 }), // easy, medium, hard
  tags: jsonb('tags').$type<string[]>().default([]),
  ingredients: jsonb('ingredients').$type<{
    name: string
    quantity: string
    unit: string
  }[]>().default([]),
  instructions: jsonb('instructions').$type<{
    step: number
    text: string
  }[]>().default([]),
  imageUrl: text('image_url'),
  sourceUrl: text('source_url'), // URL of the original internet recipe
  createdBy: text('created_by').notNull(), // Clerk user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export const mealPlans = pgTable('meal_plans', {
  id: serial('id').primaryKey(),
  weekStartDate: timestamp('week_start_date').notNull(),
  createdBy: text('created_by').notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(), // draft, active, archived
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Meal Plan Entries ────────────────────────────────────────────────────────

export const mealPlanEntries = pgTable('meal_plan_entries', {
  id: serial('id').primaryKey(),
  mealPlanId: integer('meal_plan_id')
    .references(() => mealPlans.id, { onDelete: 'cascade' })
    .notNull(),
  day: varchar('day', { length: 10 }).notNull(), // mo, di, mi, do, fr, sa, so
  mealType: varchar('meal_type', { length: 20 }).notNull(), // lunch, dinner
  category: varchar('category', { length: 20 }).notNull(), // family, kids
  recipeId: integer('recipe_id').references(() => recipes.id, {
    onDelete: 'set null',
  }),
  customMealNote: text('custom_meal_note'), // for manual overrides without a recipe
})

// ─── Shopping List Items ──────────────────────────────────────────────────────

export const shoppingListItems = pgTable('shopping_list_items', {
  id: serial('id').primaryKey(),
  mealPlanId: integer('meal_plan_id')
    .references(() => mealPlans.id, { onDelete: 'cascade' })
    .notNull(),
  ingredient: varchar('ingredient', { length: 255 }).notNull(),
  quantity: varchar('quantity', { length: 100 }),
  unit: varchar('unit', { length: 50 }),
  category: varchar('category', { length: 100 }), // Supermarkt, Drogerie, Biomarkt...
  checked: boolean('checked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Inventory Items ──────────────────────────────────────────────────────────

export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  locationRoom: varchar('location_room', { length: 100 }), // Keller, Dachboden, Küche...
  locationDetail: text('location_detail'), // linkes Regal, blaue Box...
  notes: text('notes'),
  photoUrl: text('photo_url'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Property Criteria ────────────────────────────────────────────────────────

export const propertyCriteria = pgTable('property_criteria', {
  id: serial('id').primaryKey(),
  createdBy: text('created_by').notNull(),
  budgetMax: decimal('budget_max', { precision: 12, scale: 2 }),
  minSizeSqm: integer('min_size_sqm'),
  preferredLocations: jsonb('preferred_locations').$type<string[]>().default([]),
  mustHaves: jsonb('must_haves').$type<string[]>().default([]),
  dealBreakers: jsonb('deal_breakers').$type<string[]>().default([]),
  financing: jsonb('financing').$type<{
    eigenkapital: number
    maxMonthlyRate: number
    desiredRepaymentPercent: number
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Properties ───────────────────────────────────────────────────────────────

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  sourceUrl: text('source_url'),
  exposeUrl: text('expose_url'), // Vercel Blob URL for uploaded PDF
  extractedData: jsonb('extracted_data').$type<{
    preis?: number
    groesse?: number
    lage?: string
    zustand?: string
    nebenkosten?: number
    energieausweis?: string
    baujahr?: number
    zimmer?: number
    [key: string]: unknown
  }>(),
  score: integer('score'), // 0–100
  scoreDetails: jsonb('score_details').$type<{
    criterion: string
    status: 'green' | 'yellow' | 'red'
    note: string
  }[]>(),
  openQuestions: jsonb('open_questions').$type<string[]>().default([]),
  status: varchar('status', { length: 50 }).default('neu').notNull(), // neu, in_prüfung, abgelehnt, favorit
  notes: text('notes'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
export type MealPlan = typeof mealPlans.$inferSelect
export type NewMealPlan = typeof mealPlans.$inferInsert
export type MealPlanEntry = typeof mealPlanEntries.$inferSelect
export type NewMealPlanEntry = typeof mealPlanEntries.$inferInsert
export type ShoppingListItem = typeof shoppingListItems.$inferSelect
export type NewShoppingListItem = typeof shoppingListItems.$inferInsert
export type InventoryItem = typeof inventoryItems.$inferSelect
export type NewInventoryItem = typeof inventoryItems.$inferInsert
export type PropertyCriteria = typeof propertyCriteria.$inferSelect
export type NewPropertyCriteria = typeof propertyCriteria.$inferInsert
export type Property = typeof properties.$inferSelect
export type NewProperty = typeof properties.$inferInsert
