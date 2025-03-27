-- Renew schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Admin
SELECT * FROM admins;

-- Content
SELECT * FROM contents;

-- Course
SELECT * FROM courses;

-- Document
SELECT * FROM documents;

-- Practice history
SELECT * FROM practice_histories;

-- Question
SELECT * FROM questions;

-- Refresh token
SELECT * FROM refresh_tokens;

-- User
SELECT * FROM users;

-- Delete document
DELETE FROM documents;
