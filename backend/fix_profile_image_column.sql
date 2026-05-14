-- Fix profile_image_url column to hold base64 image data
ALTER TABLE users MODIFY COLUMN profile_image_url MEDIUMTEXT;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rural_workforce' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_image_url';
