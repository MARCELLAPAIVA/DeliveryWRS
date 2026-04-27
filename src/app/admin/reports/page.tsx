'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { Download, Calendar } from 'lucide-react'

interface OrderData {
  id: string
  total: number
  created_at: string
  status: string
}

interface ProductSale {
  product_name: string
  total_quantity: number
  total_revenue: number
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [topProducts, setTopProducts] = useState<ProductSale[]>([])
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')

  const fetchData = useCallback(async () => {
    const now = new Date()
    let since: Date

    if (period === 'day') {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'week') {
      since = new Date(now)
      since.setDate(since.getDate() - 7)
    } else {
      since = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })

    setOrders(ordersData ?? [])

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('product_name, quantity, total_price, order_id')

    if (itemsData) {
      const orderIds = new Set((ordersData ?? []).map(o => o.id))
      const filteredItems = itemsData.filter(item => orderIds.has(item.order_id))

      const productMap = new Map<string, { quantity: number; revenue: number }>()
      filteredItems.forEach(item => {
        const existing = productMap.get(item.product_name) ?? { quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.total_price
        productMap.set(item.product_name, existing)
      })

      const sorted = Array.from(productMap.entries())
        .map(([prodName, data]) => ({
          product_name: prodName,
          total_quantity: data.quantity,
          total_revenue: data.revenue,
        }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 10)

      setTopProducts(sorted)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const doneOrders = orders.filter(o => o.status === 'done').length

  const exportCSV = () => {
    const headers = ['ID', 'Data', 'Status', 'Total']
    const rows = orders.map(o => [
      o.id.slice(0, 8),
      formatDateShort(o.created_at),
      o.status,
      o.total.toFixed(2),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vendas-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Relatorios</h2>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-6">
        {([['day', 'Hoje'], ['week', 'Semana'], ['month', 'Mes']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
              period === key ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}>
            <Calendar className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Faturamento</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total de Pedidos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Pedidos Finalizados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{doneOrders}</p>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Produtos mais vendidos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 font-medium text-gray-500">#</th>
              <th className="px-4 py-3 font-medium text-gray-500">Produto</th>
              <th className="px-4 py-3 font-medium text-gray-500">Qtd</th>
              <th className="px-4 py-3 font-medium text-gray-500">Receita</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.product_name} className="border-b border-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.product_name}</td>
                <td className="px-4 py-3">{p.total_quantity}</td>
                <td className="px-4 py-3 font-medium text-orange-500">{formatCurrency(p.total_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {topProducts.length === 0 && (
          <div className="text-center py-10 text-gray-400">Nenhuma venda no periodo</div>
        )}
      </div>
    </div>
  )
}
