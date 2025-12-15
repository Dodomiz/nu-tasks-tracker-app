// Category Management Types

/**
 * Heroicon names used for category icons
 */
export type HeroiconName =
  | 'home'
  | 'scissors'
  | 'paw'
  | 'academic-cap'
  | 'briefcase'
  | 'truck'
  | 'currency-dollar'
  | 'shopping-cart'
  | 'heart'
  | 'ellipsis-horizontal'
  | 'wrench-screwdriver'
  | 'gift'
  | 'book-open'
  | 'calendar'
  | 'user-group'
  | 'bell'
  | 'star'
  | 'chart-bar'
  | 'cog'
  | 'folder'
  | 'tag'
  | 'clipboard-document-list'
  | 'light-bulb'
  | 'puzzle-piece'
  | 'sparkles'
  | 'rocket-launch'
  | 'beaker'
  | 'cake'
  | 'camera'
  | 'paint-brush'
  | 'musical-note'
  | 'globe-alt'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'fire'
  | 'bolt'
  | 'shield-check'
  | 'key'
  | 'lock-closed'
  | 'envelope'
  | 'phone'
  | 'map-pin'
  | 'building-office'
  | 'banknote'
  | 'credit-card'
  | 'calculator'
  | 'document-text'
  | 'archive-box';

/**
 * Tailwind color classes for categories
 */
export type CategoryColor =
  | 'red-500'
  | 'orange-500'
  | 'amber-500'
  | 'yellow-500'
  | 'lime-500'
  | 'green-500'
  | 'green-600'
  | 'emerald-600'
  | 'teal-500'
  | 'cyan-500'
  | 'sky-500'
  | 'blue-500'
  | 'blue-600'
  | 'indigo-500'
  | 'violet-500'
  | 'purple-600'
  | 'fuchsia-500'
  | 'pink-600'
  | 'rose-500'
  | 'slate-500'
  | 'gray-700'
  | 'stone-500';

/**
 * Category entity
 */
export interface Category {
  id: string;
  groupId: string;
  name: string;
  icon: HeroiconName;
  color: CategoryColor;
  isSystemCategory: boolean;
  taskCount: number;
  createdAt: string;
}

/**
 * Request to create a new custom category
 */
export interface CreateCategoryRequest {
  name: string;
  icon: HeroiconName;
  color: CategoryColor;
}

/**
 * Request to update an existing custom category
 */
export interface UpdateCategoryRequest {
  name?: string;
  icon?: HeroiconName;
  color?: CategoryColor;
}

/**
 * System-provided default categories (immutable)
 */
export const SYSTEM_CATEGORIES: Readonly<
  Array<{
    name: string;
    icon: HeroiconName;
    color: CategoryColor;
  }>
> = [
  { name: 'House', icon: 'home', color: 'orange-500' },
  { name: 'Yard', icon: 'scissors', color: 'green-600' },
  { name: 'Pets', icon: 'paw', color: 'amber-500' },
  { name: 'Studies', icon: 'academic-cap', color: 'purple-600' },
  { name: 'Work', icon: 'briefcase', color: 'blue-600' },
  { name: 'Vehicle', icon: 'truck', color: 'gray-700' },
  { name: 'Finance', icon: 'currency-dollar', color: 'emerald-600' },
  { name: 'Shopping', icon: 'shopping-cart', color: 'pink-600' },
  { name: 'Health', icon: 'heart', color: 'red-500' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: 'slate-500' },
] as const;

/**
 * Available heroicons for category icon selection
 */
export const AVAILABLE_ICONS: ReadonlyArray<{
  name: HeroiconName;
  label: string;
}> = [
  { name: 'home', label: 'Home' },
  { name: 'scissors', label: 'Scissors' },
  { name: 'paw', label: 'Paw' },
  { name: 'academic-cap', label: 'Academic Cap' },
  { name: 'briefcase', label: 'Briefcase' },
  { name: 'truck', label: 'Truck' },
  { name: 'currency-dollar', label: 'Currency Dollar' },
  { name: 'shopping-cart', label: 'Shopping Cart' },
  { name: 'heart', label: 'Heart' },
  { name: 'ellipsis-horizontal', label: 'Ellipsis' },
  { name: 'wrench-screwdriver', label: 'Wrench Screwdriver' },
  { name: 'gift', label: 'Gift' },
  { name: 'book-open', label: 'Book Open' },
  { name: 'calendar', label: 'Calendar' },
  { name: 'user-group', label: 'User Group' },
  { name: 'bell', label: 'Bell' },
  { name: 'star', label: 'Star' },
  { name: 'chart-bar', label: 'Chart Bar' },
  { name: 'cog', label: 'Cog' },
  { name: 'folder', label: 'Folder' },
  { name: 'tag', label: 'Tag' },
  { name: 'clipboard-document-list', label: 'Clipboard' },
  { name: 'light-bulb', label: 'Light Bulb' },
  { name: 'puzzle-piece', label: 'Puzzle Piece' },
  { name: 'sparkles', label: 'Sparkles' },
  { name: 'rocket-launch', label: 'Rocket Launch' },
  { name: 'beaker', label: 'Beaker' },
  { name: 'cake', label: 'Cake' },
  { name: 'camera', label: 'Camera' },
  { name: 'paint-brush', label: 'Paint Brush' },
  { name: 'musical-note', label: 'Musical Note' },
  { name: 'globe-alt', label: 'Globe' },
  { name: 'sun', label: 'Sun' },
  { name: 'moon', label: 'Moon' },
  { name: 'cloud', label: 'Cloud' },
  { name: 'fire', label: 'Fire' },
  { name: 'bolt', label: 'Bolt' },
  { name: 'shield-check', label: 'Shield Check' },
  { name: 'key', label: 'Key' },
  { name: 'lock-closed', label: 'Lock Closed' },
  { name: 'envelope', label: 'Envelope' },
  { name: 'phone', label: 'Phone' },
  { name: 'map-pin', label: 'Map Pin' },
  { name: 'building-office', label: 'Building Office' },
  { name: 'banknote', label: 'Banknote' },
  { name: 'credit-card', label: 'Credit Card' },
  { name: 'calculator', label: 'Calculator' },
  { name: 'document-text', label: 'Document Text' },
  { name: 'archive-box', label: 'Archive Box' },
] as const;

/**
 * Available Tailwind colors for category selection
 */
export const AVAILABLE_COLORS: ReadonlyArray<{
  value: CategoryColor;
  label: string;
  hex: string;
}> = [
  { value: 'red-500', label: 'Red', hex: '#ef4444' },
  { value: 'orange-500', label: 'Orange', hex: '#f97316' },
  { value: 'amber-500', label: 'Amber', hex: '#f59e0b' },
  { value: 'yellow-500', label: 'Yellow', hex: '#eab308' },
  { value: 'lime-500', label: 'Lime', hex: '#84cc16' },
  { value: 'green-500', label: 'Green', hex: '#22c55e' },
  { value: 'green-600', label: 'Dark Green', hex: '#16a34a' },
  { value: 'emerald-600', label: 'Emerald', hex: '#059669' },
  { value: 'teal-500', label: 'Teal', hex: '#14b8a6' },
  { value: 'cyan-500', label: 'Cyan', hex: '#06b6d4' },
  { value: 'sky-500', label: 'Sky', hex: '#0ea5e9' },
  { value: 'blue-500', label: 'Blue', hex: '#3b82f6' },
  { value: 'blue-600', label: 'Dark Blue', hex: '#2563eb' },
  { value: 'indigo-500', label: 'Indigo', hex: '#6366f1' },
  { value: 'violet-500', label: 'Violet', hex: '#8b5cf6' },
  { value: 'purple-600', label: 'Purple', hex: '#9333ea' },
  { value: 'fuchsia-500', label: 'Fuchsia', hex: '#d946ef' },
  { value: 'pink-600', label: 'Pink', hex: '#db2777' },
  { value: 'rose-500', label: 'Rose', hex: '#f43f5e' },
  { value: 'slate-500', label: 'Slate', hex: '#64748b' },
  { value: 'gray-700', label: 'Gray', hex: '#374151' },
  { value: 'stone-500', label: 'Stone', hex: '#78716c' },
] as const;
