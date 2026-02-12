const pool = require('../config/database');

class Favorite {
  static async add(userId, assetId) {
    const query = `
      INSERT INTO user_favorites (user_id, asset_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [userId, assetId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to add favorite');
    }
  }

  static async remove(userId, assetId) {
    const query = `
      DELETE FROM user_favorites 
      WHERE user_id = $1 AND asset_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, assetId]);
    return result.rows[0];
  }

  static async getUserFavorites(userId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT a.*, uf.created_at as favorited_at
      FROM assets a
      JOIN user_favorites uf ON a.id = uf.asset_id
      WHERE uf.user_id = $1 AND a.is_active = true
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async isFavorited(userId, assetId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM user_favorites 
        WHERE user_id = $1 AND asset_id = $2
      ) as is_favorited
    `;
    
    const result = await pool.query(query, [userId, assetId]);
    return result.rows[0].is_favorited;
  }

  static async count(userId) {
    const query = `
      SELECT COUNT(*) as total
      FROM user_favorites
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].total);
  }
}

module.exports = Favorite;