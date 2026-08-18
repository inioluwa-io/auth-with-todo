'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // review; consider making this a hook so it can ebe reused in other places - useMe: () => {data, isLoading}. This way you just check for isLoading, data
    const checkAuth = async () => {
      try {
        // Try to get the current user data from a protected endpoint
        // For now, we'll check if they can access this page
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
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/signin');
      }
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

  if (!user) {
    return null;
  }

  const TodoApp = dynamic(() => import('@/components/TodoApp'), { ssr: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Navigation */}
      <nav className="bg-black border-b-4 border-orange-500 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <img className="h-10 w-10" src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1776381295/5366979e657fc9546d942d832169c93a4d9ce075_eorf9k.png" alt="Logo" />
            <div className="flex items-center gap-3">
            <a
              href="/board"
              className="rounded-md px-3 py-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition"
            >
              Task Board
            </a>
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
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gray-800 p-8 shadow-2xl border-b-2 border-gray-500">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-orange-500">Welcome, {user.name}!</h2>
            <p className="mt-2 text-gray-400">You have successfully signed in.</p>
          </div>

          <div className="space-y-4 rounded-lg bg-gray-900 p-6 border border-orange-500">
            <div>
              <p className="text-sm font-medium text-orange-400">Email</p>
              <p className="text-lg text-orange-100">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-400">Name</p>
              <p className="text-lg text-orange-100">{user.name}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg bg-gray-900 p-6 border border-orange-500 mt-8">
            <h3 className="text-lg font-medium text-orange-400">Getting Started</h3>
            <ul className="mt-4 list-inside list-disc space-y-2 text-orange-100">
              <li>Explore your account settings</li>
              <li>Update your profile information</li>
              <li>Manage your security preferences</li>
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-orange-400">Your Todos</h3>
            <TodoApp />
          </div>
        </div>
      </main>
    </div>
  );
}
