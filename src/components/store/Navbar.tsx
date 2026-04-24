'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings } from '@/lib/types';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('*').single().then(({ data }) => setSettings(data));
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            <Image src={settings.logo_url} alt="Logo" width={36} height={36} className="rounded-lg object-contain" />
          ) : (
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
          )}
          <span className="font-bold text-gray-900 text-lg">{settings?.store_name ?? 'Delivery'}</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link href="/orders" className="text-gray-500 hover:text-gray-800 transition-colors">
                <Package size={22} />
              </Link>
              <Link href="/cart" className="relative text-gray-500 hover:text-gray-800 transition-colors">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <User size={18} className="text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Olá,</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{profile?.name ?? user.email}</p>
                    </div>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      <Package size={16} /> Meus Pedidos
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Entrar
                    </Link>
                    <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Criar Conta
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
