import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Briefcase, Calendar, MapPin, Clock, Star, Bell, LogOut,
  Search, ChevronRight, CheckCircle, XCircle, Loader2,
  Edit3, Check, X, User, Zap, Navigation
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import ProfileImageUpload from '../components/ProfileImageUpload';
import NearbyJobsTab from '../components/NearbyJobsTab';

const statusConfig = {
  OPEN:      { label: 'Open',      class: 'badge-green' },
  PENDING:   { label: 'Pending',   class: 'badge-yellow' },
  ACCEPTED:  { label: 'Accepted',  class: 'badge-green' },
  REJECTED:  { label: 'Rejected',  class: 'badge-red' },
  BOOKED:    { label: 'Booked',    class: 'badge-blue' },
  COMPLETED: { label: 'Completed', class: 'badge-purple' },
};

function Sidebar({ activeTab, setActiveTab, profile, logout }) {
  const navItems = [
    { id: 'browse', label: 'Browse Jobs', icon: Briefcase },
    { id: 'nearby', label: 'Nearby Jobs', icon: Navigation },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: User },
  ];
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-2 px-3 py-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white">WorkForce</span>
      </div>

      {profile && (
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {profile.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{profile.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Worker</div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`w-full ${activeTab === item.id ? 'nav-link-active' : 'nav-link'}`}>
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <button onClick={logout} className="nav-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4">
        <LogOut size={18} /> Sign Out
      </button>
    </aside>
  );
}

function JobCard({ job, onInterest }) {
  const [loading, setLoading] = useState(false);
  const [interested, setInterested] = useState(false);

  const handleInterest = async () => {
    setLoading(true);
    try {
      await api.post('/interest', { jobId: job.id });
      toast.success('Interest recorded!');
      setInterested(true);
      if (onInterest) onInterest(job.id);
    } catch (err) {
      if (err.response?.status === 409) { toast.info('Already expressed interest'); setInterested(true); }
      else toast.error(err.response?.data || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 group cursor-pointer hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-xl flex-shrink-0">
            {job.skill === 'Farming' || job.skill === 'Harvesting' ? '🌾' :
             job.skill === 'Carpentry' ? '🔨' : job.skill === 'Cooking' || job.skill === 'Catering' ? '🍳' :
             job.skill === 'Plumbing' ? '🔧' : job.skill === 'Electrical Work' ? '⚡' : '💼'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{job.skill}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.providerName}</p>
          </div>
        </div>
        <span className={statusConfig[job.status]?.class || 'badge-gray'}>{statusConfig[job.status]?.label || job.status}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin size={12} className="text-emerald-500 flex-shrink-0" />{job.location}
        </div>
        {job.latitude && job.longitude && (
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded-lg">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={12} className="text-blue-500 flex-shrink-0" />{job.date}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock size={12} className="text-purple-500 flex-shrink-0" />{job.timeSlot}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{job.wage}</span>
        {interested ? (
          <span className="badge-green"><CheckCircle size={12} /> Interested</span>
        ) : (
          <button onClick={handleInterest} disabled={loading}
            className="btn-primary text-xs px-4 py-2">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <><Zap size={12} /> Show Interest</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function BookingCard({ booking, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleStatus = async status => {
    setLoading(true);
    try {
      await api.put('/booking/status', { bookingId: booking.id, status });
      toast.success(`Booking ${status.toLowerCase()}!`);
      onUpdate();
    } catch (err) { toast.error(err.response?.data || 'Failed'); }
    finally { setLoading(false); }
  };

  const cfg = statusConfig[booking.status] || { label: booking.status, class: 'badge-gray' };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{booking.skill}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{booking.providerName}</p>
        </div>
        <span className={cfg.class}>{cfg.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={11} className="text-blue-500" />{booking.date}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Clock size={11} className="text-purple-500" />{booking.timeSlot}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <MapPin size={11} className="text-emerald-500" />{booking.location}
        </div>
        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{booking.wage}</div>
      </div>
      {booking.status === 'PENDING' && (
        <div className="flex gap-2">
          <button onClick={() => handleStatus('ACCEPTED')} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
            <CheckCircle size={14} /> Accept
          </button>
          <button onClick={() => handleStatus('REJECTED')} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ProfileTab({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', skills: '', bio: '', experienceYears: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', skills: profile.skills || '', bio: profile.bio || '', experienceYears: profile.experienceYears || 0 });
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', form);
      toast.success('Profile updated!');
      setEditing(false);
      onUpdate();
    } catch (err) { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (!profile) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-emerald-500" /></div>;

  const initials = profile.name?.slice(0, 2).toUpperCase() || 'WK';

  return (
    <div className="max-w-2xl">
      <div className="card p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Profile image with upload */}
            <ProfileImageUpload
              currentUrl={profile.profileImageUrl}
              initials={initials}
              onUploaded={onUpdate}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{profile.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{profile.phone}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge-green">WORKER</span>
                {profile.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{profile.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
            <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{profile.totalJobsCompleted || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jobs Completed</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{profile.experienceYears || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Years Experience</div>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Skills</label>
              <input className="input-field" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Farming, Carpentry, Plumbing" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Experience (years)</label>
              <input type="number" className="input-field" value={form.experienceYears} onChange={e => setForm(f => ({ ...f, experienceYears: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
              <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell providers about yourself..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary"><X size={14} /> Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {profile.bio && <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{profile.bio}</p>}
            {profile.skills && (
              <div className="flex flex-wrap gap-2">
                {profile.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try { const res = await api.get('/profile'); setProfile(res.data); } catch {}
  }, []);

  const fetchJobs = useCallback(async (p = 0) => {
    setJobsLoading(true);
    try {
      const res = await api.get(`/jobs?page=${p}&size=20`);
      const d = res.data;
      setJobs(d.content ?? d);
      setTotalPages(d.totalPages ?? 1);
    } catch { toast.error('Failed to load jobs'); }
    finally { setJobsLoading(false); }
  }, []);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try { const res = await api.get('/booking/my'); setBookings(res.data); }
    catch { toast.error('Failed to load bookings'); }
    finally { setBookingsLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { if (activeTab === 'browse') fetchJobs(page); }, [activeTab, page, fetchJobs]);
  useEffect(() => { if (activeTab === 'bookings') fetchBookings(); }, [activeTab, fetchBookings]);

  const filteredJobs = jobs.filter(j =>
    !search || j.skill?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} logout={logout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">WorkForce</span>
            </div>

            {activeTab === 'browse' && (
              <div className="relative flex-1 max-w-md hidden sm:block">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input-field pl-10 py-2.5 text-sm" placeholder="Search jobs by skill or location…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="lg:hidden flex gap-1">
                {[{ id: 'browse', icon: Briefcase }, { id: 'nearby', icon: Navigation }, { id: 'bookings', icon: Calendar }, { id: 'profile', icon: User }].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`p-2.5 rounded-xl transition-colors ${activeTab === t.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}>
                    <t.icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Notification panel */}
        <AnimatePresence>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'browse' && (
              <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Browse Jobs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredJobs.length} open opportunities</p>
                  </div>
                </div>

                {jobsLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="card p-5 animate-pulse">
                        <div className="flex gap-3 mb-4"><div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700" /><div className="flex-1"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded mb-2 w-3/4" /><div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" /></div></div>
                        <div className="space-y-2 mb-4">{[...Array(3)].map((_, j) => <div key={j} className="h-3 bg-gray-100 dark:bg-gray-700 rounded" />)}</div>
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-3xl">🔍</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or check back later.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map(job => <JobCard key={job.id} job={job} onInterest={() => {}} />)}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-sm disabled:opacity-40">← Previous</button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'nearby' && (
              <motion.div key="nearby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full">
                <NearbyJobsTab />
              </motion.div>
            )}

            {activeTab === 'bookings' && (              <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Bookings</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{bookings.length} total bookings</p>
                </div>
                {bookingsLoading ? (
                  <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-emerald-500" /></div>
                ) : bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-3xl">📋</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Browse jobs and show interest to get booked.</p>
                    <button onClick={() => setActiveTab('browse')} className="btn-primary text-sm">Browse Jobs <ChevronRight size={14} /></button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookings.map(b => <BookingCard key={b.id} booking={b} onUpdate={fetchBookings} />)}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Profile</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile and skills</p>
                </div>
                <ProfileTab profile={profile} onUpdate={fetchProfile} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
