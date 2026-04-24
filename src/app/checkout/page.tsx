'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { DeliveryZone } from '@/lib/types';
import { Navbar } from '@/components/store/Navbar';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, PAYMENT_LABELS, buildWhatsAppMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

type PaymentMethod = 'cash' | 'card' | 'pix';

export default function CheckoutPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [whatsappMsg, setWhatsappMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && items.length === 0 && !orderId) router.push('/');
  }, [user, loading, items, router, orderId]);

  useEffect(() => {
    supabase.from('delivery_zones').select('*').eq('active', true).order('neighborhood').then(({ data }) => setZones(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedZone) { toast.error('Selecione o bairro de entrega'); return; }
    if (!profile) { toast.error('Perfil não encontrado'); return; }

    setSubmitting(true);
    const deliveryFee = selectedZone.fee;
    const total = subtotal + deliveryFee;

    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user!.id,
      status: 'new',
      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: payment,
      change_for: payment === 'cash' && changeFor ? parseFloat(changeFor) : null,
      notes: notes || null,
      address: profile.address,
      neighborhood: selectedZone.neighborhood,
    }).select().single();

    if (error || !order) {
      toast.error('Erro ao finalizar pedido');
      setSubmitting(false);
      return;
    }

    await supabase.from('order_items').insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.product.price,
        subtotal: i.product.price * i.quantity,
      }))
    );

    const msg = buildWhatsAppMessage({
      id: order.id,
      items: items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
      subtotal,
      deliveryFee,
      total,
      payment,
      changeFor: payment === 'cash' && changeFor ? parseFloat(changeFor) : null,
      address: profile.address,
      neighborhood: selectedZone.neighborhood,
      notes,
    });

    setWhatsappMsg(msg);
    setOrderId(order.id);
    clearCart();
    setSubmitting(false);
  }

  const deliveryFee = selectedZone?.fee ?? 0;
  const total = subtotal + deliveryFee;
  const whatsNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5521985529198';

  if (orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="card">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado! ✅</h2>
            <p className="text-gray-500 text-sm mb-2">
              Pedido <span className="font-semibold">#{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Agora envie a confirmação do seu pedido para nosso WhatsApp para agilizar o atendimento.
            </p>
            <a
              href={`https://wa.me/${whatsNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 mb-3"
            >
              <MessageCircle size={20} />
              Confirmar pelo WhatsApp
            </a>
            <Link href="/orders" className="btn-secondary w-full flex items-center justify-center">
              Ver Meus Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/cart" className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Finalizar Pedido</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Endereço */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">📍 Endereço de Entrega</h3>
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-sm text-gray-700">{profile.address}</p>
              <p className="text-xs text-gray-400 mt-0.5">{profile.city}</p>
            </div>
            <label className="label">Selecione seu bairro</label>
            <select
              className="input"
              value={selectedZone?.id ?? ''}
              onChange={(e) => setSelectedZone(zones.find((z) => z.id === e.target.value) ?? null)}
              required
            >
              <option value="">-- Selecione o bairro --</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.neighborhood} — {formatCurrency(z.fee)}
                </option>
              ))}
            </select>
          </div>

          {/* Pagamento */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">💳 Forma de Pagamento</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['pix', 'card', 'cash'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayment(m)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    payment === m
                      ? 'bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {PAYMENT_LABELS[m]}
                </button>
              ))}
            </div>
            {payment === 'cash' && (
              <div className="mt-3">
                <label className="label">Precisa de troco? (Troco para quanto?)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Ex: 50.00"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">📝 Observações (opcional)</h3>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Ex: sem cebola, apartamento 302..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Resumo */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">🧾 Resumo do Pedido</h3>
            <div className="space-y-2 mb-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{quantity}x {product.name}</span>
                  <span className="font-medium">{formatCurrency(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Entrega ({selectedZone?.neighborhood ?? '--'})</span>
                <span>{selectedZone ? formatCurrency(deliveryFee) : '--'}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base mt-2">
                <span>Total</span>
                <span className="text-primary-500">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
            {submitting ? <Spinner className="text-white w-5 h-5" /> : '✅ Confirmar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
}
