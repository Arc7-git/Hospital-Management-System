with open("src/pages/PatientDetails.jsx", "r") as f:
    code = f.read()

old_inputs = """                    <input
                        type="date"
                        placeholder="Date"
                        value={newVisit.date}
                        onChange={(e) =>
                            setNewVisit({
                                ...newVisit,
                                date: e.target.value
                            })
                        }
                    />

                    <br /><br />

                    <input
                        type="text"
                        placeholder="Diagnosis"
                        value={newVisit.diagnosis}
                        onChange={(e) =>
                            setNewVisit({
                                ...newVisit,
                                diagnosis: e.target.value
                            })
                        }
                    />

                    <br /><br />"""

new_inputs = """                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', background: 'var(--bg-main)' }}>
                        <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '20px' }}>Visit Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>Date</label>
                                <input
                                    type="date"
                                    className="visit-input"
                                    style={{ marginBottom: 0 }}
                                    value={newVisit.date}
                                    onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>Fees</label>
                                <input
                                    type="number"
                                    className="visit-input"
                                    style={{ marginBottom: 0 }}
                                    placeholder="e.g. 500"
                                    value={newVisit.fees}
                                    onChange={(e) => setNewVisit({ ...newVisit, fees: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)' }}>Diagnosis</label>
                            <input
                                type="text"
                                className="visit-input"
                                style={{ marginBottom: 0 }}
                                placeholder="E.g. Viral Fever"
                                value={newVisit.diagnosis}
                                onChange={(e) => setNewVisit({ ...newVisit, diagnosis: e.target.value })}
                            />
                        </div>
                    </div>"""

code = code.replace(old_inputs, new_inputs)

old_fees = """                    <br /><br />

                    <input
                        type="number"
                        placeholder="Fees"
                        value={newVisit.fees}
                        onChange={(e) =>
                            setNewVisit({
                                ...newVisit,
                                fees: e.target.value
                            })
                        }
                    />

                    <br /><br />"""

# Remove old fees because they are now in the Visit Details block
code = code.replace(old_fees, "")

with open("src/pages/PatientDetails.jsx", "w") as f:
    f.write(code)

