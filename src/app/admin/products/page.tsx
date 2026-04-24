'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from('products').select('*, categories(name)').order('sort_order');
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id);
    toast.success(p.active ? 'Produto desativado' : 'Produto ativado');
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Excluir produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Produto excluído');
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} produto(s)</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Produto
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">Nenhum produto cadastrado.</div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className={`card flex items-center gap-4 ${!p.active ? 'opacity-60' : ''}`}>
              <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{(p.categories as any)?.name}</p>
                <p className="text-primary-500 font-bold text-sm mt-0.5">{formatCurrency(p.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(p)} title={p.active ? 'Desativar' : 'Ativar'} className="text-gray-400 hover:text-primary-500 transition-colors">
                  {p.active ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} />}
                </button>
                <Link href={`/admin/products/${p.id}`} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-500 flex items-center justify-center transition-colors">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
