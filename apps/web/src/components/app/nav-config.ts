import {
  Boxes,
  ChartColumn,
  CreditCard,
  Flag,
  Globe,
  House,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  Megaphone,
  Package,
  Repeat,
  ScrollText,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Count pill (e.g. open orders). Filled in from live data once features exist. */
  count?: number;
  countTone?: 'default' | 'danger' | 'muted';
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
}

/** Merchant sidebar, exactly as 00.06 / 03.xx: group 1, "STORE", then Settings + Help at the bottom. */
export const MERCHANT_NAV: NavGroup[] = [
  {
    items: [
      { href: '/', label: 'Home', icon: House },
      { href: '/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/products', label: 'Products', icon: Package },
      { href: '/inventory', label: 'Inventory', icon: Boxes },
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/reports', label: 'Reports', icon: ChartColumn },
      { href: '/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    heading: 'Store',
    items: [
      { href: '/storefront', label: 'Storefront', icon: Store },
      { href: '/delivery', label: 'Delivery', icon: Truck },
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/domains', label: 'Domains', icon: Globe },
    ],
  },
];

export const MERCHANT_NAV_FOOTER: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & support', icon: LifeBuoy },
];

/** Mobile bottom tab bar (04.xx). */
export const MERCHANT_TABS: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/storefront', label: 'Store', icon: Store },
  { href: '/more', label: 'More', icon: Layers },
];

/** Admin sidebar (06.xx). */
export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/merchants', label: 'Merchants', icon: Store },
      { href: '/subscriptions', label: 'Subscriptions', icon: Repeat },
      { href: '/plans', label: 'Plans', icon: Layers },
    ],
  },
  {
    heading: 'Trust & support',
    items: [
      { href: '/reports', label: 'Reports & abuse', icon: Flag },
      { href: '/support', label: 'Support tickets', icon: LifeBuoy },
      { href: '/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/audit-log', label: 'Audit log', icon: ScrollText },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** Page titles for the placeholder routes, keyed by first path segment. */
export function navTitle(nav: NavGroup[], extra: NavItem[], segment: string): string | undefined {
  const all = [...nav.flatMap((g) => g.items), ...extra];
  return all.find((i) => i.href === `/${segment}`)?.label;
}
