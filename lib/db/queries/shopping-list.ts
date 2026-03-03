import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { shoppingListItems } from '@/lib/db/schema'

export async function findShoppingListByPlan(mealPlanId: number) {
  return db.select().from(shoppingListItems)
    .where(eq(shoppingListItems.mealPlanId, mealPlanId))
}
