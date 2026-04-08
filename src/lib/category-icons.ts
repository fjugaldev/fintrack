import type { LucideIcon } from 'lucide-react'
import {
  ShoppingCart, Utensils, Coffee, Pizza, Apple,
  Car, Bus, Plane, Train, Bike, Fuel,
  Heart, Activity, Pill, Dumbbell,
  Home, Key, Wrench, Zap, Wifi, Tv,
  Film, Music, Gamepad2, PartyPopper,
  BookOpen, GraduationCap,
  ShoppingBag, Shirt, Package, Smartphone,
  Briefcase, Laptop, Code2, Gift,
  DollarSign, TrendingUp, PiggyBank, CreditCard, Wallet, Landmark, Banknote, ReceiptText,
  Tag, Star, Globe, Building2, Users, Leaf, Baby, Dog,
} from 'lucide-react'

export const CATEGORY_ICONS: Array<{ name: string; icon: LucideIcon }> = [
  // Alimentación
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Utensils', icon: Utensils },
  { name: 'Coffee', icon: Coffee },
  { name: 'Pizza', icon: Pizza },
  { name: 'Apple', icon: Apple },
  // Transporte
  { name: 'Car', icon: Car },
  { name: 'Bus', icon: Bus },
  { name: 'Plane', icon: Plane },
  { name: 'Train', icon: Train },
  { name: 'Bike', icon: Bike },
  { name: 'Fuel', icon: Fuel },
  // Salud
  { name: 'Heart', icon: Heart },
  { name: 'Activity', icon: Activity },
  { name: 'Pill', icon: Pill },
  { name: 'Dumbbell', icon: Dumbbell },
  // Hogar
  { name: 'Home', icon: Home },
  { name: 'Key', icon: Key },
  { name: 'Wrench', icon: Wrench },
  { name: 'Zap', icon: Zap },
  { name: 'Wifi', icon: Wifi },
  { name: 'Tv', icon: Tv },
  // Entretenimiento
  { name: 'Film', icon: Film },
  { name: 'Music', icon: Music },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'PartyPopper', icon: PartyPopper },
  // Educación
  { name: 'BookOpen', icon: BookOpen },
  { name: 'GraduationCap', icon: GraduationCap },
  // Compras
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Shirt', icon: Shirt },
  { name: 'Package', icon: Package },
  { name: 'Smartphone', icon: Smartphone },
  // Trabajo / Ingresos
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Laptop', icon: Laptop },
  { name: 'Code2', icon: Code2 },
  { name: 'Gift', icon: Gift },
  // Finanzas
  { name: 'DollarSign', icon: DollarSign },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Wallet', icon: Wallet },
  { name: 'Landmark', icon: Landmark },
  { name: 'Banknote', icon: Banknote },
  { name: 'ReceiptText', icon: ReceiptText },
  // Otros
  { name: 'Tag', icon: Tag },
  { name: 'Star', icon: Star },
  { name: 'Globe', icon: Globe },
  { name: 'Building2', icon: Building2 },
  { name: 'Users', icon: Users },
  { name: 'Leaf', icon: Leaf },
  { name: 'Baby', icon: Baby },
  { name: 'Dog', icon: Dog },
]

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map(({ name, icon }) => [name, icon])
)

export function getCategoryIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null
  return iconMap[name] ?? null
}
