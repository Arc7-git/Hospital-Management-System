import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const app = express()

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_jwt_secret'

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db'
})

db.connect((err) => {
    if (err) {
        console.log('Database connection failed')
        console.log(err)
        return
    }

    console.log('Connected to MySQL')
})

// ── Auth Middleware ──────────────────────────────────────────────

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.doctorId = decoded.doctorId
        req.doctorName = decoded.name
        req.role = decoded.role || 'doctor'
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' })
    }
}

function verifyAdmin(req, res, next) {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }
    next()
}

// ── Public Routes ───────────────────────────────────────────────

app.get('/', (req, res) => {
    res.send('Hospital Management Backend Running')
})

app.post('/login', (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
    }

    // Check admins table first
    db.query(
        'SELECT * FROM admins WHERE username = ?',
        [username],
        async (err, adminResults) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            if (adminResults.length > 0) {
                const admin = adminResults[0]
                const passwordMatch = await bcrypt.compare(password, admin.password)

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid username or password' })
                }

                const token = jwt.sign(
                    {
                        adminId: admin.id,
                        username: admin.username,
                        name: admin.name,
                        role: 'admin'
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                )

                return res.json({
                    token,
                    role: 'admin',
                    user: {
                        id: admin.id,
                        username: admin.username,
                        name: admin.name
                    }
                })
            }

            // Check doctors table
            db.query(
                'SELECT * FROM doctors WHERE username = ?',
                [username],
                async (err, results) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: 'Database error' })
                    }

                    if (results.length === 0) {
                        return res.status(401).json({ error: 'Invalid username or password' })
                    }

                    const doctor = results[0]
                    const passwordMatch = await bcrypt.compare(password, doctor.password)

                    if (!passwordMatch) {
                        return res.status(401).json({ error: 'Invalid username or password' })
                    }

                    const token = jwt.sign(
                        {
                            doctorId: doctor.id,
                            username: doctor.username,
                            name: doctor.name,
                            role: 'doctor'
                        },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    )

                    res.json({
                        token,
                        role: 'doctor',
                        user: {
                            id: doctor.id,
                            username: doctor.username,
                            name: doctor.name
                        }
                    })
                }
            )
        }
    )
})

// ── Protected Routes ────────────────────────────────────────────

app.get('/me', verifyToken, (req, res) => {
    if (req.role === 'admin') {
        db.query(
            'SELECT id, username, name FROM admins WHERE id = ?',
            [req.doctorId || jwt.verify(req.headers['authorization'].split(' ')[1], JWT_SECRET).adminId],
            (err, results) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ error: 'Database error' })
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Admin not found' })
                }

                res.json({ ...results[0], role: 'admin' })
            }
        )
    } else {
        db.query(
            'SELECT id, username, name FROM doctors WHERE id = ?',
            [req.doctorId],
            (err, results) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ error: 'Database error' })
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Doctor not found' })
                }

                res.json({ ...results[0], role: 'doctor' })
            }
        )
    }
})

// ── Doctor Routes (unchanged) ───────────────────────────────────

app.get('/patients', verifyToken, (req, res) => {

    const query = 'SELECT * FROM patients WHERE doctor_id = ?'

    db.query(query, [req.doctorId], (err, results) => {

        if (err) {
            console.log(err)
            return res.status(500).json({
                error: 'Database error'
            })
        }

        res.json(results)
    })
})

app.post('/patients', verifyToken, (req, res) => {

    const { name, age, gender, phone, blood_group } = req.body

    const query = `
        INSERT INTO patients
        (name, age, gender, phone, blood_group, doctor_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `

    db.query(
        query,
        [name, age, gender, phone, blood_group, req.doctorId],
        (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    error: 'Database error'
                })
            }

            res.json({
                message: 'Patient added successfully',
                id: result.insertId
            })
        }
    )
})

app.put('/patients/:id', verifyToken, (req, res) => {

    const { id } = req.params
    const { name, age, gender, phone, blood_group } = req.body

    const query = `
        UPDATE patients
        SET
            name = ?,
            age = ?,
            gender = ?,
            phone = ?,
            blood_group = ?
        WHERE id = ? AND doctor_id = ?
    `

    db.query(
        query,
        [name, age, gender, phone, blood_group, id, req.doctorId],
        (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    error: 'Database error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(403).json({ error: 'Access denied' })
            }

            res.json({
                message: 'Patient updated successfully'
            })
        }
    )
})

app.delete('/patients/:id', verifyToken, (req, res) => {

    const { id } = req.params

    db.query(
        'DELETE FROM patients WHERE id = ? AND doctor_id = ?',
        [id, req.doctorId],
        (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    error: 'Database error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(403).json({ error: 'Access denied' })
            }

            res.json({
                message: 'Patient deleted successfully'
            })
        }
    )
})

app.get('/patients/:id/visits', verifyToken, (req, res) => {

    const { id } = req.params

    // First verify the patient belongs to this doctor
    db.query(
        'SELECT id FROM patients WHERE id = ? AND doctor_id = ?',
        [id, req.doctorId],
        (err, patientResults) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            if (patientResults.length === 0) {
                return res.status(403).json({ error: 'Access denied' })
            }

            const query = `
                SELECT v.*, 
                COALESCE(
                    (SELECT JSON_ARRAYAGG(JSON_OBJECT('medicine', p.medicine, 'medium', p.medium, 'frequency', p.frequency)) 
                     FROM prescriptions p WHERE p.visit_id = v.id),
                    '[]'
                ) AS prescriptionList
                FROM visits v WHERE v.patient_id = ? ORDER BY v.visit_date DESC
            `;
            db.query(
                query,
                [id],
                (err, results) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({
                            error: 'Database error'
                        })
                    }

                    res.json(results)
                }
            )
        }
    )
})

app.post('/visits', verifyToken, (req, res) => {
    const { patient_id, visit_date, diagnosis, prescriptionList, fees } = req.body;

    // Verify patient belongs to this doctor
    db.query(
        'SELECT id FROM patients WHERE id = ? AND doctor_id = ?',
        [patient_id, req.doctorId],
        (err, patientResults) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            if (patientResults.length === 0) {
                return res.status(403).json({ error: 'Access denied' })
            }
    
            const query = `INSERT INTO visits (patient_id, visit_date, diagnosis, fees) VALUES (?, ?, ?, ?)`;
            
            db.query(query, [patient_id, visit_date, diagnosis, fees], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                const visitId = result.insertId;
                if (prescriptionList && prescriptionList.length > 0) {
                    const presValues = prescriptionList.map(p => [visitId, p.medicine, p.medium, p.frequency]);
                    db.query('INSERT INTO prescriptions (visit_id, medicine, medium, frequency) VALUES ?', [presValues], (err) => {
                        if (err) console.log(err);
                        res.json({ message: 'Visit added successfully', id: visitId });
                    });
                } else {
                    res.json({ message: 'Visit added successfully', id: visitId });
                }
            });
        }
    )
})

app.put('/visits/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { visit_date, diagnosis, prescriptionList, fees } = req.body;

    // Verify visit belongs to a patient of this doctor
    db.query(
        `SELECT v.id FROM visits v 
         JOIN patients p ON v.patient_id = p.id 
         WHERE v.id = ? AND p.doctor_id = ?`,
        [id, req.doctorId],
        (err, visitResults) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            if (visitResults.length === 0) {
                return res.status(403).json({ error: 'Access denied' })
            }

            const query = `UPDATE visits SET visit_date = ?, diagnosis = ?, fees = ? WHERE id = ?`;

            db.query(query, [visit_date, diagnosis, fees, id], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Database error' });
                }

                db.query('DELETE FROM prescriptions WHERE visit_id = ?', [id], (err) => {
                    if (err) console.log(err);
                    if (prescriptionList && prescriptionList.length > 0) {
                        const presValues = prescriptionList.map(p => [id, p.medicine, p.medium, p.frequency]);
                        db.query('INSERT INTO prescriptions (visit_id, medicine, medium, frequency) VALUES ?', [presValues], (err) => {
                            if (err) console.log(err);
                            res.json({ message: 'Visit updated successfully' });
                        });
                    } else {
                        res.json({ message: 'Visit updated successfully' });
                    }
                });
            });
        }
    )
})


app.delete('/visits/:id', verifyToken, (req, res) => {

    const { id } = req.params

    // Verify visit belongs to a patient of this doctor
    db.query(
        `SELECT v.id FROM visits v 
         JOIN patients p ON v.patient_id = p.id 
         WHERE v.id = ? AND p.doctor_id = ?`,
        [id, req.doctorId],
        (err, visitResults) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            if (visitResults.length === 0) {
                return res.status(403).json({ error: 'Access denied' })
            }

            db.query(
                'DELETE FROM visits WHERE id = ?',
                [id],
                (err) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({
                            error: 'Database error'
                        })
                    }

                    res.json({
                        message: 'Visit deleted successfully'
                    })
                }
            )
        }
    )
})

app.get('/dashboard/stats', verifyToken, (req, res) => {

    const stats = {}

    db.query(
        'SELECT COUNT(*) AS totalPatients FROM patients WHERE doctor_id = ?',
        [req.doctorId],
        (err, patientResults) => {

            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            stats.totalPatients = patientResults[0].totalPatients

            db.query(
                `SELECT COUNT(*) AS totalVisits FROM visits v
                 JOIN patients p ON v.patient_id = p.id
                 WHERE p.doctor_id = ?`,
                [req.doctorId],
                (err, visitResults) => {

                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: 'Database error' })
                    }

                    stats.totalVisits = visitResults[0].totalVisits

                    db.query(
                        `SELECT COALESCE(SUM(v.fees), 0) AS totalRevenue FROM visits v
                         JOIN patients p ON v.patient_id = p.id
                         WHERE p.doctor_id = ?`,
                        [req.doctorId],
                        (err, revenueResults) => {

                            if (err) {
                                console.log(err)
                                return res.status(500).json({ error: 'Database error' })
                            }

                            stats.totalRevenue = revenueResults[0].totalRevenue

                            db.query(
                                `SELECT COUNT(*) AS todayVisits
                                 FROM visits v
                                 JOIN patients p ON v.patient_id = p.id
                                 WHERE DATE(v.visit_date) = CURDATE()
                                 AND p.doctor_id = ?`,
                                [req.doctorId],
                                (err, todayResults) => {

                                    if (err) {
                                        console.log(err)
                                        return res.status(500).json({ error: 'Database error' })
                                    }

                                    stats.todayVisits = todayResults[0].todayVisits

                                    res.json(stats)
                                }
                            )
                        }
                    )
                }
            )
        }
    )
})

// ── Admin Routes ────────────────────────────────────────────────

app.get('/admin/dashboard/stats', verifyToken, verifyAdmin, (req, res) => {
    const stats = {}

    db.query('SELECT COUNT(*) AS totalPatients FROM patients', (err, patientResults) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: 'Database error' })
        }

        stats.totalPatients = patientResults[0].totalPatients

        db.query('SELECT COUNT(*) AS totalVisits FROM visits', (err, visitResults) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            stats.totalVisits = visitResults[0].totalVisits

            db.query('SELECT COALESCE(SUM(fees), 0) AS totalRevenue FROM visits', (err, revenueResults) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ error: 'Database error' })
                }

                stats.totalRevenue = revenueResults[0].totalRevenue

                db.query(
                    `SELECT COUNT(*) AS todayVisits FROM visits WHERE DATE(visit_date) = CURDATE()`,
                    (err, todayResults) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json({ error: 'Database error' })
                        }

                        stats.todayVisits = todayResults[0].todayVisits
                        res.json(stats)
                    }
                )
            })
        })
    })
})

app.get('/admin/doctors', verifyToken, verifyAdmin, (req, res) => {
    db.query(
        'SELECT id, username, name, degree, experience, speciality FROM doctors',
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }
            res.json(results)
        }
    )
})

app.post('/admin/doctors', verifyToken, verifyAdmin, async (req, res) => {
    const { name, degree, experience, speciality, username, password } = req.body

    if (!username || !password || !name) {
        return res.status(400).json({ error: 'Name, username, and password are required' })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        db.query(
            `INSERT INTO doctors (name, degree, experience, speciality, username, password)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, degree || '', experience || '', speciality || '', username, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: 'Username already exists' })
                    }
                    console.log(err)
                    return res.status(500).json({ error: 'Database error' })
                }

                res.json({
                    message: 'Doctor created successfully',
                    id: result.insertId
                })
            }
        )
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Server error' })
    }
})

app.put('/admin/doctors/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params
    const { name, degree, experience, speciality, username, password } = req.body

    if (!username || !name) {
        return res.status(400).json({ error: 'Name and username are required' })
    }

    try {
        if (password && password.trim() !== '') {
            // Update with new password
            const hashedPassword = await bcrypt.hash(password, 10)
            db.query(
                `UPDATE doctors SET name = ?, degree = ?, experience = ?, speciality = ?, username = ?, password = ? WHERE id = ?`,
                [name, degree || '', experience || '', speciality || '', username, hashedPassword, id],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ error: 'Username already exists' })
                        }
                        console.log(err)
                        return res.status(500).json({ error: 'Database error' })
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Doctor not found' })
                    }

                    res.json({ message: 'Doctor updated successfully' })
                }
            )
        } else {
            // Update without changing password
            db.query(
                `UPDATE doctors SET name = ?, degree = ?, experience = ?, speciality = ?, username = ? WHERE id = ?`,
                [name, degree || '', experience || '', speciality || '', username, id],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ error: 'Username already exists' })
                        }
                        console.log(err)
                        return res.status(500).json({ error: 'Database error' })
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Doctor not found' })
                    }

                    res.json({ message: 'Doctor updated successfully' })
                }
            )
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Server error' })
    }
})

app.delete('/admin/doctors/:id', verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params

    // First delete prescriptions for visits belonging to this doctor's patients
    db.query(
        `DELETE pr FROM prescriptions pr
         JOIN visits v ON pr.visit_id = v.id
         JOIN patients p ON v.patient_id = p.id
         WHERE p.doctor_id = ?`,
        [id],
        (err) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            // Delete visits for this doctor's patients
            db.query(
                `DELETE v FROM visits v
                 JOIN patients p ON v.patient_id = p.id
                 WHERE p.doctor_id = ?`,
                [id],
                (err) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: 'Database error' })
                    }

                    // Delete patients
                    db.query(
                        'DELETE FROM patients WHERE doctor_id = ?',
                        [id],
                        (err) => {
                            if (err) {
                                console.log(err)
                                return res.status(500).json({ error: 'Database error' })
                            }

                            // Delete the doctor
                            db.query(
                                'DELETE FROM doctors WHERE id = ?',
                                [id],
                                (err, result) => {
                                    if (err) {
                                        console.log(err)
                                        return res.status(500).json({ error: 'Database error' })
                                    }

                                    if (result.affectedRows === 0) {
                                        return res.status(404).json({ error: 'Doctor not found' })
                                    }

                                    res.json({ message: 'Doctor and all associated data deleted successfully' })
                                }
                            )
                        }
                    )
                }
            )
        }
    )
})

app.get('/admin/doctors/:id/patients', verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params

    db.query(
        'SELECT * FROM patients WHERE doctor_id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }
            res.json(results)
        }
    )
})

app.get('/admin/patients/:id', verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params

    db.query(
        'SELECT * FROM patients WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Patient not found' })
            }

            res.json(results[0])
        }
    )
})

app.get('/admin/patients/:id/visits', verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params

    const query = `
        SELECT v.*, 
        COALESCE(
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('medicine', p.medicine, 'medium', p.medium, 'frequency', p.frequency)) 
             FROM prescriptions p WHERE p.visit_id = v.id),
            '[]'
        ) AS prescriptionList
        FROM visits v WHERE v.patient_id = ? ORDER BY v.visit_date DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: 'Database error' })
        }
        res.json(results)
    })
})

// ── Medicine Master Table Routes ────────────────────────────────

app.get('/medicines', verifyToken, (req, res) => {
    const q = req.query.q || ''

    if (q.trim().length === 0) {
        return res.json([])
    }

    db.query(
        'SELECT name FROM medicine_master WHERE name LIKE ? ORDER BY name LIMIT 10',
        [`%${q}%`],
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            res.json(results.map(r => r.name))
        }
    )
})

app.post('/medicines', verifyToken, (req, res) => {
    const { name } = req.body

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Medicine name is required' })
    }

    db.query(
        'INSERT IGNORE INTO medicine_master (name) VALUES (?)',
        [name.trim()],
        (err) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database error' })
            }

            res.json({ message: 'OK' })
        }
    )
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})