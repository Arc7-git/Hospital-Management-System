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
        // 1. Create doctors table
        await queryPromise(db, `
            CREATE TABLE IF NOT EXISTS doctors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL
            )
        `)
        console.log('✅ doctors table created')

        // 2. Check if doc1 already exists
        const existing = await queryPromise(db, `SELECT id FROM doctors WHERE username = 'doc1'`)
        
        if (existing.length === 0) {
            // Hash the password
            const hashedPassword = await bcrypt.hash('Doc12345', 10)

            await queryPromise(db, `
                INSERT INTO doctors (username, password, name)
                VALUES (?, ?, ?)
            `, ['doc1', hashedPassword, 'Dr. Doc1'])
            console.log('✅ Default doctor account (doc1) created')
        } else {
            console.log('ℹ️  doc1 already exists, skipping insert')
        }

        // 3. Add doctor_id column to patients if it doesn't exist
        const columns = await queryPromise(db, `
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'hospital_db'
            AND TABLE_NAME = 'patients'
            AND COLUMN_NAME = 'doctor_id'
        `)

        if (columns.length === 0) {
            await queryPromise(db, `ALTER TABLE patients ADD COLUMN doctor_id INT`)
            console.log('✅ Added doctor_id column to patients')

            // Get doc1's id
            const doc1 = await queryPromise(db, `SELECT id FROM doctors WHERE username = 'doc1'`)
            const doc1Id = doc1[0].id

            // Assign all existing patients to doc1
            await queryPromise(db, `UPDATE patients SET doctor_id = ? WHERE doctor_id IS NULL`, [doc1Id])
            console.log('✅ All existing patients assigned to doc1')

            // Add foreign key constraint
            await queryPromise(db, `ALTER TABLE patients ADD FOREIGN KEY (doctor_id) REFERENCES doctors(id)`)
            console.log('✅ Foreign key constraint added')
        } else {
            console.log('ℹ️  doctor_id column already exists on patients, skipping')
        }

        // 4. Create medicine_master table
        await queryPromise(db, `
            CREATE TABLE IF NOT EXISTS medicine_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('✅ medicine_master table created')

        console.log('\n🎉 Migration complete!')
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
