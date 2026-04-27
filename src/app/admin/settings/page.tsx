'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Settings } from '@/lib/database.types'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [storeName, setStoreName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('*').limit(1).single().then(({ data }) => {
      if (data) {
        setSettings(data)
        setStoreName(data.store_name)
        setWhatsapp(data.whatsapp)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setLoading(true)
    let logoUrl = settings.logo_url

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('products').upload(fileName, logoFile)
      if (!uploadErr) {
        const { data } = supabase.storage.from('products').getPublicUrl(fileName)
        logoUrl = data.publicUrl
      }
    }

    const { error } = await supabase
      .from('settings')
      .update({ store_name: storeName, whatsapp, logo_url: logoUrl })
      .eq('id', settings.id)

    setLoading(false)
    if (error) {
      toast.error('Erro ao salvar configuracoes')
    } else {
      toast.success('Configuracoes salvas!')
    }
  }

  if (!settings) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Configuracoes</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
          <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
          <input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
            placeholder="5521999999999" />
          <p className="text-xs text-gray-400 mt-1">Formato: codigo do pais + DDD + numero (sem espacos)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Loja</label>
          {settings.logo_url && (
            <div className="mb-2">
              <img src={settings.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-xl border" />
            </div>
          )}
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4 text-gray-400" />
            {logoFile ? logoFile.name : 'Alterar logo'}
            <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar Configuracoes'}
        </button>
      </form>
    </div>
  )
}
