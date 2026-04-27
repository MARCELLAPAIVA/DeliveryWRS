'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, Product } from '@/lib/database.types'
import StoreHeader from '@/components/StoreHeader'
import ProductCard from '@/components/ProductCard'
import { Search } from 'lucide-react'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true).order('sort_order'),
        supabase.from('products').select('*').eq('active', true).order('name'),
      ])
      setCategories(catRes.data ?? [])
      setProducts(prodRes.data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = products.filter(p => {
    const matchCategory = !selectedCategory || p.category_id === selectedCategory
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const groupedByCategory = categories
    .map(cat => ({
      category: cat,
      items: filtered.filter(p => p.category_id === cat.id),
    }))
    .filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm focus:border-orange-400"
          />
        </div>

        {/* Categories filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groupedByCategory.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByCategory.map(({ category, items }) => (
              <section key={category.id}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {items.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
