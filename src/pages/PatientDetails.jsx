import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MedicineAutocomplete from '../components/MedicineAutocomplete'

function PatientDetails({ patients, setPatients, token }) {
    const { id } = useParams()

    const patient = patients.find(
        p => p.id === Number(id)

    )
    const [selectedVisit, setSelectedVisit] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingVisitId, setEditingVisitId] = useState(null)
    const [visits, setVisits] = useState([])

    const [newVisit, setNewVisit] = useState({
        date: '',
        diagnosis: '',
        prescriptionList: [{ medicine: '', medium: '', frequency: '' }],
        fees: ''
    })

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    useEffect(() => {
        fetch(`http://localhost:5001/patients/${id}/visits`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => setVisits(data))
            .catch(error => console.error(error))
    }, [id, token])

    const handleSaveVisit = async () => {

        if (isEditing) {

            console.log('Editing visit id:', editingVisitId)
            console.log('Visit payload:', {
                visit_date: newVisit.date,
                diagnosis: newVisit.diagnosis,
                prescriptionList: newVisit.prescriptionList,
                fees: Number(newVisit.fees)
            })

            const updateResponse = await fetch(
                `http://localhost:5001/visits/${editingVisitId}`,
                {
                    method: 'PUT',
                    headers: authHeaders,
                    body: JSON.stringify({
                        visit_date: newVisit.date,
                        diagnosis: newVisit.diagnosis,
                        prescriptionList: newVisit.prescriptionList,
                        fees: Number(newVisit.fees)
                    })
                }
            )

            console.log('PUT status:', updateResponse.status)

            if (!updateResponse.ok) {
                alert('Visit update failed')
                return
            }

        } else {

            await fetch(
                'http://localhost:5001/visits',
                {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        patient_id: Number(id),
                        visit_date: newVisit.date,
                        diagnosis: newVisit.diagnosis,
                        prescriptionList: newVisit.prescriptionList,
                        fees: Number(newVisit.fees)
                    })
                }
            )
        }

        const response = await fetch(
            `http://localhost:5001/patients/${id}/visits`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )

        const updatedVisits = await response.json()

        setVisits(updatedVisits)

        setNewVisit({
            date: '',
            diagnosis: '',
            prescriptionList: [{ medicine: '', medium: '', frequency: '' }],
            fees: ''
        })

        setIsEditing(false)
        setEditingVisitId(null)
        setShowAddForm(false)
    }

    const handleDeleteVisit = async () => {

        if (selectedVisit === null) return

        const confirmed = window.confirm(
            'Are you sure you want to delete this visit?'
        )

        if (!confirmed) return

        await fetch(
            `http://localhost:5001/visits/${selectedVisit}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        )

        const response = await fetch(
            `http://localhost:5001/patients/${id}/visits`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )

        const updatedVisits = await response.json()

        setVisits(updatedVisits)
        setSelectedVisit(null)
    }

    if (!patient) {
        return <h1>Patient Not Found</h1>
    }

    return (
        <div
            onClick={() => setSelectedVisit(null)}
            style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}
        >
            <div className="patient-card patient-header-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div
                        style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            fontWeight: 'bold'
                        }}
                    >
                        {patient.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                textAlign: 'left',
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#0f172a'
                            }}
                        >
                            {patient.name}
                        </h1>
                        <p
                            style={{
                                marginTop: '6px',
                                color: '#64748b',
                                fontSize: '14px'
                            }}
                        >
                            Patient ID #{patient.id}
                        </p>
                    </div>
                </div>
                <div
                    className="patient-info"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '18px',
                        marginTop: '25px',
                        textAlign: 'left'
                    }}
                >
                    <div><strong>Age</strong><br />{patient.age}</div>
                    <div><strong>Gender</strong><br />{patient.gender}</div>
                    <div><strong>Phone</strong><br />{patient.phone}</div>
                    <div>
                        <strong>Blood Group</strong><br />
                        <span className="badge">
                            {patient.blood_group}
                        </span>
                    </div>
                </div>
            </div>

            <div className="page-header">
                <h2
                    style={{
                        margin: 0,
                        fontSize: '26px',
                        fontWeight: '700',
                        color: '#0f172a'
                    }}
                >
                    Visit History
                </h2>

                <div>
                    <button
                        className="primary-btn"
                        style={{ marginRight: '10px' }}
                        onClick={() => {

                            setIsEditing(false)

                            setNewVisit({
                                date: '',
                                diagnosis: '',
                                prescriptionList: [{ medicine: '', medium: '', frequency: '' }],
                                fees: ''
                            })

                            setShowAddForm(!showAddForm)
                        }}
                    >
                        + Add Visit
                    </button>

                    <button
                        className="primary-btn"
                        disabled={selectedVisit === null}
                        onClick={(e) => {
                            e.stopPropagation()

                            const visitToEdit = visits.find(
                                v => v.id === selectedVisit
                            )

                            let parsedList = [{ medicine: '', medium: '', frequency: '' }]
                            if (visitToEdit.prescriptionList) {
                                if (typeof visitToEdit.prescriptionList === 'string') {
                                    try {
                                        parsedList = JSON.parse(visitToEdit.prescriptionList)
                                    } catch(e) {}
                                } else if (Array.isArray(visitToEdit.prescriptionList)) {
                                    parsedList = visitToEdit.prescriptionList;
                                }
                            }

                            setNewVisit({
                                date: visitToEdit.visit_date
                                    ? String(visitToEdit.visit_date).split('T')[0]
                                    : '',
                                diagnosis: visitToEdit.diagnosis,
                                prescriptionList: parsedList,
                                fees: visitToEdit.fees
                            })

                            setEditingVisitId(visitToEdit.id)
                            setIsEditing(true)
                            setShowAddForm(true)
                        }}
                    >
                        Edit Selected Visit
                    </button>

                    <button
                        className="primary-btn"
                        disabled={selectedVisit === null}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteVisit()
                        }}
                        style={{ marginLeft: '10px' }}
                    >
                        Delete Selected Visit
                    </button>
                </div>
            </div>
            {showAddForm && (
                <div
                    className="patient-card"
                    onClick={(e) => e.stopPropagation()}
                >

                    <h2 style={{ marginBottom: '25px' }}>
                        {isEditing ? 'Edit Visit' : 'Add New Visit'}
                    </h2>

                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', background: 'var(--bg-main)' }}>
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
                    </div>

                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', background: 'var(--bg-main)' }}>
                        <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '20px' }}>Prescription</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Medicine</div>
                            <div style={{ textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Medium</div>
                            <div style={{ textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Frequency</div>
                        </div>

                        {newVisit.prescriptionList.map((med, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <MedicineAutocomplete
                                    placeholder="M1"
                                    value={med.medicine}
                                    token={token}
                                    onChange={(val) => {
                                        const newList = [...newVisit.prescriptionList];
                                        newList[index].medicine = val;
                                        setNewVisit({ ...newVisit, prescriptionList: newList });
                                    }}
                                />
                                <input
                                    type="text"
                                    className="visit-input"
                                    style={{ marginBottom: 0 }}
                                    placeholder="Oral"
                                    value={med.medium}
                                    onChange={(e) => {
                                        const newList = [...newVisit.prescriptionList];
                                        newList[index].medium = e.target.value;
                                        setNewVisit({ ...newVisit, prescriptionList: newList });
                                    }}
                                />
                                <input
                                    type="text"
                                    className="visit-input"
                                    style={{ marginBottom: 0 }}
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
                    </div>



                    <button
                        className="primary-btn"
                        onClick={handleSaveVisit}
                    >
                        Save Visit
                    </button>

                </div>
            )}

            {visits.map(visit => (
                <div
                    className={`visit-card ${selectedVisit === visit.id ? 'selected' : ''
                        }`}
                    key={visit.id}
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVisit(visit.id)
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}
                    >
                        <strong
                            style={{
                                fontSize: '15px',
                                color: '#0f172a'
                            }}
                        >
                            {String(visit.visit_date).split('T')[0]}
                        </strong>
                        <span className="badge">
                            ₹{visit.fees}
                        </span>
                    </div>
                    <p style={{ marginBottom: '8px' }}>
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                    </p>
                    <div style={{ marginBottom: 0, color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Prescription:</strong> 
                        {(() => {
                            let list = visit.prescriptionList || visit.prescription;
                            if (typeof list === 'string') {
                                try { list = JSON.parse(list); } catch(e) {}
                            }
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
                            return <span> {visit.prescription}</span>;
                        })()}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default PatientDetails