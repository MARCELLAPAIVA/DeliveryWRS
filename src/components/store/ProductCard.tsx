'use client';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/database.types';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, increment, decrement } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="card flex gap-4 hover:shadow-md transition-shadow">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-primary-500 text-base">{formatCurrency(product.price)}</span>
          <div className="flex items-center gap-2">
            {qty > 0 ? (
              <>
                <button
                  onClick={() => decrement(product.id)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-semibold text-sm w-4 text-center">{qty}</span>
                <button
                  onClick={() => increment(product.id)}
                  className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => addItem(product)}
                className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <Plus size={14} /> Adicionar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
