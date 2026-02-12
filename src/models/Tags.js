const pool = require('../config/database');

class Tag {
  static async create(name) {
    const query = `
      INSERT INTO tags (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [name.toLowerCase()]);
    return result.rows[0];
  }

  static async findOrCreate(name) {
    const normalizedName = name.toLowerCase().trim();
    
    let tag = await this.findByName(normalizedName);
    
    if (!tag) {
      tag = await this.create(normalizedName);
    }
    
    return tag;
  }

  static async findByName(name) {
    const query = 'SELECT * FROM tags WHERE name = $1';
    const result = await pool.query(query, [name.toLowerCase()]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM tags ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async search(keyword) {
    const query = `
      SELECT * FROM tags 
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT 20
    `;
    
    const result = await pool.query(query, [`%${keyword}%`]);
    return result.rows;
  }

  static async addToAsset(assetId, tagId) {
    const query = `
      INSERT INTO asset_tags (asset_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [assetId, tagId]);
    return result.rows[0];
  }

  static async removeFromAsset(assetId, tagId) {
    const query = `
      DELETE FROM asset_tags 
      WHERE asset_id = $1 AND tag_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [assetId, tagId]);
    return result.rows[0];
  }

  static async getAssetTags(assetId) {
    const query = `
      SELECT t.* 
      FROM tags t
      JOIN asset_tags at ON t.id = at.tag_id
      WHERE at.asset_id = $1
      ORDER BY t.name ASC
    `;
    
    const result = await pool.query(query, [assetId]);
    return result.rows;
  }
}

module.exports = Tag;