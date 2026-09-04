import 'dotenv/config'
import mysql from 'mysql2'
import bcrypt from 'bcryptjs'

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db'
})

db.connect(async (err) => {
    if (err) {
        console.log('Database connection failed')
        console.log(err)
        process.exit(1)
    }

    console.log('Connected to MySQL')

    try {
        // 1. Create admins table
        await queryPromise(db, `
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL
            )
        `)
        console.log('✅ admins table created')

        // 2. Insert default admin account
        const existingAdmin = await queryPromise(db, `SELECT id FROM admins WHERE username = 'ADMIN'`)

        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt.hash('Admin123', 10)
            await queryPromise(db, `
                INSERT INTO admins (username, password, name)
                VALUES (?, ?, ?)
            `, ['ADMIN', hashedPassword, 'Administrator'])
            console.log('✅ Default admin account (ADMIN) created')
        } else {
            console.log('ℹ️  ADMIN already exists, skipping insert')
        }

        // 3. Add profile columns to doctors table if they don't exist
        const addColumnIfNotExists = async (column, type) => {
            const cols = await queryPromise(db, `
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'hospital_db'
                AND TABLE_NAME = 'doctors'
                AND COLUMN_NAME = ?
            `, [column])

            if (cols.length === 0) {
                await queryPromise(db, `ALTER TABLE doctors ADD COLUMN ${column} ${type}`)
                console.log(`✅ Added ${column} column to doctors`)
            } else {
                console.log(`ℹ️  ${column} column already exists on doctors, skipping`)
            }
        }

        await addColumnIfNotExists('degree', "VARCHAR(255) DEFAULT ''")
        await addColumnIfNotExists('experience', "VARCHAR(100) DEFAULT ''")
        await addColumnIfNotExists('speciality', "VARCHAR(255) DEFAULT ''")

        console.log('\n🎉 Admin migration complete!')
        process.exit(0)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
})

function queryPromise(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}
