import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-5xl font-extrabold mb-4">
        Welcome to Your Secure Vault
      </h1>
      <p className="max-w-xl mb-8 text-lg text-gray-300">
        Generate strong, unique passwords and store them in a vault that only you can access. Your data is encrypted and decrypted directly in your browser.
      </p>
      <div className="flex space-x-4">
        <Link href="/login" className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Login
        </Link>
        <Link href="/signup" className="px-6 py-3 font-semibold text-gray-900 bg-gray-100 rounded-md hover:bg-gray-300">
          Sign Up
        </Link>
      </div>
    </div>
  );
}