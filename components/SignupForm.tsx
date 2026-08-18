'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    // review; look at react-hook-form npm package.  
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.'); // This is okay but ideally error message should be from back end
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg bg-gray-900 border-b-2 border-gray-500 p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-orange-500">Create Account</h1>

        {error && (
          <div className="rounded-md bg-red-900 p-3 text-red-200 border border-red-500">{error}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-orange-400 font-semibold">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-orange-500 px-4 py-2 bg-gray-800 text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-orange-400 font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-orange-500 px-4 py-2 bg-gray-800 text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-orange-400 font-semibold">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-md  px-4 py-2 bg-gray-800 text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-orange-400 font-semibold"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full rounded-md  px-4 py-2 bg-gray-800 text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-orange-600 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50 transition shadow-lg hover:shadow-orange-600/50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-orange-500 hover:text-orange-400">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
