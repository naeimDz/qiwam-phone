import { getCategoriesAction } from "@/lib/actions/categories"
import { getBrandsAction } from "@/lib/actions/brands"
import { InventoryClient } from "./InventoryClient"

export default async function InventoryPage() {
  const [categoriesRes, brandsRes] = await Promise.all([
    getCategoriesAction(),
    getBrandsAction(),
  ])

  // 🟥 Handle load errors
  if (!categoriesRes.success || !brandsRes.success) {
    let errorMessage = "Unknown error"
    if (!categoriesRes.success) {
      errorMessage = categoriesRes.error
    } else if (!brandsRes.success) {
      errorMessage = brandsRes.error
    }

    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>⚠️ Failed to load data: {errorMessage}</p>
      </div>
    )
  }

  const categories = categoriesRes.data
  const brands = brandsRes.data

  // 🟨 Handle empty state
  if (categories.length === 0 && brands.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>📦 No categories or brands found.</p>
      </div>
    )
  }

  // 🟩 Normal case
  return <InventoryClient categories={categories} brands={brands} />
}
