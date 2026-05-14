import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Briefcase, CheckCircle, ArrowLeft, Share2,
  Shield, TrendingUp, Users, Calendar, Clock, Loader2,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const TABS = ['About', 'Active Jobs', 'Reviews'];

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

function AnimatedCounter({ value }) {
  return <span className="text-3xl font-black text-gray-900">{value ?? 0}</span>;
}

function ReviewCard({ review }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {review.reviewerName?.[0]?.toUpperCase() || 'R'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 text-sm">{review.reviewerName}</span>
            <StarRating rating={review.rating} size={12} />
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </div>
        </div>
      </div>
      {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
    </motion.div>
  );
}

function JobCard({ job }) {
  const statusColors = {
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <motion.div whileHover={{ y: -2 }} className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900">{job.skill}</h4>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <MapPin size={11} className="text-emerald-500" />{job.location}
          </div>
        </div>
        <span className={`badge border ${statusColors[job.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          {job.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1"><Calendar size={11} />{job.date}</div>
        <div className="flex items-center gap-1"><Clock size={11} />{job.timeSlot}</div>
        <div className="font-bold text-emerald-600 text-sm ml-auto">₹{job.wage}</div>
      </div>
    </motion.div>
  );
}

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('About');

  useEffect(() => {
    Promise.all([
      api.get(`/providers/${id}`),
      api.get(`/providers/${id}/jobs`).catch(() => ({ data: [] })),
    ]).then(([profileRes, jobsRes]) => {
      setProfile(profileRes.data);
      setJobs(jobsRes.data || []);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied!');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h2>
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">Go Back</button>
      </div>
    </div>
  );

  const activeJobs = jobs.filter(j => j.status === 'OPEN' || j.status === 'PENDING');
  const hiringRate = profile.totalJobsPosted > 0
    ? Math.round((profile.totalJobsCompleted / profile.totalJobsPosted) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleShare} className="btn-ghost text-sm"><Share2 size={15} /></button>
      </div>

      {/* Hero banner */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6">
              {/* Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  {profile.profileImageUrl
                    ? <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
                    : <span className="text-white text-2xl font-black">{profile.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-gray-900 truncate">{profile.name}</h1>
                    {profile.verified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 flex-shrink-0">
                        <Shield size={10} className="text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600">Verified</span>
                      </div>
                    )}
                  </div>
                  {profile.businessName && (
                    <p className="text-sm text-gray-500 mt-0.5">{profile.businessName}</p>
                  )}
                  <span className="badge-blue text-xs mt-1 inline-block">PROVIDER</span>
                </div>
              </div>

              {profile.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={profile.rating} />
                  <span className="text-sm font-bold text-gray-900">{profile.rating}</span>
                  <span className="text-xs text-gray-400">({profile.recentReviews?.length || 0})</span>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                  <MapPin size={13} className="text-blue-500" />{profile.location}
                </div>
              )}

              <button className="btn-primary w-full justify-center py-2.5 mb-2">
                <MessageCircle size={15} /> Contact Provider
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Provider Stats</h3>
              <div className="space-y-3">
                {[
                  { icon: Briefcase, label: 'Jobs Posted', value: profile.totalJobsPosted, color: 'text-blue-500' },
                  { icon: CheckCircle, label: 'Jobs Completed', value: profile.totalJobsCompleted, color: 'text-emerald-500' },
                  { icon: TrendingUp, label: 'Hiring Rate', value: `${hiringRate}%`, color: 'text-amber-500' },
                  { icon: Users, label: 'Active Openings', value: activeJobs.length, color: 'text-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <stat.icon size={14} className={stat.color} />
                      {stat.label}
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{stat.value ?? 0}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT MAIN ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stats cards row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3">
              {[
                { label: 'Jobs Posted', value: profile.totalJobsPosted, color: 'from-blue-500 to-indigo-500' },
                { label: 'Completed', value: profile.totalJobsCompleted, color: 'from-emerald-500 to-teal-500' },
                { label: 'Hiring Rate', value: `${hiringRate}%`, color: 'from-amber-500 to-orange-500' },
              ].map((s, i) => (
                <div key={i} className={`card p-4 text-center bg-gradient-to-br ${s.color} text-white`}>
                  <AnimatedCounter value={s.value} />
                  <div className="text-xs text-white/80 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card p-1 flex gap-1">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  {tab}
                  {tab === 'Active Jobs' && activeJobs.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{activeJobs.length}</span>
                  )}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {/* ABOUT TAB */}
              {activeTab === 'About' && (
                <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">
                  {profile.bio ? (
                    <div className="card p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-500 rounded-full" /> About
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
                    </div>
                  ) : (
                    <div className="card p-12 text-center">
                      <div className="text-4xl mb-3">🏢</div>
                      <p className="text-gray-500 text-sm">No bio added yet.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ACTIVE JOBS TAB */}
              {activeTab === 'Active Jobs' && (
                <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-3">
                  {activeJobs.length > 0 ? (
                    activeJobs.map((job, i) => <JobCard key={i} job={job} />)
                  ) : (
                    <div className="card p-12 text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-gray-500 text-sm">No active job openings right now.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'Reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-3">
                  {profile.recentReviews?.length > 0 ? (
                    profile.recentReviews.map((r, i) => <ReviewCard key={i} review={r} />)
                  ) : (
                    <div className="card p-12 text-center">
                      <div className="text-4xl mb-3">⭐</div>
                      <p className="text-gray-500 text-sm">No reviews yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
