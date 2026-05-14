import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Briefcase, Award, Calendar, CheckCircle,
  ArrowLeft, Share2, Bookmark, MessageCircle, Zap,
  Globe, TrendingUp, Shield, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TABS = ['Overview', 'Reviews', 'Availability'];

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

function SkillChip({ skill }) {
  return (
    <motion.span whileHover={{ scale: 1.05, y: -1 }}
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
                 bg-emerald-50 text-emerald-700 border border-emerald-200
                 hover:bg-emerald-100 hover:shadow-glow cursor-default transition-all duration-200">
      {skill.trim()}
    </motion.span>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <motion.div whileHover={{ y: -2 }}
      className="card p-4 text-center group">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-xl font-black text-gray-900">{value ?? '—'}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </motion.div>
  );
}

function ReviewCard({ review }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
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

function ProfileCompletion({ pct }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">Profile Completion</span>
        <span className="text-xs font-bold text-emerald-600">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" />
      </div>
    </div>
  );
}

export default function WorkerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [saved, setSaved] = useState(false);

  const isOwnProfile = authUser && String(authUser.id) === String(id);

  useEffect(() => {
    api.get(`/workers/${id}`)
      .then(res => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
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

  const skills = profile.skills ? profile.skills.split(',').filter(Boolean) : [];
  const languages = profile.languages ? profile.languages.split(',').filter(Boolean) : [];
  const availColor = profile.availability === 'AVAILABLE' ? 'bg-emerald-500' : profile.availability === 'BUSY' ? 'bg-amber-500' : 'bg-gray-400';
  const availLabel = profile.availability === 'AVAILABLE' ? 'Available for work' : profile.availability === 'BUSY' ? 'Currently busy' : 'Unavailable';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-ghost text-sm"><Share2 size={15} /></button>
          <button onClick={() => setSaved(!saved)}
            className={`btn-ghost text-sm ${saved ? 'text-emerald-600' : ''}`}>
            <Bookmark size={15} className={saved ? 'fill-emerald-500' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden">
              {/* Cover gradient */}
              <div className="h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="relative -mt-10 mb-3">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    {profile.profileImageUrl
                      ? <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
                      : <span className="text-white text-2xl font-black">{profile.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className="flex items-start justify-between mb-1">
                  <h1 className="text-xl font-black text-gray-900">{profile.name}</h1>
                  {profile.verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                      <Shield size={11} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600">Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-green text-xs">WORKER</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${availColor}`} />
                    <span className="text-xs text-gray-500">{availLabel}</span>
                  </div>
                </div>

                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={profile.rating} />
                    <span className="text-sm font-bold text-gray-900">{profile.rating}</span>
                    <span className="text-xs text-gray-400">({profile.recentReviews?.length || 0} reviews)</span>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                    <MapPin size={13} className="text-emerald-500" />{profile.location}
                  </div>
                )}

                {profile.latitude && profile.longitude && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg mb-2">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span>{profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}</span>
                  </div>
                )}

                {profile.dailyWage && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 mb-3">
                    <TrendingUp size={13} />₹{profile.dailyWage}/day
                  </div>
                )}

                {profile.profileCompletion !== undefined && (
                  <ProfileCompletion pct={profile.profileCompletion} />
                )}

                {/* Action buttons */}
                {!isOwnProfile && (
                  <div className="space-y-2 mt-4">
                    <button className="btn-primary w-full justify-center py-2.5">
                      <Zap size={15} /> Book Worker
                    </button>
                    <button className="btn-secondary w-full justify-center py-2.5">
                      <MessageCircle size={15} /> Contact
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Quick Info</h3>
              {profile.experienceYears > 0 && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Award size={15} className="text-amber-500 flex-shrink-0" />
                  <span>{profile.experienceYears} years experience</span>
                </div>
              )}
              {profile.totalJobsCompleted > 0 && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                  <span>{profile.totalJobsCompleted} jobs completed</span>
                </div>
              )}
              {languages.length > 0 && (
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Globe size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{languages.join(', ')}</span>
                </div>
              )}
              {profile.availability && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Calendar size={15} className="text-purple-500 flex-shrink-0" />
                  <span>{availLabel}</span>
                </div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-3">
              <StatCard icon={Briefcase} value={profile.totalJobsCompleted} label="Jobs Done" color="bg-emerald-500" />
              <StatCard icon={Star} value={profile.rating > 0 ? profile.rating : '—'} label="Rating" color="bg-amber-500" />
            </motion.div>
          </div>

          {/* ── RIGHT MAIN ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="card p-1 flex gap-1">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  {tab}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">
                  {/* Bio */}
                  {profile.bio && (
                    <div className="card p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-500 rounded-full" /> About
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="card p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-500 rounded-full" /> Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => <SkillChip key={i} skill={s} />)}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {languages.length > 0 && (
                    <div className="card p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-purple-500 rounded-full" /> Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((l, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {l.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!profile.bio && skills.length === 0 && (
                    <div className="card p-12 text-center">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-gray-500 text-sm">No profile details added yet.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'Reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-3">
                  {profile.recentReviews?.length > 0 ? (
                    <>
                      <div className="card p-5 flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-black text-gray-900">{profile.rating}</div>
                          <StarRating rating={profile.rating} size={16} />
                          <div className="text-xs text-gray-400 mt-1">{profile.recentReviews.length} reviews</div>
                        </div>
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map(n => {
                            const count = profile.recentReviews.filter(r => r.rating === n).length;
                            const pct = profile.recentReviews.length ? (count / profile.recentReviews.length) * 100 : 0;
                            return (
                              <div key={n} className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500 w-3">{n}</span>
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-gray-400 w-4">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {profile.recentReviews.map((r, i) => <ReviewCard key={i} review={r} />)}
                    </>
                  ) : (
                    <div className="card p-12 text-center">
                      <div className="text-4xl mb-3">⭐</div>
                      <p className="text-gray-500 text-sm">No reviews yet.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* AVAILABILITY TAB */}
              {activeTab === 'Availability' && (
                <motion.div key="avail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="card p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Current Availability</h3>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                      profile.availability === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      profile.availability === 'BUSY' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${availColor}`} />
                      {availLabel}
                    </div>
                    {profile.dailyWage && (
                      <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-xs text-emerald-600 font-semibold mb-1">Daily Rate</div>
                        <div className="text-2xl font-black text-emerald-700">₹{profile.dailyWage}</div>
                        <div className="text-xs text-emerald-500 mt-0.5">per day</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
