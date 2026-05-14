import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

/**
 * ProfileImageUpload — converts image to base64 and saves via PUT /profile
 * Props:
 *   currentUrl  - current profile image URL or base64 string
 *   initials    - fallback initials (e.g. "RY")
 *   onUploaded  - callback(newUrl) called after successful save
 *   size        - 'sm' | 'md' | 'lg' (default 'md')
 */
export default function ProfileImageUpload({ currentUrl, initials = '?', onUploaded, size = 'md' }) {
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const sizeMap = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-28 h-28 text-3xl',
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setSaving(true);

    try {
      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Show preview immediately
      setPreview(base64);

      // Save to backend via profile update
      await api.put('/profile', { profileImageUrl: base64 });

      toast.success('Profile photo updated!');
      if (onUploaded) onUploaded(base64);
    } catch (err) {
      toast.error('Failed to save photo. Please try again.');
      setPreview(null);
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const displayUrl = preview || currentUrl;
  // Handle /uploads/ paths — serve from backend
  const resolvedUrl = displayUrl?.startsWith('/uploads/')
    ? `http://localhost:8080${displayUrl}`
    : displayUrl;

  return (
    <div className="relative inline-block">
      {/* Avatar circle */}
      <div className={`${sizeMap[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-black text-white border-4 border-white shadow-lg relative`}>
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={() => setPreview(null)}
          />
        ) : (
          <span>{initials}</span>
        )}

        {/* Saving overlay */}
        {saving && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Camera button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => !saving && inputRef.current?.click()}
        disabled={saving}
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
        title="Change profile photo"
      >
        <Camera size={13} className="text-white" />
      </motion.button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
