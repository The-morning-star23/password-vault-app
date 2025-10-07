'use client';

import { useRouter } from 'next/navigation';
import PasswordGenerator from '@/components/PasswordGenerator';
import VaultList from '@/components/VaultList';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main className="flex flex-col items-center space-y-8">
        <PasswordGenerator />

        <VaultList />
      </main>
    </div>
  );
}