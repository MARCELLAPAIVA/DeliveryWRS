'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, DollarSign, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ todayOrders: 0, todayRevenue: 0, totalOrders: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [allOrders, todayOrders] = await Promise.all([
        supabase.from('orders').select('total, status').neq('status', 'cancelled'),
        supabase.from('orders').select('total').neq('status', 'cancelled').gte('created_at', today.toISOString()),
      ]);

      const recent = await supabase
        .from('orders')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(6);

      setStats({
        todayOrders: todayOrders.data?.length ?? 0,
        todayRevenue: todayOrders.data?.reduce((s, o) => s + o.total, 0) ?? 0,
        totalOrders: allOrders.data?.length ?? 0,
        totalRevenue: allOrders.data?.reduce((s, o) => s + o.total, 0) ?? 0,
      });
      setRecentOrders((recent.data as Order[]) ?? []);
      setLoading(false);
    }
    load();

    // realtime
    const sub = supabase.channel('orders-dashboard').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load).subscribe();
    return () => { sub.unsubscribe(); };
  }, []);

  const statCards = [
    { label: 'Pedidos Hoje', value: stats.todayOrders, icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
    { label: 'Faturamento Hoje', value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: 'text-green-500 bg-green-50' },
    { label: 'Total de Pedidos', value: stats.totalOrders, icon: Users, color: 'text-purple-500 bg-purple-50' },
    { label: 'Faturamento Total', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-orange-500 bg-orange-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Visão geral do seu delivery</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Últimos Pedidos</h2>
              <Link href="/admin/orders" className="text-primary-500 text-sm font-medium hover:underline">Ver todos</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum pedido ainda.</p>
              )}
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{(order.profiles as any)?.name ?? '—'} · {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <p className="text-sm font-bold text-primary-500 mt-1">{formatCurrency(order.total)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
