'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function BoardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="text-lg text-orange-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const TaskBoard = dynamic(() => import('@/components/TaskBoard'), { ssr: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Navigation */}
      <nav className="bg-black border-b-4 border-orange-500 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                className="h-10 w-10"
                src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1776381295/5366979e657fc9546d942d832169c93a4d9ce075_eorf9k.png"
                alt="Logo"
              />
              <span className="hidden text-lg font-semibold text-orange-500 sm:block">TaskBoard</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition"
              >
                Dashboard
              </Link>
              {/* <span className="hidden text-sm text-gray-400 sm:block">{user.name}</span> */}
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-400 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <TaskBoard />
      </main>
    </div>
  );
}
