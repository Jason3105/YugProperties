/**
 * Storage History Tracking Service
 * Tracks monthly storage usage in the database
 */

const pool = require('../config/database');
const { getStorageStats } = require('../services/firebaseStorage');

/**
 * Update storage history for the current month
 * This should be called after any file upload/delete operation
 */
async function updateStorageHistory() {
  try {
    // Get current Firebase storage stats
    const stats = await getStorageStats();
    
    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Calculate breakdowns
    const imageStats = stats.filesByType.find(t => t.type === 'images') || { count: 0, sizeMB: 0 };
    const brochureStats = stats.filesByType.find(t => t.type === 'brochures') || { count: 0, sizeMB: 0 };
    
    // Upsert into storage_history table
    const query = `
      INSERT INTO storage_history (
        record_month,
        total_files,
        total_size_mb,
        images_count,
        images_size_mb,
        brochures_count,
        brochures_size_mb,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (record_month)
      DO UPDATE SET
        total_files = $2,
        total_size_mb = $3,
        images_count = $4,
        images_size_mb = $5,
        brochures_count = $6,
        brochures_size_mb = $7,
        updated_at = NOW()
      RETURNING *;
    `;
    
    const values = [
      currentMonth,
      stats.totalFiles,
      stats.totalSizeMB,
      imageStats.count,
      imageStats.sizeMB,
      brochureStats.count,
      brochureStats.sizeMB
    ];
    
    const result = await pool.query(query, values);
    console.log(`📊 Storage history updated for ${currentMonth}:`, result.rows[0]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating storage history:', error);
    throw error;
  }
}

/**
 * Get storage history for the last N months
 */
async function getStorageHistory(months = 12) {
  try {
    const query = `
      SELECT 
        record_month,
        total_files,
        total_size_mb,
        images_count,
        images_size_mb,
        brochures_count,
        brochures_size_mb,
        created_at,
        updated_at
      FROM storage_history
      WHERE created_at >= NOW() - INTERVAL '${months} months'
      ORDER BY record_month ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting storage history:', error);
    throw error;
  }
}

module.exports = {
  updateStorageHistory,
  getStorageHistory
};
