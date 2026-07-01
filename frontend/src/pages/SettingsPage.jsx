import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { User, Shield, Sliders, Check } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn max-w-2xl mx-auto py-4">
      <SectionHeader
        title="Sanctuary Settings"
        description="Customize your personal space and privacy preferences"
      />

      <Card hoverable={false} className="flex flex-col gap-6 p-8">
        <div className="flex items-center gap-4 pb-4 border-b border-[#E7D8CC]">
          <div className="w-12 h-12 rounded-full bg-[#FFDCC8] flex items-center justify-center text-[#F59E73] font-bold text-lg">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col">
            <h3 className="font-display font-extrabold text-base text-[#2D2115]">
              {user?.name || 'Anonymous Soul'}
            </h3>
            <span className="text-xs text-[#7A6A5A]">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {success && (
          <div className="bg-[#B8C9A3]/20 border border-[#B8C9A3] text-[#5C7E52] px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully. Breathe deep and enjoy your day!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />

          <Input
            label="Email Address (Private)"
            value={user?.email || ''}
            disabled
            className="opacity-75"
          />

          <Input
            label="Your Bio"
            type="textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short reflection about yourself..."
            rows={3}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="brand">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card hoverable={false} className="flex flex-col gap-4 p-6">
        <h4 className="font-display font-bold text-sm text-[#2D2115] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#F59E73]" />
          <span>Privacy & Security</span>
        </h4>
        <p className="text-xs text-[#7A6A5A] leading-relaxed">
          THRYVE is a safe, stateless system. Your journaling reflections are scanned strictly inside secure endpoints for sentiment analysis and coping suggestions. No personal identity profile info is sold or shared.
        </p>
      </Card>
    </div>
  );
};

export default SettingsPage;
