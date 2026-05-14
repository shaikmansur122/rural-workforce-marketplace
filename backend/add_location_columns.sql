-- Add location coordinates to users table
ALTER TABLE users
  ADD COLUMN latitude  DOUBLE DEFAULT NULL,
  ADD COLUMN longitude DOUBLE DEFAULT NULL,
  ADD COLUMN city      VARCHAR(100) DEFAULT NULL,
  ADD COLUMN state     VARCHAR(100) DEFAULT NULL;

-- Add location coordinates to jobs table
ALTER TABLE jobs
  ADD COLUMN latitude  DOUBLE DEFAULT NULL,
  ADD COLUMN longitude DOUBLE DEFAULT NULL;

-- Seed demo worker locations (spread across India)
UPDATE users SET latitude=25.5941, longitude=85.1376,  city='Patna',       state='Bihar'       WHERE phone='9876543201';
UPDATE users SET latitude=26.8467, longitude=80.9462,  city='Lucknow',     state='UP'          WHERE phone='9876543202';
UPDATE users SET latitude=28.6139, longitude=77.2090,  city='Delhi',       state='Delhi'       WHERE phone='9876543203';
UPDATE users SET latitude=19.0760, longitude=72.8777,  city='Mumbai',      state='Maharashtra' WHERE phone='9876543204';
UPDATE users SET latitude=12.9716, longitude=77.5946,  city='Bangalore',   state='Karnataka'   WHERE phone='9876543205';
UPDATE users SET latitude=17.3850, longitude=78.4867,  city='Hyderabad',   state='Telangana'   WHERE phone='9876543206';
UPDATE users SET latitude=22.5726, longitude=88.3639,  city='Kolkata',     state='WB'          WHERE phone='9876543207';
UPDATE users SET latitude=23.0225, longitude=72.5714,  city='Ahmedabad',   state='Gujarat'     WHERE phone='9876543208';
UPDATE users SET latitude=26.9124, longitude=75.7873,  city='Jaipur',      state='Rajasthan'   WHERE phone='9876543209';
UPDATE users SET latitude=21.1458, longitude=79.0882,  city='Nagpur',      state='Maharashtra' WHERE phone='9876543210';
UPDATE users SET latitude=25.3176, longitude=82.9739,  city='Varanasi',    state='UP'          WHERE phone='9876543211';
UPDATE users SET latitude=30.7333, longitude=76.7794,  city='Chandigarh',  state='Punjab'      WHERE phone='9876543212';
UPDATE users SET latitude=11.0168, longitude=76.9558,  city='Coimbatore',  state='TN'          WHERE phone='9876543213';
UPDATE users SET latitude=15.8497, longitude=74.4977,  city='Belgaum',     state='Karnataka'   WHERE phone='9876543214';
UPDATE users SET latitude=20.2961, longitude=85.8245,  city='Bhubaneswar', state='Odisha'      WHERE phone='9876543215';
UPDATE users SET latitude=27.1767, longitude=78.0081,  city='Agra',        state='UP'          WHERE phone='9876543216';
UPDATE users SET latitude=24.5854, longitude=73.7125,  city='Udaipur',     state='Rajasthan'   WHERE phone='9876543217';
UPDATE users SET latitude=22.7196, longitude=75.8577,  city='Indore',      state='MP'          WHERE phone='9876543218';
UPDATE users SET latitude=21.2514, longitude=81.6296,  city='Raipur',      state='CG'          WHERE phone='9876543219';
UPDATE users SET latitude=23.2599, longitude=77.4126,  city='Bhopal',      state='MP'          WHERE phone='9876543220';

-- Seed demo provider locations
UPDATE users SET latitude=25.5941, longitude=85.1376,  city='Patna',       state='Bihar'       WHERE phone='9800000001';
UPDATE users SET latitude=26.8467, longitude=80.9462,  city='Lucknow',     state='UP'          WHERE phone='9800000002';
UPDATE users SET latitude=28.6139, longitude=77.2090,  city='Delhi',       state='Delhi'       WHERE phone='9800000003';
UPDATE users SET latitude=19.0760, longitude=72.8777,  city='Mumbai',      state='Maharashtra' WHERE phone='9800000004';
UPDATE users SET latitude=12.9716, longitude=77.5946,  city='Bangalore',   state='Karnataka'   WHERE phone='9800000005';
UPDATE users SET latitude=17.3850, longitude=78.4867,  city='Hyderabad',   state='Telangana'   WHERE phone='9800000006';
UPDATE users SET latitude=22.5726, longitude=88.3639,  city='Kolkata',     state='WB'          WHERE phone='9800000007';
UPDATE users SET latitude=23.0225, longitude=72.5714,  city='Ahmedabad',   state='Gujarat'     WHERE phone='9800000008';
UPDATE users SET latitude=26.9124, longitude=75.7873,  city='Jaipur',      state='Rajasthan'   WHERE phone='9800000009';
UPDATE users SET latitude=21.1458, longitude=79.0882,  city='Nagpur',      state='Maharashtra' WHERE phone='9800000010';

-- Seed job locations (match provider locations)
UPDATE jobs j JOIN users u ON j.provider_id = u.id
  SET j.latitude = u.latitude, j.longitude = u.longitude
  WHERE u.latitude IS NOT NULL;

SELECT 'Location columns added and seeded successfully' AS result;
