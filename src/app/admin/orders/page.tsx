'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderItem } from '@/lib/database.types'
import { formatCurrency, formatDate, statusLabel, statusColor, paymentLabel } from '@/lib/utils'
import { Eye, X } from 'lucide-react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchOrders = useCallback(async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    const { data } = await query
    setOrders(data ?? [])
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order)
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id)
    setOrderItems(data ?? [])
  }

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    fetchOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: status as Order['status'] } : null)
    }
  }

  const statuses = ['new', 'preparing', 'delivering', 'done'] as const

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Pedidos</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${statusFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
          Todos
        </button>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
            {statusLabel(s)}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-sm">#{order.id.slice(0, 8)}</span>
                <span className="text-gray-400 text-xs ml-2">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
                <button onClick={() => viewOrder(order)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{order.customer_name}</span>
              <span className="font-bold text-orange-500">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex gap-1.5 mt-3">
              {statuses.map(s => (
                <button key={s} onClick={() => updateStatus(order.id, s)} disabled={order.status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    order.status === s ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}>
                  {statusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-10 text-gray-400">Nenhum pedido encontrado</div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pedido #{selectedOrder.id.slice(0, 8)}</h3>
              <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(selectedOrder.status)}`}>
                  {statusLabel(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Cliente</p>
                <p className="font-medium">{selectedOrder.customer_name}</p>
                <p>{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Endereco</p>
                <p>{selectedOrder.customer_address}</p>
                <p className="text-gray-600">Bairro: {selectedOrder.customer_neighborhood}</p>
              </div>
              <div>
                <p className="text-gray-500">Pagamento</p>
                <p className="font-medium">{paymentLabel(selectedOrder.payment_method)}</p>
                {selectedOrder.needs_change && <p>Troco para: {formatCurrency(selectedOrder.change_for)}</p>}
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-gray-500">Observacoes</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 mb-2">Itens</p>
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span className="font-medium">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Entrega</span><span>{formatCurrency(selectedOrder.delivery_fee)}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-orange-500">{formatCurrency(selectedOrder.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
