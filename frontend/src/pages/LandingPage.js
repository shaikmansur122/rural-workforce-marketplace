import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Briefcase, Users, Star, MapPin, CheckCircle,
  Zap, Shield, TrendingUp, ChevronRight, Menu, X
} from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Active Workers' },
  { value: '12K+', label: 'Jobs Posted' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '200+', label: 'Districts Covered' },
];

const features = [
  { icon: Zap, title: 'Instant Matching', desc: 'AI-powered skill matching connects the right worker to the right job in seconds.', color: 'from-amber-400 to-orange-500' },
  { icon: Shield, title: 'Verified Profiles', desc: 'Every worker is background-checked and skill-verified before joining the platform.', color: 'from-blue-400 to-indigo-500' },
  { icon: TrendingUp, title: 'Real-time Tracking', desc: 'Track job status, bookings, and payments in real-time from your dashboard.', color: 'from-emerald-400 to-teal-500' },
  { icon: Star, title: 'Rating System', desc: 'Transparent reviews and ratings build trust between workers and providers.', color: 'from-purple-400 to-pink-500' },
];

const testimonials = [
  { name: 'Ramesh Patel', role: 'Farm Owner, Gujarat', text: 'Found 8 skilled harvesters within 2 hours. This platform is a game changer for rural hiring.', rating: 5, avatar: 'RP' },
  { name: 'Priya Devi', role: 'Skilled Cook, Bihar', text: 'I get consistent work every week. My income has doubled since joining WorkForce.', rating: 5, avatar: 'PD' },
  { name: 'Suresh Kumar', role: 'Carpenter, Maharashtra', text: 'The booking system is so smooth. Providers can find me easily and I get paid on time.', rating: 5, avatar: 'SK' },
];

const floatingCards = [
  { icon: '🌾', title: 'Harvesting', location: 'Patna, Bihar', wage: '₹450/day', badge: 'OPEN' },
  { icon: '🔨', title: 'Carpentry', location: 'Surat, Gujarat', wage: '₹800/day', badge: 'OPEN' },
  { icon: '🍳', title: 'Catering', location: 'Hyderabad', wage: '₹900/day', badge: 'OPEN' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* Floating Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800' : 'py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">WorkForce</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started <ArrowRight size={14} /></Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-col gap-3">
            <Link to="/login" className="btn-secondary w-full justify-center">Sign In</Link>
            <Link to="/register" className="btn-primary w-full justify-center">Get Started</Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-300/15 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left content */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              India's #1 Rural Workforce Platform
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6">
              Connect. Work.{' '}
              <span className="text-gradient">Grow Together.</span>
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
              The modern platform connecting skilled rural workers with job providers across India. 
              Find work, hire talent, and build your future — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link to="/register" className="btn-primary text-base px-6 py-3">
                Find Work Now <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn-secondary text-base px-6 py-3">
                <Briefcase size={16} /> Post a Job
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {['RP', 'PD', 'SK', 'MG'].map((init, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white text-xs font-bold">
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                  <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">4.9</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Trusted by 50,000+ workers</p>
              </div>
            </div>
          </motion.div>

          {/* Right — floating job cards */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block">
            <div className="relative h-[500px]">
              {floatingCards.map((card, i) => (
                <motion.div key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                  className={`absolute card p-5 w-72 cursor-pointer hover:shadow-card-hover ${
                    i === 0 ? 'top-8 left-0' : i === 1 ? 'top-40 right-0' : 'bottom-16 left-12'
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-xl">
                        {card.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{card.title}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <MapPin size={10} />{card.location}
                        </div>
                      </div>
                    </div>
                    <span className="badge-green">{card.badge}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{card.wage}</span>
                    <button className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
                      Apply <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Stats floating card */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-0 right-4 card p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Completed</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">₹1,200</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Earned today</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="text-4xl font-black text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="badge-green mx-auto mb-4">Platform Features</div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Everything you need to{' '}
            <span className="text-gradient">succeed</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Built for the modern rural workforce — powerful tools that make hiring and finding work effortless.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="card p-6 group hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">How it works</h2>
            <p className="text-gray-500 dark:text-gray-400">Get started in 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up as a worker or provider. Add your skills, experience, and bio.', icon: Users },
              { step: '02', title: 'Connect & Match', desc: 'Browse jobs or post openings. Show interest and get matched instantly.', icon: Zap },
              { step: '03', title: 'Work & Earn', desc: 'Accept bookings, complete jobs, get paid, and build your reputation.', icon: TrendingUp },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="relative">
                <div className="card p-8 text-center group hover:-translate-y-1">
                  <div className="text-6xl font-black text-gray-100 dark:text-gray-800 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <item.icon size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Loved by thousands</h2>
          <p className="text-gray-500 dark:text-gray-400">Real stories from real people</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="card p-6 hover:-translate-y-1">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 mx-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <h2 className="text-4xl font-black text-white mb-4 relative">Ready to get started?</h2>
          <p className="text-white/80 mb-8 text-lg relative">Join 50,000+ workers and providers already on WorkForce.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-emerald-600 bg-white hover:bg-gray-50 transition-all hover:scale-[1.02] shadow-lg">
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">WorkForce</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 WorkForce. Empowering rural India.</p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
