'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/admin/login');
      else if (profile && !profile.is_admin) router.push('/');
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-primary-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 md:overflow-auto pt-14 md:pt-0">
        <div className="p-5 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
