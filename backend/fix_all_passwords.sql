UPDATE users SET password='$2a$12$c0r9C/g/Nlz6IUcjXaN18.zOOwGA98q3x79ikzERuTuGnh1NcyZp2' WHERE phone != '9999999999';
SELECT COUNT(*) as updated FROM users WHERE LEFT(password,4)='$2a$';
