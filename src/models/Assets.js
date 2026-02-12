const pool = require('../config/database');

class Asset {
  static async create(data) {
    const query = `
      INSERT INTO assets (
        title, description, asset_type, file_url, 
        thumbnail_url, preview_url, uploader_id, 
        duration_seconds, file_size, format, license_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      data.title,
      data.description,
      data.asset_type,
      data.file_url,
      data.thumbnail_url,
      data.preview_url,
      data.uploader_id,
      data.duration_seconds,
      data.file_size,
      data.format,
      data.license_id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM assets 
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByType(assetType, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM assets 
      WHERE asset_type = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [assetType, limit, offset]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT a.*, l.name as license_name, l.requires_attribution,
             u.username as uploader_username
      FROM assets a
      LEFT JOIN licenses l ON a.license_id = l.id
      LEFT JOIN users u ON a.uploader_id = u.id
      WHERE a.id = $1 AND a.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async search(keyword, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM assets 
      WHERE (title ILIKE $1 OR description ILIKE $1)
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const searchTerm = `%${keyword}%`;
    const result = await pool.query(query, [searchTerm, limit, offset]);
    return result.rows;
  }

  static async findByUploader(uploaderId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM assets 
      WHERE uploader_id = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [uploaderId, limit, offset]);
    return result.rows;
  }

  static async update(id, data) {
    const query = `
      UPDATE assets 
      SET title = $1, 
          description = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [data.title, data.description, id]);
    return result.rows[0];
  }

  static async incrementDownloads(id) {
    const query = `
      UPDATE assets 
      SET downloads_count = downloads_count + 1
      WHERE id = $1
      RETURNING downloads_count
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async incrementViews(id) {
    const query = `
      UPDATE assets 
      SET views_count = views_count + 1
      WHERE id = $1
      RETURNING views_count
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async softDelete(id) {
    const query = `
      UPDATE assets 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async hardDelete(id) {
    const query = 'DELETE FROM assets WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Asset;