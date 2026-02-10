CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'creator',
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    requires_attribution BOOLEAN,
    commercial_use_allowed BOOLEAN,
    modifications_allowed BOOLEAN,
    license_text TEXT,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(20) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    preview_url TEXT,
    uploader_id UUID REFERENCES users(id),
    duration_seconds INTEGER,
    file_size BIGINT,
    format VARCHAR(20),
    license_id UUID REFERENCES licenses(id),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    downloads_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE asset_tags (
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, tag_id)
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id)
);

CREATE TABLE asset_categories (
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, category_id)
);

CREATE TABLE user_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, asset_id)
);

CREATE TABLE asset_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id),
    user_id UUID REFERENCES users(id),
    downloaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets(asset_type);

CREATE INDEX idx_assets_created ON assets(created_at DESC);

CREATE INDEX idx_assets_uploader ON assets(uploader_id);

CREATE INDEX idx_tags_name ON tags(name);

INSERT INTO licenses (name, requires_attribution, commercial_use_allowed, modifications_allowed, license_text) VALUES
('CC0 (Public Domain)', false, true, true, 'No rights reserved. Free to use for any purpose.'),
('CC-BY 4.0', true, true, true, 'Free to use with attribution required.'),
('CC-BY-NC 4.0', true, false, true, 'Free for non-commercial use with attribution.'),
('Custom Royalty-Free', false, true, true, 'Royalty-free license for commercial and personal use.');