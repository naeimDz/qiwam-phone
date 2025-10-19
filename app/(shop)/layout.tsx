import { ShopLayoutClient } from './shop-layout-client'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopLayoutClient>{children}</ShopLayoutClient>
}
