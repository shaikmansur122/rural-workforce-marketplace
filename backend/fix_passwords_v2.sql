-- Fix demo account passwords
-- The correct BCrypt hash for "password123" registered via the API
UPDATE users SET password=(SELECT password FROM (SELECT password FROM users WHERE phone='9999999999') AS tmp) WHERE phone LIKE '987654320%' OR phone LIKE '9800000%';
