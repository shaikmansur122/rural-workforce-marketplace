import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  MapPin, Navigation, Loader2, Star, Award,
  SlidersHorizontal, X, RefreshCw, Wifi, WifiOff, Briefcase
} from 'lucide-react';
import api from '../api/axios';

const NearbyMap = lazy(() => import('./NearbyMap'));

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-100" />
        <div className="flex-1">
          <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-5 w-16 bg-gray-100 rounded-full" />)}
      </div>
      <div className="h-9 bg-gray-100 rounded-xl" />
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
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Search Radius</label>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map(r => (
              <button key={r} onClick={() => setLocal(f => ({ ...f, radius: r }))}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  local.radius === r ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{r} km</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Skill</label>
          <input className="input-field" value={local.skill}
            onChange={e => setLocal(f => ({ ...f, skill: e.target.value }))}
            placeholder="e.g. Farming, Carpentry" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Min Rating</label>
          <input type="number" min="1" max="5" step="0.5" className="input-field"
            value={local.minRating}
            onChange={e => setLocal(f => ({ ...f, minRating: e.target.value }))}
            placeholder="e.g. 3.5" />
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 flex gap-3">
        <button onClick={() => { setFilters(local); onClose(); }} className="btn-primary flex-1">Apply</button>
        <button onClick={() => {
          const reset = { radius: 25, skill: '', minRating: '' };
          setLocal(reset); setFilters(reset); onClose();
        }} className="btn-secondary px-4">Reset</button>
      </div>
    </motion.div>
  );
}

export default function NearbyWorkersTab() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ radius: 25, skill: '', minRating: '' });
  const [bookingWorker, setBookingWorker] = useState(null);

  const fetchNearbyWorkers = useCallback(async (loc, f) => {
    if (!loc) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat: loc.lat, lng: loc.lng, radius: f.radius });
      if (f.skill) params.append('skill', f.skill);
      if (f.minRating) params.append('minRating', f.minRating);
      const res = await api.get(`/workers/nearby?${params}`);
      setWorkers(res.data || []);
    } catch { toast.error('Failed to load nearby workers'); }
    finally { setLoading(false); }
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationStatus('granted');
        try { await api.put('/profile/location', { latitude: loc.lat, longitude: loc.lng }); } catch {}
        fetchNearbyWorkers(loc, filters);
      },
      () => {
        setLocationStatus('denied');
        const fallback = { lat: 25.5941, lng: 85.1376 };
        setUserLocation(fallback);
        fetchNearbyWorkers(fallback, filters);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [filters, fetchNearbyWorkers]);

  useEffect(() => { detectLocation(); }, []); // eslint-disable-line
  useEffect(() => { if (userLocation) fetchNearbyWorkers(userLocation, filters); }, [filters, userLocation, fetchNearbyWorkers]);

  const mapItems = workers.map(w => ({
    id: w.id, type: 'worker',
    lat: w.latitude, lng: w.longitude,
    title: w.name, subtitle: w.skills || '',
    distance: w.distanceKm, rating: w.rating,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Nearby Workers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {locationStatus === 'granted' ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Wifi size={12} /> Location active · {workers.length} workers within {filters.radius} km
              </span>
            ) : locationStatus === 'denied' ? (
              <span className="flex items-center gap-1.5 text-amber-500"><WifiOff size={12} /> Using demo location</span>
            ) : <span className="text-gray-400">Detecting location…</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[['split', '⊞'], ['map', '🗺'], ['list', '☰']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}>{icon}</button>
            ))}
          </div>
          <button onClick={detectLocation} disabled={locationStatus === 'loading'}
            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50">
            {locationStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
          <button onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <SlidersHorizontal size={14} /> Filters
            {(filters.skill || filters.minRating || filters.radius !== 25) && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 220px)' }}>
        {viewMode === 'split' && (
          <div className="grid lg:grid-cols-2 gap-4 h-full">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full min-h-80">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-50"><Loader2 size={28} className="animate-spin text-indigo-500" /></div>}>
                <NearbyMap userLocation={userLocation} items={mapItems} radiusKm={filters.radius}
                  onItemClick={item => setSelectedWorker(workers.find(w => w.id === item.id))} />
              </Suspense>
            </div>
            <div className="overflow-y-auto space-y-3 pr-1">
              {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
               workers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-5xl mb-3">👷</div>
                  <h3 className="font-bold text-gray-900 mb-1">No workers nearby</h3>
                  <p className="text-gray-500 text-sm">Try increasing the radius or changing filters.</p>
                </div>
              ) : workers.map(w => (
                <NearbyWorkerCard key={w.id} worker={w}
                  selected={selectedWorker?.id === w.id}
                  onSelect={() => setSelectedWorker(w)}
                  onBook={() => setBookingWorker(w)} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-50"><Loader2 size={28} className="animate-spin text-indigo-500" /></div>}>
              <NearbyMap userLocation={userLocation} items={mapItems} radiusKm={filters.radius}
                onItemClick={item => setSelectedWorker(workers.find(w => w.id === item.id))} />
            </Suspense>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : workers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-3">👷</div>
                <h3 className="font-bold text-gray-900 mb-1">No workers nearby</h3>
                <p className="text-gray-500 text-sm">Try increasing the radius.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map(w => (
                  <NearbyWorkerCard key={w.id} worker={w}
                    selected={selectedWorker?.id === w.id}
                    onSelect={() => setSelectedWorker(w)}
                    onBook={() => setBookingWorker(w)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected worker detail */}
      <AnimatePresence>
        {selectedWorker && (
          <motion.div
            initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }} transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 flex items-center justify-center font-bold text-xl text-indigo-600 flex-shrink-0">
                  {selectedWorker.profileImageUrl
                    ? <img src={selectedWorker.profileImageUrl.startsWith('/uploads/') ? `http://localhost:8080${selectedWorker.profileImageUrl}` : selectedWorker.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : selectedWorker.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedWorker.name}</h3>
                  <p className="text-sm text-gray-500">{selectedWorker.city}, {selectedWorker.state}</p>
                </div>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500 mb-1">Distance</div>
                <div className="font-bold text-indigo-600">{selectedWorker.distanceKm} km</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500 mb-1">Rating</div>
                <div className="font-bold text-amber-500">⭐ {selectedWorker.rating || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500 mb-1">Jobs Done</div>
                <div className="font-bold text-emerald-600">{selectedWorker.totalJobsCompleted || 0}</div>
              </div>
            </div>

            {selectedWorker.skills && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedWorker.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">{s}</span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setBookingWorker(selectedWorker); setSelectedWorker(null); }}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Briefcase size={16} /> Book Worker
              </button>
              <a href={`https://www.openstreetmap.org/directions?from=${userLocation?.lat},${userLocation?.lng}&to=${selectedWorker.latitude},${selectedWorker.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                <Navigation size={16} /> Directions
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Worker Modal (reuse from ProviderDashboard logic) */}
      <AnimatePresence>
        {bookingWorker && <BookWorkerModal worker={bookingWorker} onClose={() => setBookingWorker(null)} />}
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

function NearbyWorkerCard({ worker, selected, onSelect, onBook }) {
  const availColor = worker.availability === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-gray-300';

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={`card p-5 cursor-pointer hover:-translate-y-0.5 transition-all ${selected ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}>
      <div className="flex gap-3 items-start mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 flex items-center justify-center font-bold text-lg text-indigo-600">
            {worker.profileImageUrl
              ? <img src={worker.profileImageUrl.startsWith('/uploads/') ? `http://localhost:8080${worker.profileImageUrl}` : worker.profileImageUrl} alt="" className="w-full h-full object-cover" />
              : worker.name?.[0]?.toUpperCase()}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${availColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">{worker.name}</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {worker.rating > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Star size={10} className="fill-amber-400 text-amber-400" /> {worker.rating}
              </span>
            )}
            {worker.experienceYears > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Award size={10} /> {worker.experienceYears} yrs
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <MapPin size={10} /> {worker.distanceKm} km
            </span>
          </div>
        </div>
      </div>

      {worker.skills && (
        <div className="flex flex-wrap gap-1 mb-3">
          {worker.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">{s}</span>
          ))}
        </div>
      )}

      <button onClick={e => { e.stopPropagation(); onBook(); }}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
        <Briefcase size={12} /> Book Worker
      </button>
    </motion.div>
  );
}

function BookWorkerModal({ worker, onClose }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingJobId, setBookingJobId] = useState(null);

  useEffect(() => {
    api.get('/jobs/my').then(res => {
      setJobs((res.data || []).filter(j => j.status === 'OPEN'));
    }).catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (jobId) => {
    setBookingJobId(jobId);
    try {
      await api.post('/booking', { jobId, workerId: worker.id });
      toast.success(`${worker.name} booked!`);
      onClose();
    } catch (err) {
      toast.error(typeof err.response?.data === 'string' ? err.response.data : 'Booking failed');
    } finally { setBookingJobId(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Book {worker.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select a job to book this worker for</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-gray-500">No open jobs. Post a job first.</p>
            </div>
          ) : jobs.map(job => (
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
          ))}
        </div>
      </motion.div>
    </div>
  );
}
