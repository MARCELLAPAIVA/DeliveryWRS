'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DeliveryZone } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ neighborhood: '', fee: '' });
  const [newForm, setNewForm] = useState({ neighborhood: '', fee: '' });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('delivery_zones').select('*').order('neighborhood');
    setZones(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addZone() {
    if (!newForm.neighborhood.trim() || !newForm.fee) return;
    setSaving(true);
    await supabase.from('delivery_zones').insert({ neighborhood: newForm.neighborhood, fee: parseFloat(newForm.fee), active: true });
    toast.success('Bairro adicionado!');
    setNewForm({ neighborhood: '', fee: '' });
    setAdding(false);
    setSaving(false);
    load();
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await supabase.from('delivery_zones').update({ neighborhood: editForm.neighborhood, fee: parseFloat(editForm.fee) }).eq('id', editingId);
    toast.success('Bairro atualizado!');
    setEditingId(null);
    setSaving(false);
    load();
  }

  async function deleteZone(id: string) {
    if (!confirm('Excluir este bairro?')) return;
    await supabase.from('delivery_zones').delete().eq('id', id);
    toast.success('Bairro removido');
    load();
  }

  async function toggleActive(z: DeliveryZone) {
    await supabase.from('delivery_zones').update({ active: !z.active }).eq('id', z.id);
    load();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taxa de Entrega</h1>
          <p className="text-gray-400 text-sm mt-0.5">Bairros e valores</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Novo Bairro
        </button>
      </div>

      {adding && (
        <div className="card mb-4 border-2 border-primary-200">
          <h3 className="font-semibold text-gray-800 mb-3">Novo Bairro</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">Bairro *</label>
              <input className="input" placeholder="Ex: Centro" value={newForm.neighborhood} onChange={(e) => setNewForm({ ...newForm, neighborhood: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="label">Taxa (R$) *</label>
              <input type="number" className="input" placeholder="5.00" min="0" step="0.01" value={newForm.fee} onChange={(e) => setNewForm({ ...newForm, fee: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addZone} disabled={saving} className="btn-primary text-sm py-2 flex items-center gap-1.5">
              {saving ? <Spinner className="text-white w-4 h-4" /> : <><Check size={14} /> Salvar</>}
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-sm py-2"><X size={14} /></button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
      ) : zones.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">Nenhum bairro cadastrado.</div>
      ) : (
        <div className="space-y-2">
          {zones.map((zone) => (
            <div key={zone.id} className={`card ${!zone.active ? 'opacity-60' : ''}`}>
              {editingId === zone.id ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input className="input" value={editForm.neighborhood} onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })} autoFocus />
                    <input type="number" className="input" min="0" step="0.01" value={editForm.fee} onChange={(e) => setEditForm({ ...editForm, fee: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm py-2 flex items-center gap-1.5">
                      {saving ? <Spinner className="text-white w-4 h-4" /> : <><Check size={14} /> Salvar</>}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-sm py-2"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{zone.neighborhood}</p>
                    <p className="text-primary-500 font-bold text-sm">{formatCurrency(zone.fee)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(zone)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${zone.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {zone.active ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => { setEditingId(zone.id); setEditForm({ neighborhood: zone.neighborhood, fee: String(zone.fee) }); }}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-500 flex items-center justify-center"
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteZone(zone.id)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
