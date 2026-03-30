-- Migration: Add title and tags to posts table
-- Run this on existing database

USE sirojulanam_connecthub;

-- Add title column to posts table
ALTER TABLE posts 
  ADD COLUMN title VARCHAR(300) NOT NULL DEFAULT 'Untitled' AFTER type;

-- Create post_tags table if not exists
CREATE TABLE IF NOT EXISTS post_tags (
  post_id BIGINT UNSIGNED NOT NULL,
  tag     VARCHAR(80)     NOT NULL,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_ptag_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
