'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: '🆕 Novos' },
  { value: 'preparing', label: '👨‍🍳 Preparo' },
  { value: 'delivery', label: '🛵 Entrega' },
  { value: 'done', label: '✅ Finalizados' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');

  async function load() {
    setLoading(true);
    let query = supabase.from('orders').select('*, profiles(name, phone)').order('created_at', { ascending: false });
    if (tab !== 'all') query = query.eq('status', tab);
    const { data } = await query;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]);

  useEffect(() => {
    const sub = supabase.channel('orders-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load).subscribe();
    return () => { sub.unsubscribe(); };
  }, [tab]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-400 text-sm mt-0.5">Acompanhe em tempo real</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{(order.profiles as any)?.name ?? '—'} · {formatDate(order.created_at)}</p>
                <p className="text-sm font-bold text-primary-500 mt-1">{formatCurrency(order.total)}</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
