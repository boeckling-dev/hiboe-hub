import type { ComponentType, SVGProps } from 'react'
import {
  NoodleIcon,
  RiceIcon,
  SaladIcon,
  MeatIcon,
  FishIcon,
  VegetableIcon,
  SoupIcon,
  PizzaIcon,
  BreadIcon,
  FruitIcon,
  EggIcon,
  CheeseIcon,
  CakeIcon,
  DrinkIcon,
  PlateIcon,
} from '@/components/meals/food-icons'

type FoodIconEntry = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  bg: string
  color: string
}

const FOOD_CATEGORIES: Record<string, FoodIconEntry> = {
  nudeln: { icon: NoodleIcon, bg: 'bg-meals-pastel-yellow', color: 'text-amber-600' },
  reis: { icon: RiceIcon, bg: 'bg-meals-pastel-peach', color: 'text-orange-600' },
  salat: { icon: SaladIcon, bg: 'bg-meals-pastel-green', color: 'text-emerald-600' },
  fleisch: { icon: MeatIcon, bg: 'bg-meals-pastel-pink', color: 'text-rose-600' },
  fisch: { icon: FishIcon, bg: 'bg-meals-pastel-mint', color: 'text-cyan-600' },
  gemuese: { icon: VegetableIcon, bg: 'bg-meals-pastel-green', color: 'text-green-600' },
  suppe: { icon: SoupIcon, bg: 'bg-meals-pastel-peach', color: 'text-orange-500' },
  pizza: { icon: PizzaIcon, bg: 'bg-meals-pastel-yellow', color: 'text-red-500' },
  brot: { icon: BreadIcon, bg: 'bg-meals-pastel-yellow', color: 'text-amber-700' },
  obst: { icon: FruitIcon, bg: 'bg-meals-pastel-pink', color: 'text-pink-500' },
  ei: { icon: EggIcon, bg: 'bg-meals-pastel-yellow', color: 'text-yellow-600' },
  kaese: { icon: CheeseIcon, bg: 'bg-meals-pastel-yellow', color: 'text-amber-500' },
  kuchen: { icon: CakeIcon, bg: 'bg-meals-pastel-lavender', color: 'text-purple-500' },
  getraenk: { icon: DrinkIcon, bg: 'bg-meals-pastel-mint', color: 'text-teal-500' },
  allgemein: { icon: PlateIcon, bg: 'bg-meals-pastel-lavender', color: 'text-violet-500' },
}

const KEYWORD_MAP: [string[], string][] = [
  [['nudel', 'pasta', 'spaghetti', 'penne', 'lasagne', 'linguine', 'tagliatelle', 'gnocchi', 'ravioli', 'tortellini', 'noodle', 'mac'], 'nudeln'],
  [['reis', 'risotto', 'paella', 'curry', 'sushi', 'bowl', 'rice'], 'reis'],
  [['salat', 'bowl', 'couscous', 'quinoa', 'tabouleh'], 'salat'],
  [['fleisch', 'steak', 'braten', 'schnitzel', 'gulasch', 'rind', 'schwein', 'lamm', 'hack', 'burger', 'bolognese', 'ragout', 'beef', 'pork', 'pulled', 'bbq', 'grill'], 'fleisch'],
  [['fisch', 'lachs', 'thunfisch', 'garnele', 'shrimp', 'forelle', 'kabeljau', 'pangasius', 'seafood', 'meeresfrüchte', 'muschel', 'fish', 'salmon'], 'fisch'],
  [['gemüse', 'vegetarisch', 'vegan', 'brokkoli', 'blumenkohl', 'zucchini', 'aubergine', 'paprika', 'kartoffel', 'tofu', 'tempeh'], 'gemuese'],
  [['suppe', 'eintopf', 'brühe', 'minestrone', 'chili', 'soup', 'stew'], 'suppe'],
  [['pizza', 'flammkuchen', 'focaccia', 'calzone'], 'pizza'],
  [['brot', 'sandwich', 'toast', 'brötchen', 'wrap', 'bruschetta', 'panini', 'baguette', 'bagel'], 'brot'],
  [['obst', 'frucht', 'beere', 'apfel', 'banane', 'smoothie', 'obstsalat', 'kompott'], 'obst'],
  [['ei', 'omelette', 'rührei', 'spiegelei', 'frittata', 'quiche'], 'ei'],
  [['käse', 'gratin', 'überbacken', 'fondue', 'raclette'], 'kaese'],
  [['kuchen', 'torte', 'dessert', 'muffin', 'brownies', 'pancake', 'pfannkuchen', 'waffel', 'crêpe', 'nachtisch', 'süß'], 'kuchen'],
  [['getränk', 'saft', 'shake', 'tee', 'kaffee', 'limo', 'cocktail'], 'getraenk'],
]

export function getFoodIcon(title: string, tags?: string[]): FoodIconEntry {
  const searchText = [title, ...(tags ?? [])].join(' ').toLowerCase()

  for (const [keywords, category] of KEYWORD_MAP) {
    if (keywords.some(kw => searchText.includes(kw))) {
      return FOOD_CATEGORIES[category]
    }
  }

  return FOOD_CATEGORIES.allgemein
}

export { FOOD_CATEGORIES }
