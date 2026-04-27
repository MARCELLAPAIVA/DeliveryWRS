'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/lib/types';
import { Navbar } from '@/components/store/Navbar';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_LABELS, buildWhatsAppMessage } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(*, products(name, price))')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setOrder(data as Order);
        setDataLoading(false);
      });
  }, [id, user]);

  if (dataLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-20"><Spinner className="text-primary-500 w-8 h-8" /></div>
    </div>
  );

  if (!order) return null;

  const items = (order.order_items ?? []) as any[];
  const whatsNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5521985529198';
  const msg = buildWhatsAppMessage({
    id: order.id,
    items: items.map((i: any) => ({ name: i.products?.name, quantity: i.quantity, price: i.unit_price })),
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    total: order.total,
    payment: order.payment_method,
    changeFor: order.change_for,
    address: order.address,
    neighborhood: order.neighborhood,
    notes: order.notes,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Pedido #{order.id.slice(0,8).toUpperCase()}</h1>
            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <p className="text-sm text-gray-500 mb-2">Status</p>
            <span className={`inline-flex items-center text-sm font-semibold px-3 py-1.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">🛒 Itens</h3>
            <div className="space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.quantity}x {item.products?.name}</span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Entrega ({order.neighborhood})</span><span>{formatCurrency(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-bold text-base text-gray-900"><span>Total</span><span className="text-primary-500">{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          <div className="card text-sm space-y-1">
            <p><span className="text-gray-400">Pagamento:</span> <span className="font-medium">{PAYMENT_LABELS[order.payment_method]}</span></p>
            <p><span className="text-gray-400">Endereço:</span> <span className="font-medium">{order.address}, {order.neighborhood}</span></p>
            {order.notes && <p><span className="text-gray-400">Obs:</span> {order.notes}</p>}
          </div>

          <a
            href={`https://wa.me/${whatsNumber}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
          >
            <MessageCircle size={18} /> Confirmar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
