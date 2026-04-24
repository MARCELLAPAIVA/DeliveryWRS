'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '', sort_order: '0' });
  const [newForm, setNewForm] = useState({ name: '', icon: '', sort_order: '0' });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addCategory() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    await supabase.from('categories').insert({ name: newForm.name, icon: newForm.icon || null, sort_order: parseInt(newForm.sort_order), active: true });
    toast.success('Categoria criada!');
    setNewForm({ name: '', icon: '', sort_order: '0' });
    setAdding(false);
    setSaving(false);
    load();
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await supabase.from('categories').update({ name: editForm.name, icon: editForm.icon || null, sort_order: parseInt(editForm.sort_order) }).eq('id', editingId);
    toast.success('Categoria atualizada!');
    setEditingId(null);
    setSaving(false);
    load();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Excluir categoria?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Categoria excluída');
    load();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {adding && (
        <div className="card mb-4 border-2 border-primary-200">
          <h3 className="font-semibold text-gray-800 mb-3">Nova Categoria</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2">
              <label className="label">Nome *</label>
              <input className="input" placeholder="Ex: Lanches" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="label">Emoji</label>
              <input className="input text-center text-xl" placeholder="🍔" value={newForm.icon} onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })} maxLength={4} />
            </div>
          </div>
          <div className="mb-3">
            <label className="label">Ordem</label>
            <input type="number" className="input w-24" value={newForm.sort_order} onChange={(e) => setNewForm({ ...newForm, sort_order: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={addCategory} disabled={saving} className="btn-primary flex items-center gap-1.5 text-sm py-2">
              {saving ? <Spinner className="text-white w-4 h-4" /> : <><Check size={14} /> Salvar</>}
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary flex items-center gap-1.5 text-sm py-2">
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="text-primary-500 w-8 h-8" /></div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">Nenhuma categoria cadastrada.</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="card">
              {editingId === cat.id ? (
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-2">
                      <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                    </div>
                    <input className="input text-center text-xl" value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} maxLength={4} />
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
                  <div className="flex items-center gap-3">
                    {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                    <div>
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">Ordem: {cat.sort_order}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, icon: cat.icon ?? '', sort_order: String(cat.sort_order) }); }}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-500 flex items-center justify-center"
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center">
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
