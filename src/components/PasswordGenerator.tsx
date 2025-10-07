'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Save } from 'lucide-react';
import CryptoJS from 'crypto-js';

// --- CHANGE 1: Define a specific type for the data being saved ---
type SavePayload = {
  title: string;
  username: string;
  encryptedData: string;
};

// Modal Component
const SaveModal = ({ password, onClose, onSave }: { password: string, onClose: () => void, onSave: (details: SavePayload) => Promise<void> }) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !masterPassword) {
      alert('Title and Master Password are required.');
      return;
    }
    setIsSaving(true);
    const dataToEncrypt = JSON.stringify({ password, url, notes });

    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, masterPassword).toString();
    const encryptedTitle = CryptoJS.AES.encrypt(title, masterPassword).toString();
    const encryptedUsername = CryptoJS.AES.encrypt(username, masterPassword).toString();
    
    await onSave({
      title: encryptedTitle,
      username: encryptedUsername,
      encryptedData,
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
        <h3 className="mb-4 text-xl font-bold">Save to Vault</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Title (e.g., Google, Facebook)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <input type="text" placeholder="Username / Email" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <input type="text" placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-24 px-3 py-2 text-white bg-gray-700 rounded-md resize-none" />
          <input type="password" placeholder="Enter Your Master Password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 rounded-md" />
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Generator Component
export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
  const [copyText, setCopyText] = useState('Copy');
  const [showModal, setShowModal] = useState(false);

  const generatePassword = useCallback(() => {
    // --- CHANGE 2: Removed unused character set variables ---
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const lookAlikeChars = 'l1Io0O';
    
    let charSet = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charSet += '0123456789';
    if (includeSymbols) charSet += symbolChars;

    if (excludeLookAlikes) {
      charSet = charSet.split('').filter(char => !lookAlikeChars.includes(char)).join('');
    }

    if (charSet.length === 0) {
        setPassword("Select at least one character type");
        return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      newPassword += charSet[randomIndex];
    }
    setPassword(newPassword);
  }, [length, includeUppercase, includeNumbers, includeSymbols, excludeLookAlikes]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 2000);
  };

  const handleSaveToApi = async (details: SavePayload) => {
    try {
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save item.');
      }
      alert('Item saved successfully!');
      setShowModal(false);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  return (
    <>
      <div className="w-full max-w-md p-6 space-y-4 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Password Generator</h2>
        <div className="flex items-center p-3 font-mono text-lg text-green-400 bg-gray-900 rounded-md">
          <span className="flex-grow truncate">{password}</span>
          <button onClick={copyToClipboard} className="flex items-center px-3 py-1 ml-4 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <Copy size={16} className="mr-2" />
            {copyText}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="length">Length:</label>
            <span className="px-3 py-1 font-semibold text-white bg-gray-700 rounded-md">{length}</span>
            <input id="length" type="range" min="8" max="32" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-1/2" />
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="flex items-center"><input id="uppercase" type="checkbox" checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} className="w-4 h-4" /><label htmlFor="uppercase" className="ml-2">Uppercase (A-Z)</label></div>
            <div className="flex items-center"><input id="numbers" type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-4 h-4" /><label htmlFor="numbers" className="ml-2">Numbers (0-9)</label></div>
            <div className="flex items-center"><input id="symbols" type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="w-4 h-4" /><label htmlFor="symbols" className="ml-2">Symbols (!@#)</label></div>
            <div className="flex items-center"><input id="lookalikes" type="checkbox" checked={excludeLookAlikes} onChange={(e) => setExcludeLookAlikes(e.target.checked)} className="w-4 h-4" /><label htmlFor="lookalikes" className="ml-2">Exclude Look-Alikes</label></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={generatePassword} className="flex items-center justify-center w-full py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
            <RefreshCw size={18} className="mr-2" />
            Generate
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            <Save size={18} className="mr-2" />
            Save
          </button>
        </div>
      </div>
      {showModal && <SaveModal password={password} onClose={() => setShowModal(false)} onSave={handleSaveToApi} />}
    </>
  );
}