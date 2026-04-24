'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category, Product, Settings } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Navbar } from '@/components/store/Navbar';
import { ProductCard } from '@/components/store/ProductCard';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { totalItems, subtotal } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    async function load() {
      const [catRes, prodRes, setRes] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true).order('sort_order'),
        supabase.from('products').select('*, categories(*)').eq('active', true).order('sort_order'),
        supabase.from('settings').select('*').single(),
      ]);
      setCategories(catRes.data ?? []);
      setProducts(prodRes.data ?? []);
      setSettings(setRes.data);
      setDataLoading(false);
    }
    if (user) load();
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="text-primary-500 w-8 h-8" />
    </div>
  );

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const groupedByCategory = categories.map((cat) => ({
    category: cat,
    products: filteredProducts.filter((p) => p.category_id === cat.id),
  })).filter((g) => g.products.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Banner */}
      {settings?.banner_url && (
        <div className="relative w-full h-40 md:h-56 overflow-hidden">
          <Image src={settings.banner_url} alt="Banner" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeCategory ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
        ) : (
          <>
            {groupedByCategory.map(({ category, products: prods }) => (
              <section key={category.id} className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  {category.name}
                </h2>
                <div className="grid gap-3">
                  {prods.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            ))}
            {groupedByCategory.length === 0 && (
              <div className="text-center py-16 text-gray-400">Nenhum produto disponível no momento.</div>
            )}
          </>
        )}
      </div>

      {/* Sticky Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40">
          <Link href="/cart"
            className="flex items-center justify-between bg-primary-500 hover:bg-primary-600 text-white px-5 py-4 rounded-2xl shadow-lg w-full max-w-sm transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
              <span className="font-semibold">Ver carrinho</span>
            </div>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
