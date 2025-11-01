'use client'

import { useState, useTransition } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAccessoriesAction, addAccessoryAction } from '@/lib/actions/accessories'

export default function ProductAutoSuggest() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const [notFound, setNotFound] = useState(false)

  async function handleSearch(value: string) {
    setQuery(value)
    if (value.length < 2) return setResults([])

    startTransition(async () => {
      const res = await getAccessoriesAction(false)
      if (res.success) {
        const filtered = res.data.filter((item: any) =>
          item.name.toLowerCase().includes(value.toLowerCase())
        )
        setResults(filtered)
        setNotFound(filtered.length === 0)
      }
    })
  }

  async function handleAddNew() {
    const form = new FormData()
    form.append('name', query)
    form.append('buyprice', '0')
    form.append('sellprice', '0')
    form.append('quantity', '0')
    const res = await addAccessoryAction(form)
    if (res.success) {
      alert('✅ تم إضافة المنتج الجديد!')
      setResults([res.data])
      setNotFound(false)
    } else {
      alert('❌ فشل الإضافة: ' + res.error)
    }
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="اكتب اسم المنتج..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isPending && <p className="text-sm text-gray-400">...جاري البحث</p>}

      {results.length > 0 && (
        <ul className="border rounded p-2">
          {results.map((r) => (
            <li key={r.id} className="p-1 hover:bg-gray-100 cursor-pointer">
              {r.name}
            </li>
          ))}
        </ul>
      )}

      {notFound && (
        <Button onClick={handleAddNew} variant="outline">
          ➕ أضف "{query}" كمنتج جديد
        </Button>
      )}
    </div>
  )
}
