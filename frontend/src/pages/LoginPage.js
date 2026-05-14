import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Phone, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.role);
      navigate(data.role === 'WORKER' ? '/worker' : '/provider');
    } catch (err) {
      toast.error(err.response?.data || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-black text-white">W</span>
            </div>
            <span className="font-bold text-xl">WorkForce</span>
          </Link>
          <h2 className="text-4xl font-black mb-4 leading-tight">Welcome back to<br />your workspace</h2>
          <p className="text-white/70 text-lg mb-12">Thousands of workers and providers trust WorkForce every day.</p>
          <div className="space-y-4">
            {[
              { icon: '🌾', text: '50,000+ active workers across India' },
              { icon: '💼', text: '12,000+ jobs posted every month' },
              { icon: '⭐', text: '98% satisfaction rate' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">WorkForce</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Sign in</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back! Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input-field pl-10" placeholder="Enter your phone number"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Create one</Link>
          </p>

          <div className="mt-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-emerald-600 dark:text-emerald-500">
              <p>Worker: <span className="font-mono">9876543201</span> / <span className="font-mono">password123</span></p>
              <p>Provider: <span className="font-mono">9800000001</span> / <span className="font-mono">password123</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
