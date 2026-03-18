import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || '5432', 10),
//   ssl: {
//     rejectUnauthorized: false // 💡 ต้องใช้ false เพราะ Render ใช้ใบรับรองจาก CA ที่ไม่เป็นทางการ
//   }
// });
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB connection error:", err));
export default pool;