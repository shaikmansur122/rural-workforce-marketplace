import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Send, Loader2, MapPin } from 'lucide-react';
import api from '../api/axios';

const TIME_SLOT_REGEX = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

export default function CreateJobForm({ onJobCreated }) {
  const [form, setForm] = useState({ skill: '', date: '', timeSlot: '', location: '', wage: '', latitude: null, longitude: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    // Auto-detect location on component mount
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(f => ({
            ...f,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setGeoLoading(false);
        },
        (error) => {
          console.log('Geolocation error:', error);
          setGeoLoading(false);
        }
      );
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!form.skill.trim()) e.skill = 'Required';
    if (!form.date) e.date = 'Required';
    if (!form.timeSlot.trim()) e.timeSlot = 'Required';
    else if (!TIME_SLOT_REGEX.test(form.timeSlot.trim())) e.timeSlot = 'Format: HH:mm-HH:mm';
    if (!form.location.trim()) e.location = 'Required';
    const w = parseFloat(form.wage);
    if (!form.wage) e.wage = 'Required';
    else if (isNaN(w) || w <= 0) e.wage = 'Must be > 0';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(f => ({
            ...f,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location captured!');
          setGeoLoading(false);
        },
        (error) => {
          toast.error('Unable to get location. Please enable location services.');
          setGeoLoading(false);
        }
      );
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.post('/jobs', {
        skill: form.skill.trim(), date: form.date,
        timeSlot: form.timeSlot.trim(), location: form.location.trim(),
        wage: parseFloat(form.wage),
        latitude: form.latitude,
        longitude: form.longitude
      });
      toast.success('Job posted successfully!');
      setForm({ skill: '', date: '', timeSlot: '', location: '', wage: '', latitude: null, longitude: null });
      setErrors({});
      if (onJobCreated) onJobCreated();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to post job');
    } finally { setSubmitting(false); }
  };

  const Field = ({ name, label, type = 'text', placeholder, half }) => (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input id={name} name={name} type={type}
        className={`input-field ${errors[name] ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
        placeholder={placeholder} value={form[name]} onChange={handleChange} />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="card p-6">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-5">Post a New Job</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field name="skill" label="Required Skill" placeholder="e.g. Harvesting, Plumbing" />
          <Field name="date" label="Work Date" type="date" half />
          <Field name="timeSlot" label="Time Slot" placeholder="09:00-17:00" half />
          <Field name="location" label="Location" placeholder="Village / District" />
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Wage (₹)</label>
            <input name="wage" type="number"
              className={`input-field ${errors.wage ? 'border-red-400' : ''}`}
              placeholder="e.g. 500" value={form.wage} onChange={handleChange} min="1" step="any" />
            {errors.wage && <p className="text-xs text-red-500 mt-1">{errors.wage}</p>}
          </div>
        </div>

        {/* Location Display */}
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
              <div className="text-sm">
                {form.latitude && form.longitude ? (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Location:</span> {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No location captured yet</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={geoLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {geoLoading ? <Loader2 size={12} className="inline animate-spin mr-1" /> : <MapPin size={12} className="inline mr-1" />}
              {geoLoading ? 'Getting...' : 'Get Location'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
          {submitting ? <><Loader2 size={15} className="animate-spin" /> Posting…</> : <><Send size={15} /> Post Job</>}
        </button>
      </form>
    </div>
  );
}
