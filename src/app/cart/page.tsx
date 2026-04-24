'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Navbar } from '@/components/store/Navbar';
import { useEffect } from 'react';

export default function CartPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { items, increment, decrement, removeItem, subtotal, totalItems } = useCart();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-6 text-sm">Adicione itens para continuar</p>
          <Link href="/" className="btn-primary inline-flex">Ver Cardápio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Carrinho <span className="text-gray-400 font-normal text-base">({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
          </h1>
        </div>

        <div className="space-y-3 mb-6">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card flex gap-4">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 leading-tight">{product.name}</p>
                <p className="text-primary-500 font-bold text-sm mt-1">{formatCurrency(product.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => decrement(product.id)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Minus size={13} />
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">{quantity}</span>
                    <button onClick={() => increment(product.id)} className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center">
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-700">{formatCurrency(product.price * quantity)}</span>
                    <button onClick={() => removeItem(product.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>Taxa de entrega</span>
            <span className="text-orange-500">Calculada no checkout</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 text-center">
          <ShoppingCart size={18} />
          Ir para o Checkout
        </Link>
      </div>
    </div>
  );
}
