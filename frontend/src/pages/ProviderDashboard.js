import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, PlusCircle, Calendar, Clock, MapPin,
  Star, LogOut, Search, CheckCircle, MessageSquare, Edit3,
  Check, X, Loader2, Award, User, ChevronRight, ExternalLink, Navigation
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CreateJobForm from '../components/CreateJobForm';
import NotificationBell from '../components/NotificationBell';
import ProfileImageUpload from '../components/ProfileImageUpload';
import NearbyWorkersTab from '../components/NearbyWorkersTab';
import '../styles/dashboard.css';

/* ── Status config ── */
const statusConfig = {
  OPEN:      { label: 'Open',      cls: 'open' },
  PENDING:   { label: 'Pending',   cls: 'pending' },
  ACCEPTED:  { label: 'Accepted',  cls: 'accepted' },
  REJECTED:  { label: 'Rejected',  cls: 'rejected' },
  BOOKED:    { label: 'Booked',    cls: 'booked' },
  COMPLETED: { label: 'Completed', cls: 'completed' },
};

/* ── Sidebar ── */
function Sidebar({ activeTab, setActiveTab, profile, logout }) {
  const navItems = [
    { id: 'myJobs',   label: 'My Jobs',          icon: Briefcase },
    { id: 'workers',  label: 'Browse Workers',   icon: Users },
    { id: 'nearby',   label: 'Nearby Workers',   icon: Navigation },
    { id: 'postJob',  label: 'Post Job',          icon: PlusCircle },
    { id: 'profile',  label: 'Profile',           icon: User },
  ];
  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'P';

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 p-4">
      <div className="flex items-center gap-2 px-3 py-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <span className="font-bold text-gray-900">WorkForce</span>
      </div>

      {profile && (
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{profile.name}</div>
            <div className="text-xs text-gray-500">Provider</div>
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

      <button onClick={logout}
        className="nav-link w-full mt-4"
        style={{ color: '#ef4444' }}>
        <LogOut size={18} /> Sign Out
      </button>
    </aside>
  );
}

/* ── Review Modal ── */
function ReviewModal({ booking, onClose, onReviewed }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookingId: booking.id, rating, comment });
      toast.success('Review submitted!');
      onReviewed();
      onClose();
    } catch (err) {
      toast.error(typeof err.response?.data === 'string' ? err.response.data : 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-md p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900">Leave a Review</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Rate your experience with this worker</p>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                className="w-10 h-10 rounded-xl font-bold text-base transition-all"
                style={{
                  border: `2px solid ${n <= rating ? '#f59e0b' : 'var(--border)'}`,
                  background: n <= rating ? '#fef3c7' : '#fff',
                  color: n <= rating ? '#f59e0b' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} size={16}
                className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Comment (optional)</label>
          <textarea className="input-field resize-none" rows={3}
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this worker..." />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
          <button onClick={onClose} className="btn-ghost px-4">
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Applicants Modal ── */
function WorkerModal({ job, onClose, onBooked }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingWorker, setBookingWorker] = useState(null);

  useEffect(() => {
    if (!job) return;
    api.get(`/jobs/${job.id}/interests`)
      .then(res => setWorkers(res.data))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [job]);

  const handleBook = async (workerId) => {
    setBookingWorker(workerId);
    try {
      await api.post('/booking', { jobId: job.id, workerId });
      toast.success('Worker booked successfully!');
      if (onBooked) onBooked();
      onClose();
    } catch (err) {
      toast.error(typeof err.response?.data === 'string' ? err.response.data : 'Booking failed');
    } finally { setBookingWorker(null); }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Applicants</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.skill} · {job.location}</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 py-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
            </div>
          ) : workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-gray-500 text-sm">No applicants yet. Check back later.</p>
            </div>
          ) : (
            workers.map(w => (
              <div key={w.workerId}
                className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {w.workerName?.[0]?.toUpperCase() || 'W'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{w.workerName}</div>
                  {w.workerSkills && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {w.workerSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} className="wf-skill-chip">{s}</span>
                      ))}
                    </div>
                  )}
                  {w.workerRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-600">{w.workerRating}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleBook(w.workerId)}
                  disabled={bookingWorker === w.workerId}
                  className="btn-primary text-xs px-4 py-2 flex-shrink-0">
                  {bookingWorker === w.workerId
                    ? <Loader2 size={12} className="animate-spin" />
                    : 'Book'}
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Provider Job Card ── */
function ProviderJobCard({ job, onViewApplicants, onRefresh }) {
  const [completing, setCompleting] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const statusCfg = statusConfig[job.status] || { label: job.status, cls: 'open' };

  const handleComplete = async () => {
    if (!job.bookingId) return;
    setCompleting(true);
    try {
      await api.patch(`/booking/${job.bookingId}/complete`);
      toast.success('Job marked as completed!');
      onRefresh();
    } catch (err) {
      toast.error(typeof err.response?.data === 'string' ? err.response.data : 'Failed to complete');
    } finally { setCompleting(false); }
  };

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="job-card">
        {/* Card header */}
        <div className="job-card-header">
          <span className="skill-badge">{job.skill}</span>
          <span className={`status-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
        </div>

        {/* Card body */}
        <div className="job-card-body">
          <div className="job-info-row">
            <Calendar size={13} className="text-indigo-500 flex-shrink-0" />
            <span>{job.date}</span>
          </div>
          <div className="job-info-row">
            <Clock size={13} className="text-purple-500 flex-shrink-0" />
            <span>{job.timeSlot}</span>
          </div>
          <div className="job-info-row">
            <MapPin size={13} className="text-indigo-500 flex-shrink-0" />
            <span>{job.location}</span>
          </div>
          <div className="wage-value">₹{job.wage}</div>
        </div>

        {/* Card footer — action buttons */}
        <div style={{ padding: '0 18px 14px' }}>
          {(job.status === 'OPEN' || job.status === 'PENDING') && (
            <button className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={onViewApplicants}>
              <Users size={14} /> View Applicants
            </button>
          )}
          {job.status === 'BOOKED' && (
            <button className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleComplete} disabled={completing || !job.bookingId}>
              {completing
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCircle size={14} />}
              {completing ? 'Completing…' : 'Mark as Completed'}
            </button>
          )}
          {job.status === 'COMPLETED' && (
            <button className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={() => setReviewBooking({ id: job.bookingId })}>
              <MessageSquare size={14} /> Leave Review
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {reviewBooking && (
          <ReviewModal
            booking={reviewBooking}
            onClose={() => setReviewBooking(null)}
            onReviewed={onRefresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Book Worker Modal ── */
function BookWorkerModal({ worker, onClose }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingJobId, setBookingJobId] = useState(null);

  useEffect(() => {
    api.get('/jobs/my').then(res => {
      // Only show OPEN jobs that can be booked
      setJobs((res.data || []).filter(j => j.status === 'OPEN'));
    }).catch(() => toast.error('Failed to load your jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (jobId) => {
    setBookingJobId(jobId);
    try {
      await api.post('/booking', { jobId, workerId: worker.id });
      toast.success(`${worker.name} booked successfully!`);
      onClose();
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Booking failed';
      toast.error(msg);
    } finally { setBookingJobId(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Book {worker.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select which job to book this worker for</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-gray-500">No open jobs available.</p>
              <p className="text-xs text-gray-400 mt-1">Post a job first, then book workers.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{job.skill}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{job.location} · {job.date} · ₹{job.wage}</div>
                </div>
                <button onClick={() => handleBook(job.id)} disabled={bookingJobId === job.id}
                  className="btn-primary text-xs px-4 py-2 flex-shrink-0">
                  {bookingJobId === job.id ? <Loader2 size={12} className="animate-spin" /> : 'Book'}
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Browse Workers Tab ── */
function BrowseWorkers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skill, setSkill] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [bookingWorker, setBookingWorker] = useState(null);
  const skillRef = React.useRef(skill);
  const ratingRef = React.useRef(minRating);

  const fetchWorkers = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, size: 12 });
      if (skillRef.current.trim()) params.append('skill', skillRef.current.trim());
      if (ratingRef.current) params.append('minRating', ratingRef.current);
      const res = await api.get(`/workers?${params}`);
      setWorkers(res.data.content ?? res.data ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch { toast.error('Failed to load workers'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWorkers(page); }, [page, fetchWorkers]);

  const handleSearch = () => {
    skillRef.current = skill;
    ratingRef.current = minRating;
    setPage(0);
    fetchWorkers(0);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filter by Skill</label>
          <input className="input-field" value={skill}
            onChange={e => setSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Farming, Carpentry" />
        </div>
        <div style={{ width: 140 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Rating</label>
          <input className="input-field" type="number" min="1" max="5" step="0.5"
            value={minRating} onChange={e => setMinRating(e.target.value)}
            placeholder="e.g. 3.5" />
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleSearch}>
          <Search size={14} /> Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      ) : workers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-3">👷</div>
          <h3 className="font-bold text-gray-900 mb-1">No workers found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="wf-grid">
          {workers.map(w => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:-translate-y-0.5">
              <div className="flex gap-3 items-start mb-3">
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-lg"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {w.profileImageUrl
                    ? <img src={w.profileImageUrl.startsWith('/uploads/') ? `http://localhost:8080${w.profileImageUrl}` : w.profileImageUrl} alt={w.name} className="w-full h-full object-cover" />
                    : w.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">{w.name}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {w.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Star size={11} className="fill-amber-400 text-amber-400" /> {w.rating}
                      </span>
                    )}
                    {w.experienceYears > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Award size={11} /> {w.experienceYears} yrs
                      </span>
                    )}
                    {w.totalJobsCompleted > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle size={11} /> {w.totalJobsCompleted} done
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {w.bio && (
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {w.bio.length > 90 ? w.bio.slice(0, 90) + '…' : w.bio}
                </p>
              )}
              {w.skills && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {w.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="wf-skill-chip">{s}</span>
                  ))}
                </div>
              )}
              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={() => setBookingWorker(w)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                  <Briefcase size={12} /> Book Worker
                </button>
                <button onClick={() => navigate(`/workers/${w.id}`)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                  <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Worker Modal */}
      <AnimatePresence>
        {bookingWorker && (
          <BookWorkerModal worker={bookingWorker} onClose={() => setBookingWorker(null)} />
        )}
      </AnimatePresence>      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
            className="btn-secondary text-sm disabled:opacity-40">← Previous</button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
            className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', profileImageUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        bio: profile.bio || '',
        profileImageUrl: profile.profileImageUrl || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', form);
      toast.success('Profile updated!');
      setEditing(false);
      onUpdate();
    } catch (err) {
      toast.error(typeof err.response?.data === 'string' ? err.response.data : 'Failed to update profile');
    } finally { setSaving(false); }
  };

  if (!profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const initials = profile.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'P';

  return (
    <div className="max-w-2xl">
      <div className="card p-8">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <ProfileImageUpload
              currentUrl={profile.profileImageUrl}
              initials={initials}
              onUploaded={onUpdate}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-black text-gray-900">{profile.name}</h2>
              {profile.phone && <p className="text-gray-500 text-sm mt-1">{profile.phone}</p>}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="badge-yellow">PROVIDER</span>
                {profile.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-700">{profile.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm flex items-center gap-2">
            <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-50">
            <div className="text-2xl font-black text-indigo-600">{profile.totalJobsPosted || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Jobs Posted</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <div className="text-2xl font-black text-green-600">{profile.totalJobsCompleted || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Jobs Completed</div>
          </div>
        </div>

        {/* Edit form or view */}
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input className="input-field" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                <textarea className="input-field resize-none" rows={3} value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell workers about your business..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-2">
                  <X size={14} /> Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {profile.bio
                ? <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
                : <p className="text-gray-400 text-sm italic">No bio added yet. Click Edit to add one.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Post Job Tab ── */
function PostJobTab({ onJobCreated }) {
  return (
    <div className="max-w-xl">
      <CreateJobForm onJobCreated={onJobCreated} />
    </div>
  );
}

/* ── Provider Dashboard ── */
export default function ProviderDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('myJobs');
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
    } catch { /* silently ignore */ }
  }, []);

  const fetchMyJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const res = await api.get('/jobs/my');
      // Enrich BOOKED/COMPLETED jobs with bookingId
      const enriched = await Promise.all(res.data.map(async (job) => {
        if (job.status === 'BOOKED' || job.status === 'COMPLETED') {
          try {
            const bRes = await api.get(`/booking/my-job/${job.id}`);
            return { ...job, bookingId: bRes?.data?.id };
          } catch { return job; }
        }
        return job;
      }));
      setJobs(enriched);
    } catch {
      setJobs([]);
      toast.error('Failed to load jobs');
    } finally { setJobsLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { if (activeTab === 'myJobs') fetchMyJobs(); }, [activeTab, fetchMyJobs]);

  const tabVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit:    { opacity: 0, y: -20, transition: { duration: 0.15 } },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        logout={logout}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <span className="font-bold text-gray-900">WorkForce</span>
            </div>

            {/* Page title (desktop) */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-black text-gray-900">
                {activeTab === 'myJobs'   && 'My Posted Jobs'}
                {activeTab === 'workers'  && 'Browse Workers'}
                {activeTab === 'nearby'   && 'Nearby Workers'}
                {activeTab === 'postJob'  && 'Post a New Job'}
                {activeTab === 'profile'  && 'My Profile'}
              </h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              <NotificationBell />
              {/* Mobile nav icons */}
              <div className="lg:hidden flex gap-1">
                {[
                  { id: 'myJobs',  icon: Briefcase },
                  { id: 'workers', icon: Users },
                  { id: 'nearby',  icon: Navigation },
                  { id: 'postJob', icon: PlusCircle },
                  { id: 'profile', icon: User },
                ].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`p-2.5 rounded-xl transition-colors ${
                      activeTab === t.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}>
                    <t.icon size={18} />
                  </button>
                ))}
              </div>
              <button onClick={logout}
                className="hidden lg:flex btn-ghost items-center gap-2 text-sm">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {/* ── My Jobs ── */}
            {activeTab === 'myJobs' && (
              <motion.div key="myJobs" variants={tabVariants}
                initial="initial" animate="animate" exit="exit">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
                  </div>
                  <button onClick={() => setActiveTab('postJob')}
                    className="btn-primary flex items-center gap-2 text-sm">
                    <PlusCircle size={14} /> Post New Job
                  </button>
                </div>

                {jobsLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="card p-5 animate-pulse">
                        <div className="flex justify-between mb-4">
                          <div className="h-5 bg-gray-100 rounded-full w-24" />
                          <div className="h-5 bg-gray-100 rounded-full w-16" />
                        </div>
                        <div className="space-y-2 mb-4">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-3 bg-gray-100 rounded w-full" />
                          ))}
                        </div>
                        <div className="h-9 bg-gray-100 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-3xl">📋</div>
                    <h3 className="font-bold text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Post your first job to find skilled workers.</p>
                    <button onClick={() => setActiveTab('postJob')}
                      className="btn-primary flex items-center gap-2 text-sm">
                      <PlusCircle size={14} /> Post a Job <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map(j => (
                      <ProviderJobCard
                        key={j.id}
                        job={j}
                        onViewApplicants={() => setSelectedJob(j)}
                        onRefresh={fetchMyJobs}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Browse Workers ── */}
            {activeTab === 'workers' && (
              <motion.div key="workers" variants={tabVariants}
                initial="initial" animate="animate" exit="exit">
                <BrowseWorkers />
              </motion.div>
            )}

            {/* ── Nearby Workers ── */}
            {activeTab === 'nearby' && (
              <motion.div key="nearby" variants={tabVariants}
                initial="initial" animate="animate" exit="exit"
                className="h-full">
                <NearbyWorkersTab />
              </motion.div>
            )}

            {/* ── Post Job ── */}
            {activeTab === 'postJob' && (
              <motion.div key="postJob" variants={tabVariants}
                initial="initial" animate="animate" exit="exit">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mt-1">Fill in the details to find the right worker</p>
                </div>
                <PostJobTab onJobCreated={() => { setActiveTab('myJobs'); fetchMyJobs(); }} />
              </motion.div>
            )}

            {/* ── Profile ── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={tabVariants}
                initial="initial" animate="animate" exit="exit">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mt-1">Manage your provider profile</p>
                </div>
                <ProfileTab profile={profile} onUpdate={fetchProfile} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Applicants modal */}
      <AnimatePresence>
        {selectedJob && (
          <WorkerModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onBooked={fetchMyJobs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
