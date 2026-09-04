import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function AdminPatients({ token }) {
    const [doctors, setDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch all doctors
    useEffect(() => {
        fetch('http://localhost:5001/admin/doctors', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => {
                setDoctors(data)
                // Auto-select first doctor
                if (data.length > 0) {
                    setSelectedDoctor(data[0].id)
                }
            })
            .catch(error => console.error(error))
    }, [token])

    // Fetch patients when doctor selection changes
    useEffect(() => {
        if (selectedDoctor === null) return

        setLoading(true)
        fetch(`http://localhost:5001/admin/doctors/${selectedDoctor}/patients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => {
                setPatients(data)
                setLoading(false)
            })
            .catch(error => {
                console.error(error)
                setLoading(false)
            })
    }, [selectedDoctor, token])

    return (
        <div>
            <div className="page-header">
                <h1>All Patients</h1>
            </div>

            {/* Doctor filter buttons */}
            <div className="doctor-filter-bar">
                {doctors.map(doctor => (
                    <button
                        key={doctor.id}
                        className={`doctor-filter-btn ${selectedDoctor === doctor.id ? 'active' : ''}`}
                        onClick={() => setSelectedDoctor(doctor.id)}
                    >
                        <span className="doctor-filter-avatar">
                            {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                        </span>
                        <span className="doctor-filter-name">
                            {doctor.name || doctor.username}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading patients...
                </div>
            ) : (
                <table className="patient-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Blood Group</th>
                            <th>Phone</th>
                        </tr>
                    </thead>

                    <tbody>
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                                    No patients found for this doctor
                                </td>
                            </tr>
                        ) : (
                            patients.map(patient => (
                                <tr key={patient.id}>
                                    <td>
                                        <Link to={`/patient/${patient.id}`}>
                                            {patient.name}
                                        </Link>
                                    </td>
                                    <td>{patient.age}</td>
                                    <td>{patient.gender}</td>
                                    <td>{patient.blood_group ? <span className="badge">{patient.blood_group}</span> : '-'}</td>
                                    <td>{patient.phone}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default AdminPatients
