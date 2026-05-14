import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMapPin, FiClock, FiCalendar, FiStar, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import '../styles/dashboard.css';

function JobCard({ job, onInterestShown, alreadyInterested = false }) {
  const [interested, setInterested] = useState(alreadyInterested);
  const [loading, setLoading] = useState(false);

  const handleInterest = async () => {
    setLoading(true);
    try {
      await api.post('/interest', { jobId: job.id });
      toast.success('Interest recorded!');
      setInterested(true);
      if (onInterestShown) onInterestShown(job.id);
    } catch (err) {
      if (err.response?.status === 409) { toast.info('Already expressed interest'); setInterested(true); }
      else toast.error(err.response?.data || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const statusClass = (job.status || 'open').toLowerCase();

  return (
    <div className="job-card">
      <div className="job-card-header">
        <span className="skill-badge">{job.skill}</span>
        <span className={`status-badge ${statusClass}`}>{job.status || 'OPEN'}</span>
      </div>

      <div className="job-card-body">
        {job.providerName && <div className="provider-name">{job.providerName}</div>}

        <div className="job-info-row"><FiCalendar size={14} /><span>{job.date}</span></div>
        <div className="job-info-row"><FiClock size={14} /><span>{job.timeSlot}</span></div>
        <div className="job-info-row"><FiMapPin size={14} /><span>{job.location}</span></div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
          <span className="wage-value">₹{job.wage}</span>
          {job.providerRating > 0 && (
            <span className="provider-rating"><FiStar size={13} />{job.providerRating}</span>
          )}
        </div>

        {interested ? (
          <button className="btn-already-interested" disabled>
            <FiCheck size={14} style={{marginRight:4}} />Interested
          </button>
        ) : (
          <button className="btn-interested" onClick={handleInterest} disabled={loading}>
            {loading ? 'Submitting…' : 'Show Interest'}
          </button>
        )}
      </div>
    </div>
  );
}

export default JobCard;
