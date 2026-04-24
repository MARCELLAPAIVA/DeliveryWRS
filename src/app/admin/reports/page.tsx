'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

type Period = 'today' | 'week' | 'month' | 'all';

function startOf(period: Period): Date {
  const d = new Date();
  if (period === 'today') { d.setHours(0,0,0,0); return d; }
  if (period === 'week') { d.setDate(d.getDate() - 7); return d; }
  if (period === 'month') { d.setDate(1); d.setHours(0,0,0,0); return d; }
  return new Date('2000-01-01');
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [chartData, setChartData] = useState<{ date: string; total: number }[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const start = startOf(period);
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(quantity, unit_price, subtotal, products(name))')
        .neq('status', 'cancelled')
        .gte('created_at', start.toISOString())
        .order('created_at');

      const ords = (data as Order[]) ?? [];
      setOrders(ords);

      // top products
      const prodMap: Record<string, { qty: number; revenue: number }> = {};
      ords.forEach((o) => {
        (o.order_items ?? []).forEach((item: any) => {
          const name = item.products?.name ?? 'Desconhecido';
          if (!prodMap[name]) prodMap[name] = { qty: 0, revenue: 0 };
          prodMap[name].qty += item.quantity;
          prodMap[name].revenue += item.subtotal;
        });
      });
      const sorted = Object.entries(prodMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      setTopProducts(sorted);

      // chart data by day
      const dayMap: Record<string, number> = {};
      ords.forEach((o) => {
        const day = o.created_at.split('T')[0];
        dayMap[day] = (dayMap[day] ?? 0) + o.total;
      });
      setChartData(Object.entries(dayMap).map(([date, total]) => ({ date: date.slice(5), total: Math.round(total * 100) / 100 })));

      setLoading(false);
    }
    load();
  }, [period]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  function exportExcel() {
    const rows = orders.map((o) => ({
      'Pedido': o.id.slice(0,8).toUpperCase(),
      'Data': formatDate(o.created_at),
      'Bairro': o.neighborhood,
      'Pagamento': o.payment_method,
      'Subtotal': o.subtotal,
      'Entrega': o.delivery_fee,
      'Total': o.total,
      'Status': o.status,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Pedidos');
    XLSX.writeFile(wb, `relatorio_${period}.xlsx`);
  }

  const periods: { value: Period; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Últimos 7 dias' },
    { value: 'month', label: 'Este mês' },
    { value: 'all', label: 'Todo o período' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-400 text-sm mt-0.5">Análise financeira</p>
        </div>
        <button onClick={exportExcel} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {periods.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total de Pedidos', value: orders.length },
              { label: 'Faturamento', value: formatCurrency(totalRevenue) },
              { label: 'Ticket Médio', value: formatCurrency(avgTicket) },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Faturamento por dia</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="#f97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top products */}
          {topProducts.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">🏆 Produtos Mais Vendidos</h3>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5">#{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800 truncate">{p.name}</span>
                        <span className="text-primary-500 font-bold flex-shrink-0 ml-2">{formatCurrency(p.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full"
                          style={{ width: `${Math.round((p.revenue / topProducts[0].revenue) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{p.qty} unidades</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
