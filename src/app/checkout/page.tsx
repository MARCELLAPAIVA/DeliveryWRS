'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import StoreHeader from '@/components/StoreHeader'
import type { DeliveryZone } from '@/lib/database.types'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const router = useRouter()

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix'>('pix')
  const [needsChange, setNeedsChange] = useState(false)
  const [changeFor, setChangeFor] = useState('')
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    if (profile) {
      setAddress(profile.address)
      setSelectedZone(profile.neighborhood)
    }
    supabase.from('delivery_zones').select('*').eq('active', true).order('neighborhood').then(({ data }) => {
      setZones(data ?? [])
    })
  }, [user, profile, items.length, router])

  const deliveryFee = zones.find(z => z.neighborhood === selectedZone)?.fee ?? 0
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    if (!selectedZone) {
      toast.error('Selecione o bairro de entrega')
      return
    }

    setLoading(true)
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_name: profile.full_name,
        customer_phone: profile.phone,
        customer_address: address || profile.address,
        customer_neighborhood: selectedZone,
        payment_method: paymentMethod,
        needs_change: needsChange,
        change_for: needsChange ? parseFloat(changeFor) || 0 : 0,
        notes,
        subtotal,
        delivery_fee: deliveryFee,
        total,
      })
      .select()
      .single()

    if (error || !order) {
      setLoading(false)
      toast.error('Erro ao criar pedido. Tente novamente.')
      return
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }))

    await supabase.from('order_items').insert(orderItems)

    clearCart()
    setLoading(false)

    const orderSummary = buildOrderSummary(order.id)
    const params = new URLSearchParams({ orderId: order.id, summary: orderSummary })
    router.push(`/success?${params.toString()}`)
  }

  const buildOrderSummary = (orderId: string) => {
    const paymentLabels: Record<string, string> = { money: 'Dinheiro', card: 'Cartao', pix: 'PIX' }
    let text = `*NOVO PEDIDO* #${orderId.slice(0, 8)}\n\n`
    text += `*Cliente:* ${profile?.full_name}\n`
    text += `*Telefone:* ${profile?.phone}\n`
    text += `*Endereco:* ${address || profile?.address}\n`
    text += `*Bairro:* ${selectedZone}\n\n`
    text += `*ITENS:*\n`
    items.forEach(item => {
      text += `- ${item.quantity}x ${item.product.name} = ${formatCurrency(item.product.price * item.quantity)}\n`
    })
    text += `\n*Subtotal:* ${formatCurrency(subtotal)}\n`
    text += `*Taxa de entrega:* ${formatCurrency(deliveryFee)}\n`
    text += `*TOTAL:* ${formatCurrency(total)}\n\n`
    text += `*Pagamento:* ${paymentLabels[paymentMethod]}\n`
    if (needsChange && changeFor) text += `*Troco para:* ${formatCurrency(parseFloat(changeFor))}\n`
    if (notes) text += `*Obs:* ${notes}\n`
    return text
  }

  if (!user || items.length === 0) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Resumo do Pedido</h2>
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{item.quantity}x {item.product.name}</span>
                <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Endereco de Entrega</h2>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm mb-3"
              placeholder="Rua, numero, complemento"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white"
            >
              <option value="">Selecione o bairro</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.neighborhood}>
                  {zone.neighborhood} - {formatCurrency(zone.fee)}
                </option>
              ))}
            </select>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Forma de Pagamento</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['pix', 'card', 'money'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => { setPaymentMethod(method); if (method !== 'money') setNeedsChange(false) }}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    paymentMethod === method
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {method === 'pix' ? 'PIX' : method === 'card' ? 'Cartao' : 'Dinheiro'}
                </button>
              ))}
            </div>

            {paymentMethod === 'money' && (
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={needsChange} onChange={e => setNeedsChange(e.target.checked)}
                    className="rounded accent-orange-500" />
                  Precisa de troco?
                </label>
                {needsChange && (
                  <input type="number" value={changeFor} onChange={e => setChangeFor(e.target.value)}
                    placeholder="Troco para quanto?" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Observacoes</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none"
              placeholder="Alguma observacao sobre o pedido?"
            />
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxa de entrega</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-500">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Finalizando...' : 'Finalizar Pedido'}
          </button>
        </form>
      </div>
    </div>
  )
}
