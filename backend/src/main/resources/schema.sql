-- Rural Workforce Marketplace — Database Schema (v2)
-- All CREATE TABLE use IF NOT EXISTS — safe to re-run

CREATE TABLE IF NOT EXISTS users (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(100)  NOT NULL,
    phone                VARCHAR(15)   NOT NULL UNIQUE,
    password             VARCHAR(255)  NOT NULL,
    role                 ENUM('WORKER', 'PROVIDER') NOT NULL,
    rating               DECIMAL(3,2)  DEFAULT 0.00,
    skills               VARCHAR(255)  NULL,
    -- v2 additions
    profile_image_url    VARCHAR(500)  NULL,
    experience_years     INT           DEFAULT 0,
    bio                  TEXT          NULL,
    total_jobs_completed INT           DEFAULT 0,
    total_jobs_posted    INT           DEFAULT 0
);

CREATE TABLE IF NOT EXISTS jobs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT        NOT NULL,
    skill       VARCHAR(100)  NOT NULL,
    date        DATE          NOT NULL,
    time_slot   VARCHAR(50)   NOT NULL,
    location    VARCHAR(255)  NOT NULL,
    wage        DECIMAL(10,2) NOT NULL,
    status      ENUM('OPEN','PENDING','BOOKED','COMPLETED') NOT NULL DEFAULT 'OPEN',
    CONSTRAINT fk_jobs_provider FOREIGN KEY (provider_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS interests (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    job_id    BIGINT NOT NULL,
    CONSTRAINT fk_interests_worker FOREIGN KEY (worker_id) REFERENCES users(id),
    CONSTRAINT fk_interests_job    FOREIGN KEY (job_id)    REFERENCES jobs(id),
    CONSTRAINT uq_worker_job       UNIQUE (worker_id, job_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id    BIGINT      NOT NULL,
    worker_id BIGINT      NOT NULL,
    status    ENUM('PENDING','ACCEPTED','REJECTED','COMPLETED') NOT NULL DEFAULT 'PENDING',
    time_slot VARCHAR(50) NOT NULL,
    CONSTRAINT fk_bookings_job    FOREIGN KEY (job_id)    REFERENCES jobs(id),
    CONSTRAINT fk_bookings_worker FOREIGN KEY (worker_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    message    VARCHAR(500) NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- v2: Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id  BIGINT       NOT NULL UNIQUE,
    reviewer_id BIGINT       NOT NULL,
    worker_id   BIGINT       NOT NULL,
    rating      TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT         NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(id),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_worker   FOREIGN KEY (worker_id)   REFERENCES users(id)
);
