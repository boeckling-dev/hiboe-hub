import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Building2,
} from 'lucide-react'

export const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/meals',
    label: 'Mahlzeiten',
    icon: UtensilsCrossed,
  },
  {
    href: '/inventory',
    label: 'Inventar',
    icon: Package,
  },
  {
    href: '/properties',
    label: 'Immobilien',
    icon: Building2,
  },
] as const
