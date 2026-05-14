import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  MapPin, Navigation, Loader2, Star, Clock, Calendar,
  Zap, CheckCircle, SlidersHorizontal, X, Map, List,
  RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import api from '../api/axios';

const NearbyMap = lazy(() => import('./NearbyMap'));

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

const skillEmoji = s => {
  const m = { farming: '🌾', harvesting: '🌾', carpentry: '🔨', cooking: '🍳',
    catering: '🍳', plumbing: '🔧', electrical: '⚡', irrigation: '💧',
    painting: '🎨', masonry: '🧱', driving: '🚗', tailoring: '🧵' };
  return m[s?.toLowerCase()] || '💼';
};

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100" />
        <div className="flex-1">
          <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded" />)}
      </div>
      <div className="h-8 bg-gray-100 rounded-xl" />
    </div>
  );
}

function FilterPanel({ filters, setFilters, onClose }) {
  const [local, setLocal] = useState(filters);

  return (
    <motion.div
      initial={{ opacity: 0, x: 320 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Radius */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Search Radius</label>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map(r => (
              <button key={r} onClick={() => setLocal(f => ({ ...f, radius: r }))}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  local.radius === r
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Skill */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Skill</label>
          <input className="input-field" value={local.skill}
            onChange={e => setLocal(f => ({ ...f, skill: e.target.value }))}
            placeholder="e.g. Farming, Carpentry" />
        </div>

        {/* Wage range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Min Wage (₹)</label>
          <input type="number" className="input-field" value={local.minWage}
            onChange={e => setLocal(f => ({ ...f, minWage: e.target.value }))}
            placeholder="e.g. 300" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Wage (₹)</label>
          <input type="number" className="input-field" value={local.maxWage}
            onChange={e => setLocal(f => ({ ...f, maxWage: e.target.value }))}
            placeholder="e.g. 1000" />
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 flex gap-3">
        <button onClick={() => { setFilters(local); onClose(); }}
          className="btn-primary flex-1">Apply Filters</button>
        <button onClick={() => {
          const reset = { radius: 25, skill: '', minWage: '', maxWage: '' };
          setLocal(reset); setFilters(reset); onClose();
        }} className="btn-secondary px-4">Reset</button>
      </div>
    </motion.div>
  );
}

export default function NearbyJobsTab() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // split | map | list
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ radius: 25, skill: '', minWage: '', maxWage: '' });
  const [interestedIds, setInterestedIds] = useState(new Set());

  const fetchNearbyJobs = useCallback(async (loc, f) => {
    if (!loc) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: loc.lat, lng: loc.lng, radius: f.radius,
      });
      if (f.skill) params.append('skill', f.skill);
      if (f.minWage) params.append('minWage', f.minWage);
      if (f.maxWage) params.append('maxWage', f.maxWage);
      const res = await api.get(`/jobs/nearby?${params}`);
      setJobs(res.data || []);
    } catch { toast.error('Failed to load nearby jobs'); }
    finally { setLoading(false); }
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationStatus('granted');
        // Save to backend
        try { await api.put('/profile/location', { latitude: loc.lat, longitude: loc.lng }); } catch {}
        fetchNearbyJobs(loc, filters);
      },
      err => {
        setLocationStatus('denied');
        toast.error('Location access denied. Using demo location.');
        // Fallback to Patna, Bihar
        const fallback = { lat: 25.5941, lng: 85.1376 };
        setUserLocation(fallback);
        fetchNearbyJobs(fallback, filters);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [filters, fetchNearbyJobs]);

  useEffect(() => { detectLocation(); }, []); // eslint-disable-line

  useEffect(() => {
    if (userLocation) fetchNearbyJobs(userLocation, filters);
  }, [filters, userLocation, fetchNearbyJobs]);

  const handleInterest = async (job) => {
    try {
      await api.post('/interest', { jobId: job.id });
      toast.success('Interest recorded!');
      setInterestedIds(s => new Set([...s, job.id]));
    } catch (err) {
      if (err.response?.status === 409) { toast.info('Already expressed interest'); setInterestedIds(s => new Set([...s, job.id])); }
      else toast.error('Something went wrong');
    }
  };

  // Map items
  const mapItems = jobs.map(j => ({
    id: j.id, type: 'job',
    lat: j.latitude, lng: j.longitude,
    title: j.skill, subtitle: j.location,
    distance: j.distanceKm, wage: j.wage,
    rating: j.providerRating,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Nearby Jobs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {locationStatus === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Wifi size={12} /> Location active · {jobs.length} jobs within {filters.radius} km
              </span>
            ) : locationStatus === 'denied' ? (
              <span className="flex items-center gap-1.5 text-amber-500">
                <WifiOff size={12} /> Using demo location
              </span>
            ) : (
              <span className="text-gray-400">Detecting your location…</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {[['split', '⊞'], ['map', '🗺'], ['list', '☰']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === mode ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'
                }`}>{icon}</button>
            ))}
          </div>

          <button onClick={detectLocation} disabled={locationStatus === 'loading'}
            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            title="Refresh location">
            {locationStatus === 'loading'
              ? <Loader2 size={16} className="animate-spin" />
              : <RefreshCw size={16} />}
          </button>

          <button onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <SlidersHorizontal size={14} /> Filters
            {(filters.skill || filters.minWage || filters.maxWage || filters.radius !== 25) && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 220px)' }}>
        {viewMode === 'split' && (
          <div className="grid lg:grid-cols-2 gap-4 h-full">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 h-full min-h-80">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-50"><Loader2 size={28} className="animate-spin text-indigo-500" /></div>}>
                <NearbyMap
                  userLocation={userLocation}
                  items={mapItems}
                  radiusKm={filters.radius}
                  onItemClick={item => setSelectedJob(jobs.find(j => j.id === item.id))}
                />
              </Suspense>
            </div>

            {/* Job list */}
            <div className="overflow-y-auto space-y-3 pr-1">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-5xl mb-3">🔍</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">No jobs nearby</h3>
                  <p className="text-gray-500 text-sm">Try increasing the radius or changing filters.</p>
                </div>
              ) : (
                jobs.map(job => (
                  <NearbyJobCard
                    key={job.id}
                    job={job}
                    selected={selectedJob?.id === job.id}
                    interested={interestedIds.has(job.id)}
                    onSelect={() => setSelectedJob(job)}
                    onInterest={() => handleInterest(job)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 h-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-50"><Loader2 size={28} className="animate-spin text-indigo-500" /></div>}>
              <NearbyMap
                userLocation={userLocation}
                items={mapItems}
                radiusKm={filters.radius}
                onItemClick={item => setSelectedJob(jobs.find(j => j.id === item.id))}
              />
            </Suspense>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="overflow-y-auto h-full space-y-3 pr-1">
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">No jobs nearby</h3>
                <p className="text-gray-500 text-sm">Try increasing the radius or changing filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map(job => (
                  <NearbyJobCard
                    key={job.id}
                    job={job}
                    selected={selectedJob?.id === job.id}
                    interested={interestedIds.has(job.id)}
                    onSelect={() => setSelectedJob(job)}
                    onInterest={() => handleInterest(job)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected job detail drawer */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-gray-800 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">
                  {skillEmoji(selectedJob.skill)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedJob.skill}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedJob.providerName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="text-xs text-gray-500 mb-1">Distance</div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{selectedJob.distanceKm} km</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="text-xs text-gray-500 mb-1">Wage</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedJob.wage}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedJob.date}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedJob.timeSlot}</div>
              </div>
            </div>

            <div className="flex gap-3">
              {interestedIds.has(selectedJob.id) ? (
                <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle size={16} /> Interest Recorded
                </div>
              ) : (
                <button onClick={() => handleInterest(selectedJob)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Zap size={16} /> Show Interest
                </button>
              )}
              <a
                href={`https://www.openstreetmap.org/directions?from=${userLocation?.lat},${userLocation?.lng}&to=${selectedJob.latitude},${selectedJob.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Navigation size={16} /> Directions
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowFilters(false)} />
            <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NearbyJobCard({ job, selected, interested, onSelect, onInterest }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={`card p-5 cursor-pointer transition-all hover:-translate-y-0.5 ${
        selected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-lg flex-shrink-0">
            {skillEmoji(job.skill)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{job.skill}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{job.providerName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{job.wage}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <MapPin size={10} /> {job.distanceKm} km
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><Calendar size={10} className="text-blue-500" />{job.date}</span>
        <span className="flex items-center gap-1"><Clock size={10} className="text-purple-500" />{job.timeSlot}</span>
        {job.providerRating > 0 && (
          <span className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" />{job.providerRating}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 text-xs text-gray-400 dark:text-gray-500 truncate">
          <MapPin size={10} className="inline mr-1 text-gray-400" />{job.location}
        </div>
        {interested ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
            <CheckCircle size={10} /> Applied
          </span>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onInterest(); }}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-full transition-colors">
            <Zap size={10} /> Apply
          </button>
        )}
      </div>
    </motion.div>
  );
}
