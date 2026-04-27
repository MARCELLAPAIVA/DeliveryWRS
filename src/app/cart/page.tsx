'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import StoreHeader from '@/components/StoreHeader'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Seu carrinho esta vazio</p>
            <Link href="/" className="inline-block mt-4 text-orange-500 font-medium hover:underline">
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</h3>
                    <p className="text-orange-500 font-bold text-sm mt-1">{formatCurrency(item.product.price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(item.product.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 mt-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span className="text-orange-500">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Taxa de entrega calculada no checkout</p>
            </div>

            <Link href="/checkout"
              className="block w-full mt-4 bg-orange-500 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors">
              Ir para o Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
