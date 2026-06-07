'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.push('/dashboard/admin');
      else if (user.role === 'doctor') router.push('/dashboard/doctor');
      else router.push('/dashboard/citizen');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Yönlendiriliyor...</div>
    </div>
  );
}
