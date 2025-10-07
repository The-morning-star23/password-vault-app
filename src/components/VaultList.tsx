/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { Eye, Copy } from 'lucide-react';

// A type for our decrypted item structure
type DecryptedItem = {
  id: string;
  title: string;
  username: string;
  password?: string;
  url?: string;
};

export default function VaultList() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [decryptedItem, setDecryptedItem] = useState<DecryptedItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/vault');
        const data = await response.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch vault items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleView = (item: any) => {
    setCurrentItem(item);
    setDecryptedItem(null); // Clear previous decrypted data
    setMasterPassword(''); // Clear previous password
    setShowModal(true);
  };

  const handleDecrypt = () => {
    if (!masterPassword || !currentItem) {
      alert('Please enter your master password.');
      return;
    }

    try {
      // Decrypt title and username
      const decryptedTitleBytes = CryptoJS.AES.decrypt(currentItem.title, masterPassword);
      const decryptedTitle = decryptedTitleBytes.toString(CryptoJS.enc.Utf8);

      const decryptedUsernameBytes = CryptoJS.AES.decrypt(currentItem.username, masterPassword);
      const decryptedUsername = decryptedUsernameBytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedTitle) { // A failed decryption will result in an empty string
        throw new Error("Decryption failed. Invalid master password.");
      }

      // Decrypt the main data blob (password, url)
      const decryptedDataBytes = CryptoJS.AES.decrypt(currentItem.encryptedData, masterPassword);
      const decryptedDataJSON = decryptedDataBytes.toString(CryptoJS.enc.Utf8);
      const decryptedData = JSON.parse(decryptedDataJSON);

      setDecryptedItem({
        id: currentItem._id,
        title: decryptedTitle,
        username: decryptedUsername,
        password: decryptedData.password,
        url: decryptedData.url,
      });

    } catch (error) {
      console.error(error);
      alert("Decryption failed. Please check your master password.");
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Password copied to clipboard!');
  }

  if (isLoading) {
    return <div className="text-center">Loading vault...</div>;
  }

  return (
    <>
      <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg">
        <h2 className="mb-4 text-2xl font-bold">Your Vault</h2>
        {items.length === 0 ? (
          <p>Your vault is empty. Save a password to see it here.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-md">
                <div>
                  {/* We can't show the title directly as it's encrypted. We show a placeholder. */}
                  <p className="font-bold">Encrypted Entry</p>
                  <p className="text-sm text-gray-400">Created on: {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleView(item)} className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  <Eye size={16} className="mr-2" />
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decryption Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
            {!decryptedItem ? (
              <>
                <h3 className="mb-4 text-xl font-bold">Enter Master Password</h3>
                <p className="mb-4 text-sm text-gray-400">Enter your master password to decrypt this item. This is done securely in your browser.</p>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full px-3 py-2 mb-4 text-white bg-gray-700 rounded-md"
                  placeholder="Your Master Password"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md">Cancel</button>
                  <button onClick={handleDecrypt} className="px-4 py-2 text-white bg-blue-600 rounded-md">Decrypt</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-2 text-xl font-bold">{decryptedItem.title}</h3>
                <div className="space-y-3 text-gray-300">
                  <p><strong>Username:</strong> {decryptedItem.username}</p>
                  <p><strong>URL:</strong> {decryptedItem.url || 'N/A'}</p>
                  <div className="flex items-center justify-between p-2 font-mono bg-gray-900 rounded-md">
                    <span className="truncate">{decryptedItem.password}</span>
                    <button onClick={() => copyToClipboard(decryptedItem.password)} className="p-2 ml-2 rounded-md hover:bg-gray-600">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}