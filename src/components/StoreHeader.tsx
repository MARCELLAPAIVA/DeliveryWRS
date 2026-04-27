'use client'

import Link from 'next/link'
import { ShoppingCart, User, LogOut, Store } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function StoreHeader() {
  const { user, signOut } = useAuth()
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-orange-500 font-bold text-xl">
          <Store className="w-7 h-7" />
          <span>Delivery Express</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-50 transition-colors">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link href="/register" className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                <User className="w-6 h-6 text-gray-700" />
              </Link>
              <button onClick={signOut} className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
