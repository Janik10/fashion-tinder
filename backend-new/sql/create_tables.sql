-- Create fashion_items table
CREATE TABLE IF NOT EXISTS fashion_items (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    brand VARCHAR(255),
    price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2),
    image_url TEXT,
    product_url TEXT,
    category VARCHAR(255),
    fit VARCHAR(255),
    colors_available TEXT,
    sizes_available TEXT,
    tags TEXT,
    badge VARCHAR(255),
    availability VARCHAR(255),
    rating DECIMAL(3, 2),
    review_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_interactions table for likes/passes/saves
CREATE TABLE IF NOT EXISTS user_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    interaction_type ENUM('like', 'pass', 'save') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES fashion_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_fashion_items_category ON fashion_items(category);
CREATE INDEX idx_fashion_items_brand ON fashion_items(brand);
CREATE INDEX idx_fashion_items_price ON fashion_items(price);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_item_id ON user_interactions(item_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);