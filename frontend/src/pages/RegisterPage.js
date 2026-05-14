import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Phone, Lock, User, Briefcase, Loader2, HardHat } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'WORKER', skills: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone, password: form.password, role: form.role,
        ...(form.role === 'WORKER' && { skills: form.skills }) };
      const { data } = await api.post('/auth/register', payload);
      login(data.token, data.role);
      navigate(data.role === 'WORKER' ? '/worker' : '/provider');
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-black text-white">W</span>
            </div>
            <span className="font-bold text-xl">WorkForce</span>
          </Link>
          <h2 className="text-4xl font-black mb-4 leading-tight">Join India's largest<br />rural workforce network</h2>
          <p className="text-white/70 text-lg mb-12">Free to join. Start earning or hiring in minutes.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Free to join', icon: '🆓' },
              { label: 'Verified profiles', icon: '✅' },
              { label: 'Instant matching', icon: '⚡' },
              { label: 'Secure payments', icon: '🔒' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">WorkForce</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400">Join WorkForce — it's completely free.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'WORKER', label: 'I\'m a Worker', icon: HardHat, desc: 'Looking for work' },
              { value: 'PROVIDER', label: 'I\'m a Provider', icon: Briefcase, desc: 'Hiring workers' },
            ].map(role => (
              <button key={role.value} type="button" onClick={() => setForm(f => ({ ...f, role: role.value }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  form.role === role.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                <role.icon size={20} className={form.role === role.value ? 'text-emerald-600 dark:text-emerald-400 mb-2' : 'text-gray-400 mb-2'} />
                <div className={`font-semibold text-sm ${form.role === role.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {role.label}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{role.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input-field pl-10" placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input-field pl-10" placeholder="10-digit mobile number"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {form.role === 'WORKER' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Skills</label>
                <input type="text" className="input-field" placeholder="e.g. Farming, Carpentry, Plumbing"
                  value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">Separate multiple skills with commas</p>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
