import { D1Database } from '@cloudflare/workers-types';
import type { AED, Article, Admin } from '@/types';

// D1 数据库绑定
export const DB = D1Database(this.env) {
  console.log('D1 connected:', this.env);
  return this.env;
});

// AED 操作
export async function getAEDs(lat?: number, lng?: number, limit?: number = 20): {
    const stmt = this.db.prepare('SELECT * FROM aeds WHERE available = ? ORDER by distance ASC LIMIT ?');
    if (!lat || !lng) return [];
    
    const results = await stmt.all<AED>();
      return results.map(row => {
        const lat = row.latitude;
        const lng = row.longitude;
        const distance = calculateDistance(lat, userLat, userLng, lat, lng);
        return { ...row, distance };
      });
      
      return results as AEDApi[];
    } catch (error) {
      return { success: false, error: 'Database error' };
    }
  }

  return results;
}
