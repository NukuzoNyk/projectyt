const pool = require('../config/database');

class User {
  static async create({ username, email, password_hash }) {
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role, subscription_tier, created_at
    `;
    
    try {
      const result = await pool.query(query, [username, email, password_hash]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, role, subscription_tier, created_at
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = `
      SELECT id, username, email, role, subscription_tier, created_at
      FROM users 
      WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async update(id, { username, email }) {
    const query = `
      UPDATE users 
      SET username = $1, email = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, username, email, role, subscription_tier
    `;
    const result = await pool.query(query, [username, email, id]);
    return result.rows[0];
  }

  static async updateSubscription(id, tier) {
    const query = `
      UPDATE users 
      SET subscription_tier = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, subscription_tier
    `;
    const result = await pool.query(query, [tier, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;