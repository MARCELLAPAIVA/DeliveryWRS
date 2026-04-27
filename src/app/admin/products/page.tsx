'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/lib/database.types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [active, setActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchData = useCallback(async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ])
    setProducts(prodRes.data ?? [])
    setCategories(catRes.data ?? [])
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setName(''); setDescription(''); setPrice(''); setCategoryId(''); setActive(true)
    setEditing(null); setShowForm(false); setImageFile(null)
  }

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return editing?.image_url ?? ''
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(fileName, imageFile)
    setUploading(false)
    if (error) {
      toast.error('Erro ao fazer upload da imagem')
      return editing?.image_url ?? ''
    }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const imageUrl = await uploadImage()
    const payload = {
      name,
      description,
      price: parseFloat(price) || 0,
      category_id: categoryId,
      active,
      image_url: imageUrl,
    }

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); return }
      toast.success('Produto atualizado!')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast.error('Erro ao criar'); return }
      toast.success('Produto criado!')
    }
    resetForm()
    fetchData()
  }

  const handleEdit = (p: Product) => {
    setEditing(p); setName(p.name); setDescription(p.description)
    setPrice(p.price.toString()); setCategoryId(p.category_id); setActive(p.active)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Produto excluido!')
    fetchData()
  }

  const toggleActive = async (p: Product) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    fetchData()
  }

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '-'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Produtos</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">{editing ? 'Editar Produto' : 'Novo Produto'}</h3>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Nome" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
              <select required value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
                <option value="">Selecione a categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}
                placeholder="Preco" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="accent-orange-500" />
                  Ativo
                </label>
              </div>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Descricao" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4 text-gray-400" />
                {imageFile ? imageFile.name : 'Upload imagem'}
                <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <button type="submit" disabled={uploading}
              className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
              {uploading ? 'Enviando imagem...' : editing ? 'Atualizar' : 'Criar'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Nome</th>
                <th className="px-4 py-3 font-medium text-gray-500">Categoria</th>
                <th className="px-4 py-3 font-medium text-gray-500">Preco</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{getCategoryName(p.category_id)}</td>
                  <td className="px-4 py-3 font-medium text-orange-500">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-10 text-gray-400">Nenhum produto cadastrado</div>
        )}
      </div>
    </div>
  )
}
