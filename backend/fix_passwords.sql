UPDATE users SET password='$2a$12$c0r9C/g/Nlz6IUcjXaN18.zOOwGA98q3x79ikzERuTuGnh1NcyZp2' WHERE phone LIKE '987654320%' OR phone LIKE '9800000%';
SELECT COUNT(*) as fixed FROM users WHERE LEFT(password,4)='$2a$';
