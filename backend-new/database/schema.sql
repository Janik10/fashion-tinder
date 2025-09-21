-- Fashion Tinder Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS fashion_tinder;
USE fashion_tinder;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Fashion categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fashion brands
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fashion items
CREATE TABLE fashion_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    image_url VARCHAR(500) NOT NULL,
    color_primary VARCHAR(7), -- Hex color
    color_secondary VARCHAR(7), -- Hex color
    season ENUM('spring', 'summer', 'fall', 'winter', 'all-season') DEFAULT 'all-season',
    gender ENUM('men', 'women', 'unisex') DEFAULT 'unisex',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_brand (brand_id),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);

-- Tags for items (many-to-many)
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_tags (
    item_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES fashion_items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- User interactions with items
CREATE TABLE user_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    interaction_type ENUM('like', 'dislike', 'save', 'view') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES fashion_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item_interaction (user_id, item_id, interaction_type),
    INDEX idx_user_interactions (user_id, interaction_type),
    INDEX idx_item_interactions (item_id, interaction_type),
    INDEX idx_created_at (created_at)
);

-- User preferences
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preferred_categories JSON, -- Array of category IDs
    preferred_brands JSON, -- Array of brand IDs
    preferred_colors JSON, -- Array of hex colors
    preferred_price_min DECIMAL(10, 2) DEFAULT 0,
    preferred_price_max DECIMAL(10, 2) DEFAULT 1000,
    preferred_seasons JSON, -- Array of seasons
    preferred_gender ENUM('men', 'women', 'unisex', 'all') DEFAULT 'all',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- Friends system
CREATE TABLE friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_friendships (user_id, status),
    INDEX idx_friend_friendships (friend_id, status)
);

-- Vote sessions for group decisions
CREATE TABLE vote_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    session_code VARCHAR(6) UNIQUE NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_code (session_code),
    INDEX idx_creator (creator_id),
    INDEX idx_status (status)
);

-- Items in vote sessions
CREATE TABLE vote_session_items (
    session_id INT NOT NULL,
    item_id INT NOT NULL,
    added_by_user_id INT NOT NULL,
    PRIMARY KEY (session_id, item_id),
    FOREIGN KEY (session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES fashion_items(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Participants in vote sessions
CREATE TABLE vote_session_participants (
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Votes in sessions
CREATE TABLE session_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    vote ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES fashion_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_user_item_vote (session_id, user_id, item_id),
    INDEX idx_session_votes (session_id, item_id)
);

-- Performance optimization indexes
CREATE INDEX idx_user_interactions_recent ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_fashion_items_active_price ON fashion_items(is_active, price);
CREATE INDEX idx_fashion_items_category_brand ON fashion_items(category_id, brand_id);