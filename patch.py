import json

with open("src/pages/PatientDetails.jsx", "r") as f:
    code = f.read()

# 1
code = code.replace("""    const [newVisit, setNewVisit] = useState({
        date: '',
        diagnosis: '',
        prescription: '',
        fees: ''
    })""", """    const [newVisit, setNewVisit] = useState({
        date: '',
        diagnosis: '',
        prescriptionList: [{ medicine: '', medium: '', frequency: '' }],
        fees: ''
    })""")

# 2
code = code.replace("""            console.log('Visit payload:', {
                visit_date: newVisit.date,
                diagnosis: newVisit.diagnosis,
                prescription: newVisit.prescription,
                fees: Number(newVisit.fees)
            })""", """            console.log('Visit payload:', {
                visit_date: newVisit.date,
                diagnosis: newVisit.diagnosis,
                prescription: JSON.stringify(newVisit.prescriptionList),
                fees: Number(newVisit.fees)
            })""")

# 3
code = code.replace("""                    body: JSON.stringify({
                        visit_date: newVisit.date,
                        diagnosis: newVisit.diagnosis,
                        prescription: newVisit.prescription,
                        fees: Number(newVisit.fees)
                    })""", """                    body: JSON.stringify({
                        visit_date: newVisit.date,
                        diagnosis: newVisit.diagnosis,
                        prescription: JSON.stringify(newVisit.prescriptionList),
                        fees: Number(newVisit.fees)
                    })""")

# 4
code = code.replace("""                    body: JSON.stringify({
                        patient_id: Number(id),
                        visit_date: newVisit.date,
                        diagnosis: newVisit.diagnosis,
                        prescription: newVisit.prescription,
                        fees: Number(newVisit.fees)
                    })""", """                    body: JSON.stringify({
                        patient_id: Number(id),
                        visit_date: newVisit.date,
                        diagnosis: newVisit.diagnosis,
                        prescription: JSON.stringify(newVisit.prescriptionList),
                        fees: Number(newVisit.fees)
                    })""")

# 5
code = code.replace("""        setNewVisit({
            date: '',
            diagnosis: '',
            prescription: '',
            fees: ''
        })""", """        setNewVisit({
            date: '',
            diagnosis: '',
            prescriptionList: [{ medicine: '', medium: '', frequency: '' }],
            fees: ''
        })""")

# 6
code = code.replace("""                            setNewVisit({
                                date: '',
                                diagnosis: '',
                                prescription: '',
                                fees: ''
                            })""", """                            setNewVisit({
                                date: '',
                                diagnosis: '',
                                prescriptionList: [{ medicine: '', medium: '', frequency: '' }],
                                fees: ''
                            })""")

# 7
code = code.replace("""                            setNewVisit({
                                date: visitToEdit.visit_date
                                    ? String(visitToEdit.visit_date).split('T')[0]
                                    : '',
                                diagnosis: visitToEdit.diagnosis,
                                prescription: visitToEdit.prescription,
                                fees: visitToEdit.fees
                            })""", """                            let parsedList = [{ medicine: '', medium: '', frequency: '' }]
                            try {
                                if (visitToEdit.prescription) {
                                    const parsed = JSON.parse(visitToEdit.prescription)
                                    if (Array.isArray(parsed)) parsedList = parsed
                                    else parsedList = [{ medicine: visitToEdit.prescription, medium: '', frequency: '' }]
                                }
                            } catch (e) {
                                parsedList = [{ medicine: visitToEdit.prescription, medium: '', frequency: '' }]
                            }

                            setNewVisit({
                                date: visitToEdit.visit_date
                                    ? String(visitToEdit.visit_date).split('T')[0]
                                    : '',
                                diagnosis: visitToEdit.diagnosis,
                                prescriptionList: parsedList,
                                fees: visitToEdit.fees
                            })""")

# 8
code = code.replace("""                    <input
                        type="text"
                        placeholder="Prescription"
                        value={newVisit.prescription}
                        onChange={(e) =>
                            setNewVisit({
                                ...newVisit,
                                prescription: e.target.value
                            })
                        }
                    />""", """                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', background: 'var(--bg-main)' }}>
                        <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '20px' }}>Prescription</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Medicine</div>
                            <div style={{ textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Medium</div>
                            <div style={{ textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Frequency</div>
                        </div>

                        {newVisit.prescriptionList.map((med, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <textarea
                                    className="visit-input"
                                    style={{ height: '120px', resize: 'none', marginBottom: 0 }}
                                    placeholder="M1"
                                    value={med.medicine}
                                    onChange={(e) => {
                                        const newList = [...newVisit.prescriptionList];
                                        newList[index].medicine = e.target.value;
                                        setNewVisit({ ...newVisit, prescriptionList: newList });
                                    }}
                                />
                                <textarea
                                    className="visit-input"
                                    style={{ height: '120px', resize: 'none', marginBottom: 0 }}
                                    placeholder="Oral"
                                    value={med.medium}
                                    onChange={(e) => {
                                        const newList = [...newVisit.prescriptionList];
                                        newList[index].medium = e.target.value;
                                        setNewVisit({ ...newVisit, prescriptionList: newList });
                                    }}
                                />
                                <textarea
                                    className="visit-input"
                                    style={{ height: '120px', resize: 'none', marginBottom: 0 }}
                                    placeholder="1x day"
                                    value={med.frequency}
                                    onChange={(e) => {
                                        const newList = [...newVisit.prescriptionList];
                                        newList[index].frequency = e.target.value;
                                        setNewVisit({ ...newVisit, prescriptionList: newList });
                                    }}
                                />
                            </div>
                        ))}
                        
                        <button
                            className="primary-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                setNewVisit({
                                    ...newVisit,
                                    prescriptionList: [...newVisit.prescriptionList, { medicine: '', medium: '', frequency: '' }]
                                })
                            }}
                            style={{ padding: '8px 16px', fontSize: '14px', marginTop: '8px' }}
                        >
                            + Add Med
                        </button>
                    </div>""")

# 9
code = code.replace("""                    <p style={{ marginBottom: 0 }}>
                        <strong>Prescription:</strong> {visit.prescription}
                    </p>""", """                    <div style={{ marginBottom: 0, color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Prescription:</strong> 
                        {(() => {
                            try {
                                const list = JSON.parse(visit.prescription);
                                if (Array.isArray(list)) {
                                    return (
                                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                            {list.map((med, i) => (
                                                <li key={i}>
                                                    <strong style={{ color: 'var(--text-main)' }}>{med.medicine}</strong> 
                                                    {med.medium || med.frequency ? ` - ${[med.medium, med.frequency].filter(Boolean).join(', ')}` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }
                            } catch (e) {
                                // Ignore error
                            }
                            return <span> {visit.prescription}</span>;
                        })()}
                    </div>""")

with open("src/pages/PatientDetails.jsx", "w") as f:
    f.write(code)

