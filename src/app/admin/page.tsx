'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { ShoppingBag, DollarSign, Package, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, newOrders: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, productsRes, newOrdersRes] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ])

      const orders = ordersRes.data ?? []
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0)

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: productsRes.count ?? 0,
        newOrders: newOrdersRes.count ?? 0,
      })
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Novos Pedidos', value: stats.newOrders.toString(), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total de Pedidos', value: stats.totalOrders.toString(), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Faturamento', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-orange-50 text-orange-600' },
    { label: 'Produtos', value: stats.totalProducts.toString(), icon: Package, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
