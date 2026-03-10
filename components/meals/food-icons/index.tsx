import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function NoodleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 14c0 0 2-4 12-4s12 4 12 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 18h28c0 0-1 18-14 18S10 18 10 18z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 18c0 0 1 10 2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 18v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 18c0 0-1 10-2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19" cy="26" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="29" cy="24" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export function RiceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 28h28l-4 10H14l-4-10z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 28c0 0 4-8 14-8s14 8 14 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="24" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="24" cy="22" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="28" cy="24" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="26" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="26" cy="26" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function SaladIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="30" rx="14" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 26c-2-6 0-12 6-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 24c0-6 2-10 4-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 22c-1-4 1-8 4-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="28" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="29" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function MeatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="26" rx="12" ry="9" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 24c0-2 2-4 4-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 22c0-2 2-4 4-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="15" cy="20" r="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="20" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export function FishIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 24c0 0 6-10 18-10 6 0 10 4 14 10-4 6-8 10-14 10C14 34 8 24 8 24z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="22" r="2" fill="currentColor" />
      <path d="M6 18l4 6-4 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 24h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export function VegetableIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24 38c-6 0-10-6-10-14S18 10 24 10s10 6 10 14-4 14-10 14z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 10c0-4-2-6-4-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 10c0-4 2-6 4-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20c0 0 2 8 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M28 20c0 0-2 8-4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export function SoupIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 24h32v2c0 6-6 12-16 12S8 32 8 26v-2z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 18c0-2 1-4 0-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M24 16c0-2 1-4 0-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M32 18c0-2 1-4 0-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

export function PizzaIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24 6L6 40h36L24 6z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="22" cy="24" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="30" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="18" cy="32" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="25" cy="18" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function BreadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 24c0-6 6-10 16-10s16 4 16 10v6c0 2-6 4-16 4S8 32 8 30v-6z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M8 24c0 0 6 2 16 2s16-2 16-2" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M18 20c0-2 2-4 6-4s6 2 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export function FruitIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="28" r="12" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 16c0-4-2-8-6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 16c2-2 6-2 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 28c0-4 2-6 4-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export function EggIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24 8c-8 0-12 10-12 18 0 7 5 14 12 14s12-7 12-14c0-8-4-18-12-18z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="24" cy="28" rx="6" ry="5" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

export function CheeseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 34l18-24 18 24H6z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="18" cy="28" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="30" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="22" cy="22" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function CakeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="22" width="32" height="16" rx="4" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 28h32" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M24 22v-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="15" r="2" fill="currentColor" opacity="0.4" />
      <path d="M16 22v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M32 22v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function DrinkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 12h16l-2 26h-12l-2-26z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="14" y1="12" x2="34" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 20h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function PlateIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="28" rx="16" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="24" cy="26" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M20 16l2-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M28 16l-2-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M24 18v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}
