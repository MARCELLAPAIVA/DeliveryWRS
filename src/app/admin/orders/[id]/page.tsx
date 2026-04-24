'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, PAYMENT_LABELS, buildWhatsAppMessage } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: 'preparing',
  preparing: 'delivery',
  delivery: 'done',
};

const STATUS_BTN: Partial<Record<OrderStatus, string>> = {
  new: '👨‍🍳 Iniciar Preparo',
  preparing: '🛵 Saiu para Entrega',
  delivery: '✅ Marcar como Entregue',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(*), order_items(*, products(name, price))')
      .eq('id', id)
      .single();
    setOrder(data as Order);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus() {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(true);
    await supabase.from('orders').update({ status: next }).eq('id', id);
    toast.success(`Status atualizado!`);
    load();
    setUpdating(false);
  }

  async function cancelOrder() {
    if (!confirm('Cancelar este pedido?')) return;
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    toast.success('Pedido cancelado.');
    router.push('/admin/orders');
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>;
  if (!order) return <div className="text-center text-gray-400 py-16">Pedido não encontrado.</div>;

  const profile = order.profiles as any;
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
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedido #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className="card">
          <p className="text-sm font-medium text-gray-500 mb-2">Status atual</p>
          <span className={`inline-flex items-center text-sm font-semibold px-3 py-1.5 rounded-full ${
            order.status === 'new' ? 'bg-blue-100 text-blue-700' :
            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
            order.status === 'delivery' ? 'bg-orange-100 text-orange-700' :
            order.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          {NEXT_STATUS[order.status] && (
            <button onClick={updateStatus} disabled={updating} className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
              {updating ? <Spinner className="text-white w-5 h-5" /> : STATUS_BTN[order.status]}
            </button>
          )}
          {order.status !== 'done' && order.status !== 'cancelled' && (
            <button onClick={cancelOrder} className="btn-danger mt-2 w-full text-sm py-2.5">Cancelar Pedido</button>
          )}
        </div>

        {/* Client */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">👤 Cliente</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-400">Nome:</span> <span className="font-medium">{profile?.name}</span></p>
            <p><span className="text-gray-400">Tel:</span> <span className="font-medium">{profile?.phone}</span></p>
            <p><span className="text-gray-400">Endereço:</span> <span className="font-medium">{order.address}</span></p>
            <p><span className="text-gray-400">Bairro:</span> <span className="font-medium">{order.neighborhood}</span></p>
          </div>
        </div>

        {/* Items */}
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
            <div className="flex justify-between text-gray-500"><span>Entrega</span><span>{formatCurrency(order.delivery_fee)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span className="text-primary-500">{formatCurrency(order.total)}</span></div>
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-2">💳 Pagamento</h3>
          <p className="text-sm text-gray-700">{PAYMENT_LABELS[order.payment_method]}</p>
          {order.change_for && <p className="text-sm text-gray-500 mt-1">Troco para: {formatCurrency(order.change_for)}</p>}
          {order.notes && <p className="text-sm text-gray-500 mt-2">📝 {order.notes}</p>}
        </div>

        <a
          href={`https://wa.me/${whatsNumber}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
        >
          <MessageCircle size={18} /> Enviar pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
