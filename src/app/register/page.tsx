'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        neighborhood: form.neighborhood,
        city: form.city,
        is_admin: false,
      });
    }
    toast.success('Conta criada! Entrando...');
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-500 text-sm mt-1">Rápido e fácil!</p>
        </div>

        <div className="card">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input name="name" type="text" className="input" placeholder="João Silva" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" placeholder="joao@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Telefone / WhatsApp</label>
              <input name="phone" type="tel" className="input" placeholder="(21) 99999-9999" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Endereço (Rua, Número)</label>
              <input name="address" type="text" className="input" placeholder="Rua das Flores, 123" value={form.address} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Bairro</label>
              <input name="neighborhood" type="text" className="input" placeholder="Centro" value={form.neighborhood} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input name="city" type="text" className="input" placeholder="Rio de Janeiro" value={form.city} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input name="password" type="password" className="input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner className="text-white w-5 h-5" /> : 'Criar Conta'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary-500 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
