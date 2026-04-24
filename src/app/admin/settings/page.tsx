'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { supabase, getImageUrl } from '@/lib/supabase';
import { Settings } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ store_name: '', whatsapp: '' });

  useEffect(() => {
    supabase.from('settings').select('*').single().then(({ data }) => {
      if (data) {
        setSettings(data as Settings);
        setForm({ store_name: data.store_name, whatsapp: data.whatsapp });
        if (data.logo_url) setLogoPreview(data.logo_url);
        if (data.banner_url) setBannerPreview(data.banner_url);
      }
      setLoading(false);
    });
  }, []);

  async function uploadImage(file: File, path: string): Promise<string> {
    await supabase.storage.from('images').upload(path, file, { upsert: true });
    return getImageUrl('images', path);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    const update: Partial<Settings> = { store_name: form.store_name, whatsapp: form.whatsapp };

    if (logoFile) {
      update.logo_url = await uploadImage(logoFile, `settings/logo.${logoFile.name.split('.').pop()}`);
    }
    if (bannerFile) {
      update.banner_url = await uploadImage(bannerFile, `settings/banner.${bannerFile.name.split('.').pop()}`);
    }

    await supabase.from('settings').update(update).eq('id', settings.id);
    toast.success('Configurações salvas!');
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-400 text-sm mt-0.5">Personalize sua loja</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card space-y-5">
          {/* Logo */}
          <div>
            <label className="label">Logo da Loja</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-3xl font-bold text-primary-500">D</div>
                )}
              </div>
              <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
                <Upload size={16} /> Trocar Logo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setLogoFile(f); setLogoPreview(URL.createObjectURL(f));
                }} />
              </label>
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="label">Banner da Loja (opcional)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-gray-50 overflow-hidden">
              {bannerPreview ? (
                <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={22} />
                  <span className="text-sm">Clique para enviar o banner</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setBannerFile(f); setBannerPreview(URL.createObjectURL(f));
              }} />
            </label>
          </div>

          <div>
            <label className="label">Nome da Loja</label>
            <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} required />
          </div>

          <div>
            <label className="label">WhatsApp (com DDD e código do país)</label>
            <input className="input" placeholder="5521985529198" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
            <p className="text-xs text-gray-400 mt-1">Exemplo: 5521985529198 (sem espaços ou traços)</p>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <Spinner className="text-white w-5 h-5" /> : '💾 Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
