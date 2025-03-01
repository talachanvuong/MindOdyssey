CREATE TYPE "correct_answer_type" AS ENUM (
  'A',
  'B',
  'C',
  'D'
);

CREATE TYPE "content_type" AS ENUM (
  'A',
  'B',
  'C',
  'D',
  'Q'
);

CREATE TYPE "document_status" AS ENUM (
  'Đã duyệt',
  'Chưa duyệt',
  'Từ chối'
);

CREATE TABLE "users" (
  "user_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "display_name" VARCHAR(64) NOT NULL,
  "email" VARCHAR(256) UNIQUE NOT NULL,
  "password" VARCHAR(256) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "last_updated" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "courses" (
  "course_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "title" VARCHAR(256) UNIQUE NOT NULL
);

CREATE TABLE "documents" (
  "document_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "title" VARCHAR(256) NOT NULL,
  "description" VARCHAR(2048),
  "total_questions" INT NOT NULL,
  "course_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "last_updated" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "status" document_status NOT NULL DEFAULT ('Chưa duyệt'),
  "admin_id" INT,
  "reject_reason" VARCHAR(2048)
);

CREATE TABLE "questions" (
  "question_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "order" INT NOT NULL,
  "correct_answer" correct_answer_type NOT NULL,
  "document_id" INT NOT NULL
);

CREATE TABLE "contents" (
  "content_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "text" VARCHAR(4096),
  "attachment" VARCHAR(2048),
  "attachment_id" VARCHAR(256),
  "type" content_type NOT NULL,
  "question_id" INT NOT NULL
);

CREATE TABLE "practice_histories" (
  "practice_history_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "score" REAL NOT NULL,
  "detail" JSONB NOT NULL,
  "user_id" INT NOT NULL
);

CREATE TABLE "admins" (
  "admin_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "display_name" VARCHAR(64) UNIQUE NOT NULL,
  "password" VARCHAR(256) NOT NULL
);

CREATE TABLE "refresh_tokens" (
  "rftk_id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL,
  "token" VARCHAR(512) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX ON "contents" ("type", "question_id");

CREATE UNIQUE INDEX ON "practice_histories" ("start_time", "user_id");

ALTER TABLE "contents"
ADD CHECK (
	("text" IS NOT NULL AND "attachment" IS NULL AND "attachment_id" IS NULL) OR
	("text" IS NULL AND "attachment" IS NOT NULL AND "attachment_id" IS NOT NULL) OR
	("text" IS NOT NULL AND "attachment" IS NOT NULL AND "attachment_id" IS NOT NULL)
);

ALTER TABLE "practice_histories"
ADD CHECK ("end_time" > "start_time");

ALTER TABLE "questions" ADD FOREIGN KEY ("document_id") REFERENCES "documents" ("document_id") ON DELETE CASCADE;

ALTER TABLE "documents" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("course_id") ON DELETE RESTRICT;

ALTER TABLE "documents" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT;

ALTER TABLE "documents" ADD FOREIGN KEY ("admin_id") REFERENCES "admins" ("admin_id") ON DELETE RESTRICT;

ALTER TABLE "contents" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") ON DELETE CASCADE;

ALTER TABLE "practice_histories" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE RESTRICT;

ALTER TABLE "refresh_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;
