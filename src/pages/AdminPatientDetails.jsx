import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function AdminPatientDetails({ token }) {
    const { id } = useParams()
    const [patient, setPatient] = useState(null)
    const [visits, setVisits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch patient info
        fetch(`http://localhost:5001/admin/patients/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => {
                setPatient(data)
                setLoading(false)
            })
            .catch(error => {
                console.error(error)
                setLoading(false)
            })

        // Fetch visits
        fetch(`http://localhost:5001/admin/patients/${id}/visits`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => setVisits(data))
            .catch(error => console.error(error))
    }, [id, token])

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
    }

    if (!patient) {
        return <h1>Patient Not Found</h1>
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
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
                {/* Read-only: no action buttons */}
            </div>

            {visits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No visits recorded for this patient
                </div>
            ) : (
                visits.map(visit => (
                    <div
                        className="visit-card"
                        key={visit.id}
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
                                    try { list = JSON.parse(list); } catch (e) { }
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
                ))
            )}
        </div>
    )
}

export default AdminPatientDetails
