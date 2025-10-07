/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import CryptoJS from 'crypto-js';
import { Eye, Copy, Trash2, Edit, Search } from 'lucide-react';

type DecryptedItem = {
  id: string;
  title: string;
  username: string;
  password?: string;
  url?: string;
  notes?: string;
};

// Edit Modal (No changes needed, but included for completeness)
const EditModal = ({ item, masterPassword, onClose, onSave }: { item: any, masterPassword: string, onClose: () => void, onSave: (updatedData: any) => Promise<void> }) => {
  const [decryptedData, setDecryptedData] = useState<DecryptedItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const decryptedTitle = CryptoJS.AES.decrypt(item.title, masterPassword).toString(CryptoJS.enc.Utf8);
      const decryptedUsername = CryptoJS.AES.decrypt(item.username, masterPassword).toString(CryptoJS.enc.Utf8);
      const decryptedBlob = CryptoJS.AES.decrypt(item.encryptedData, masterPassword).toString(CryptoJS.enc.Utf8);
      if (!decryptedTitle) throw new Error("Decryption failed");
      const blobData = JSON.parse(decryptedBlob);
      setDecryptedData({ id: item._id, title: decryptedTitle, username: decryptedUsername, ...blobData });
    } catch { alert("Decryption failed. Cannot edit item."); onClose(); }
  }, [item, masterPassword, onClose]);

  const handleFieldChange = (field: keyof DecryptedItem, value: string) => {
    if (decryptedData) setDecryptedData({ ...decryptedData, [field]: value });
  };

  const handleUpdate = async () => {
    if (!decryptedData) return;
    setIsSaving(true);
    const dataToEncrypt = JSON.stringify({ password: decryptedData.password, url: decryptedData.url, notes: decryptedData.notes });
    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, masterPassword).toString();
    const encryptedTitle = CryptoJS.AES.encrypt(decryptedData.title, masterPassword).toString();
    const encryptedUsername = CryptoJS.AES.encrypt(decryptedData.username, masterPassword).toString();
    await onSave({ title: encryptedTitle, username: encryptedUsername, encryptedData });
    setIsSaving(false);
  };

  if (!decryptedData) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"><div className="w-full max-w-md p-6 text-center bg-gray-800 rounded-lg shadow-xl">Decrypting...</div></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
        <h3 className="mb-4 text-xl font-bold">Edit Item</h3>
        <div className="space-y-4">
          <input type="text" value={decryptedData.title} onChange={(e) => handleFieldChange('title', e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <input type="text" value={decryptedData.username} onChange={(e) => handleFieldChange('username', e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <input type="text" value={decryptedData.url || ''} onChange={(e) => handleFieldChange('url', e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <input type="text" value={decryptedData.password || ''} onChange={(e) => handleFieldChange('password', e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <textarea value={decryptedData.notes || ''} onChange={(e) => handleFieldChange('notes', e.target.value)} className="w-full h-24 px-3 py-2 text-white bg-gray-700 rounded-md resize-none" />
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md">Cancel</button>
          <button onClick={handleUpdate} disabled={isSaving} className="px-4 py-2 text-white bg-blue-600 rounded-md disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
};

// Main VaultList Component
export default function VaultList() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [decryptedItem, setDecryptedItem] = useState<DecryptedItem | null>(null);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any | null>(null);

  // --- NEW STATES FOR SEARCH ---
  const [decryptedCache, setDecryptedCache] = useState<DecryptedItem[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vault');
      const data = await response.json();
      if (data.success) setItems(data.data);
    } catch (error) { console.error("Failed to fetch vault items:", error); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDecryptAndUnlock = () => {
    if (!masterPassword || items.length === 0) {
        alert("Please enter master password");
        return;
    }
    try {
      const tempDecryptedCache: DecryptedItem[] = [];
      for (const item of items) {
        const decryptedTitle = CryptoJS.AES.decrypt(item.title, masterPassword).toString(CryptoJS.enc.Utf8);
        if (!decryptedTitle) throw new Error("Invalid master password");
        const decryptedUsername = CryptoJS.AES.decrypt(item.username, masterPassword).toString(CryptoJS.enc.Utf8);
        tempDecryptedCache.push({ id: item._id, title: decryptedTitle, username: decryptedUsername });
      }
      setDecryptedCache(tempDecryptedCache);
      setIsUnlocked(true);
      if (currentItem) {
        handleView(currentItem); // Re-open view modal for the selected item
      }
    } catch {
      alert("Decryption failed. Check master password.");
    }
  };

  const handleView = (item: any) => {
    setCurrentItem(item);
    setDecryptedItem(null);
    setViewModalOpen(true);
    if (!isUnlocked) {
      setMasterPassword(''); // Prompt for password if vault is locked
    } else {
        // If already unlocked, decrypt and show immediately
        handleDecryptSingleItem(item, masterPassword);
    }
  };

  const handleDecryptSingleItem = (itemToDecrypt: any, pass: string) => {
    try {
        const decryptedTitle = CryptoJS.AES.decrypt(itemToDecrypt.title, pass).toString(CryptoJS.enc.Utf8);
        if (!decryptedTitle) throw new Error("Invalid password");
        const decryptedUsername = CryptoJS.AES.decrypt(itemToDecrypt.username, pass).toString(CryptoJS.enc.Utf8);
        const decryptedBlob = CryptoJS.AES.decrypt(itemToDecrypt.encryptedData, pass).toString(CryptoJS.enc.Utf8);
        const blobData = JSON.parse(decryptedBlob);
        setDecryptedItem({ id: itemToDecrypt._id, title: decryptedTitle, username: decryptedUsername, ...blobData });
    } catch {
        alert("Decryption failed. Check master password.");
    }
  };

  // Filter logic using useMemo for performance
  const filteredItems = useMemo(() => {
    if (!searchTerm) return decryptedCache;
    return decryptedCache.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, decryptedCache]);


  const handleEdit = (item: any) => {
    const pass = window.prompt("Please enter your master password to edit this item.");
    if (pass) { setMasterPassword(pass); setCurrentItem(item); setEditModalOpen(true); }
  };
  const handleDelete = async (itemId: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await fetch(`/api/vault/${itemId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error("Failed to delete.");
        fetchItems(); // Refetch items after deleting
        alert("Item deleted.");
      } catch (error) { alert((error as Error).message); }
    }
  };
  const handleSaveUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/vault/${currentItem._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
      if (!response.ok) throw new Error("Failed to update.");
      setEditModalOpen(false);
      await fetchItems();
      setIsUnlocked(false); // Relock vault after an edit for security
      setDecryptedCache([]);
      alert("Item updated successfully!");
    } catch (error) { alert((error as Error).message); }
  };
  const copyToClipboard = (text: string | undefined) => {
    if (text) navigator.clipboard.writeText(text).then(() => alert('Password copied!'));
  };

  if (isLoading) return <div className="text-center">Loading vault...</div>;

  return (
    <>
      <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg">
        <div className="flex flex-col items-start justify-between gap-4 mb-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold">Your Vault</h2>
          {isUnlocked && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute text-gray-400 left-3 top-1/2 -translate-y-1/2" size={20} />
              <input 
                type="text"
                placeholder="Search vault..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-white bg-gray-700 rounded-md"
              />
            </div>
          )}
        </div>
        
        {items.length === 0 ? (<p>Your vault is empty.</p>) : (
          <div className="space-y-3">
            {!isUnlocked ? (
              // Locked view
              items.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-md">
                  <p className="font-bold">Encrypted Entry</p>
                  <button onClick={() => handleView(item)} className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"><Eye size={16} /></button>
                </div>
              ))
            ) : (
              // Unlocked and filtered view
              filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-md">
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.username}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleView(items.find(i => i._id === item.id))} className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700" title="View"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(items.find(i => i._id === item.id))} className="p-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700" title="Edit"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
            {!isUnlocked ? (
                <>
                  <h3 className="mb-4 text-xl font-bold">Unlock Vault</h3>
                  <p className="mb-4 text-sm text-gray-400">Enter your master password to unlock and search your vault. This is done securely in your browser.</p>
                  <input type="password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="w-full px-3 py-2 mb-4 text-white bg-gray-700 rounded-md" placeholder="Your Master Password" />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md">Cancel</button>
                    <button onClick={handleDecryptAndUnlock} className="px-4 py-2 text-white bg-blue-600 rounded-md">Unlock</button>
                  </div>
                </>
              ) : !decryptedItem ? (
                  <div>Loading details...</div>
              ) : (
                <>
                  <h3 className="mb-2 text-xl font-bold">{decryptedItem.title}</h3>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>Username:</strong> {decryptedItem.username}</p>
                    <p><strong>URL:</strong> {decryptedItem.url || 'N/A'}</p>
                    {decryptedItem.notes && <div className="p-2 border border-gray-600 rounded-md"><p><strong>Notes:</strong> {decryptedItem.notes}</p></div>}
                    <div className="flex items-center justify-between p-2 font-mono bg-gray-900 rounded-md">
                      <span className="truncate">{decryptedItem.password}</span>
                      <button onClick={() => copyToClipboard(decryptedItem.password)} className="p-2 ml-2 rounded-md hover:bg-gray-600"><Copy size={18} /></button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md">Close</button>
                  </div>
                </>
              )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && currentItem && ( <EditModal item={currentItem} masterPassword={masterPassword} onClose={() => setEditModalOpen(false)} onSave={handleSaveUpdate} /> )}
    </>
  );
}