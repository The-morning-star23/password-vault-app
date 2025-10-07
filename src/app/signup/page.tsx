// src/app/signup/page.tsx

'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/login'); // Redirect to login page on success
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-xs p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}