'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DeliveryZone } from '@/lib/database.types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DeliveryZone | null>(null)
  const [neighborhood, setNeighborhood] = useState('')
  const [fee, setFee] = useState('')

  const fetchZones = useCallback(async () => {
    const { data } = await supabase.from('delivery_zones').select('*').order('neighborhood')
    setZones(data ?? [])
  }, [])

  useEffect(() => { fetchZones() }, [fetchZones])

  const resetForm = () => {
    setNeighborhood(''); setFee(''); setEditing(null); setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { neighborhood, fee: parseFloat(fee) || 0 }
    if (editing) {
      const { error } = await supabase.from('delivery_zones').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); return }
      toast.success('Bairro atualizado!')
    } else {
      const { error } = await supabase.from('delivery_zones').insert(payload)
      if (error) { toast.error('Erro ao criar'); return }
      toast.success('Bairro cadastrado!')
    }
    resetForm()
    fetchZones()
  }

  const handleEdit = (z: DeliveryZone) => {
    setEditing(z); setNeighborhood(z.neighborhood); setFee(z.fee.toString()); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este bairro?')) return
    await supabase.from('delivery_zones').delete().eq('id', id)
    toast.success('Bairro excluido!')
    fetchZones()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Taxas de Entrega</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
          <Plus className="w-4 h-4" /> Novo Bairro
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">{editing ? 'Editar Bairro' : 'Novo Bairro'}</h3>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" required value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
              placeholder="Nome do bairro" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
            <input type="number" step="0.01" required value={fee} onChange={e => setFee(e.target.value)}
              placeholder="Taxa de entrega (R$)" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
            <button type="submit" className="sm:col-span-2 bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors">
              {editing ? 'Atualizar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 font-medium text-gray-500">Bairro</th>
              <th className="px-4 py-3 font-medium text-gray-500">Taxa</th>
              <th className="px-4 py-3 font-medium text-gray-500">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => (
              <tr key={z.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium">{z.neighborhood}</td>
                <td className="px-4 py-3 font-medium text-orange-500">{formatCurrency(z.fee)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(z)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(z.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {zones.length === 0 && (
          <div className="text-center py-10 text-gray-400">Nenhum bairro cadastrado</div>
        )}
      </div>
    </div>
  )
}
