'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/lib/database.types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const resetForm = () => {
    setName('')
    setIcon('')
    setSortOrder(0)
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const { error } = await supabase.from('categories').update({ name, icon, sort_order: sortOrder }).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); return }
      toast.success('Categoria atualizada!')
    } else {
      const { error } = await supabase.from('categories').insert({ name, icon, sort_order: sortOrder })
      if (error) { toast.error('Erro ao criar'); return }
      toast.success('Categoria criada!')
    }
    resetForm()
    fetchCategories()
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setIcon(cat.icon)
    setSortOrder(cat.sort_order)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return
    await supabase.from('categories').delete().eq('id', id)
    toast.success('Categoria excluida!')
    fetchCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Categorias</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Nome da categoria" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
            <input type="text" value={icon} onChange={e => setIcon(e.target.value)}
              placeholder="Icone (emoji)" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
            <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="Ordem" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
            <button type="submit" className="sm:col-span-3 bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors">
              {editing ? 'Atualizar' : 'Criar'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 font-medium text-gray-500">Icone</th>
              <th className="px-4 py-3 font-medium text-gray-500">Nome</th>
              <th className="px-4 py-3 font-medium text-gray-500">Ordem</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-gray-50">
                <td className="px-4 py-3 text-xl">{cat.icon || '-'}</td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-10 text-gray-400">Nenhuma categoria cadastrada</div>
        )}
      </div>
    </div>
  )
}
