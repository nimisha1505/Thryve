import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Meditation } from '../components/Illustrations.jsx';

const Register = () => {
  const { register, error, setError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLocalLoading(true);
      setError(null);
      await register({ name, email, password, avatarUrl, bio });
      navigate('/dashboard');
    } catch (err) {
      // Errors are handled inside the global auth context
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 py-12 relative glow-effect animate-fadeIn">
      <Card hoverable={false} className="w-full max-w-md flex flex-col gap-5">
        <div className="text-center flex flex-col gap-2 items-center">
          <Meditation className="w-20 h-20 mb-1" />
          <h2 className="font-display font-extrabold text-3xl text-gradient">Create Account</h2>
          <p className="text-slate-450 text-sm font-medium">Begin your wellness journey with THRYVE</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Display Name *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eve"
            required
            disabled={localLoading}
          />

          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={localLoading}
          />

          <Input
            label="Password *"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            disabled={localLoading}
          />

          <Input
            label="Avatar URL (Optional)"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            disabled={localLoading}
          />

          <Input
            label="Bio (Optional)"
            type="textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your wellness goals..."
            maxLength={300}
            disabled={localLoading}
            rows={2}
          />

          <Button
            type="submit"
            disabled={localLoading}
            variant="brand"
            className="w-full mt-2"
          >
            {localLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary hover:underline font-bold transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
