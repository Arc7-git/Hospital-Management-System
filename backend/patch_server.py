import re

with open("server.js", "r") as f:
    code = f.read()

# Replace GET /patients/:id/visits
old_get = """    db.query(
        'SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC',
        [id],"""

new_get = """    const query = `
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
        [id],"""

code = code.replace(old_get, new_get)


# Replace POST /visits
old_post = """app.post('/visits', (req, res) => {

    const {
        patient_id,
        visit_date,
        diagnosis,
        prescription,
        fees
    } = req.body

    const query = `
        INSERT INTO visits
        (patient_id, visit_date, diagnosis, prescription, fees)
        VALUES (?, ?, ?, ?, ?)
    `

    db.query(
        query,
        [patient_id, visit_date, diagnosis, prescription, fees],
        (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    error: 'Database error'
                })
            }

            res.json({
                message: 'Visit added successfully',
                id: result.insertId
            })
        }
    )
})"""

new_post = """app.post('/visits', (req, res) => {
    const { patient_id, visit_date, diagnosis, prescriptionList, fees } = req.body;
    
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
})"""

code = code.replace(old_post, new_post)


# Replace PUT /visits/:id
old_put = """app.put('/visits/:id', (req, res) => {

    const { id } = req.params
    const {
        visit_date,
        diagnosis,
        prescription,
        fees
    } = req.body

    const query = `
        UPDATE visits
        SET
            visit_date = ?,
            diagnosis = ?,
            prescription = ?,
            fees = ?
        WHERE id = ?
    `

    db.query(
        query,
        [visit_date, diagnosis, prescription, fees, id],
        (err) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    error: 'Database error'
                })
            }

            res.json({
                message: 'Visit updated successfully'
            })
        }
    )
})"""

new_put = """app.put('/visits/:id', (req, res) => {
    const { id } = req.params;
    const { visit_date, diagnosis, prescriptionList, fees } = req.body;

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
})"""

code = code.replace(old_put, new_put)

with open("server.js", "w") as f:
    f.write(code)

