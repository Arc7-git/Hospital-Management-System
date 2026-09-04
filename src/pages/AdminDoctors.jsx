import { useState, useEffect } from 'react'

function AdminDoctors({ token }) {
    const [doctors, setDoctors] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editingDoctorId, setEditingDoctorId] = useState(null)
    const [error, setError] = useState('')

    const emptyForm = {
        name: '',
        degree: '',
        experience: '',
        speciality: '',
        username: '',
        password: ''
    }

    const [formData, setFormData] = useState(emptyForm)

    const fetchDoctors = () => {
        fetch('http://localhost:5001/admin/doctors', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => setDoctors(data))
            .catch(error => console.error(error))
    }

    useEffect(() => {
        fetchDoctors()
    }, [token])

    const handleSave = async () => {
        setError('')

        if (!formData.name || !formData.username) {
            setError('Name and Username are required')
            return
        }

        if (!isEditing && !formData.password) {
            setError('Password is required for new doctors')
            return
        }

        const url = isEditing
            ? `http://localhost:5001/admin/doctors/${editingDoctorId}`
            : 'http://localhost:5001/admin/doctors'

        const method = isEditing ? 'PUT' : 'POST'

        const body = {
            name: formData.name,
            degree: formData.degree,
            experience: formData.experience,
            speciality: formData.speciality,
            username: formData.username
        }

        // Only include password if it's provided
        if (formData.password && formData.password.trim() !== '') {
            body.password = formData.password
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Operation failed')
                return
            }

            fetchDoctors()
            setShowForm(false)
            setIsEditing(false)
            setEditingDoctorId(null)
            setFormData(emptyForm)
            setSelectedDoctor(null)

        } catch (err) {
            setError('Unable to connect to server')
        }
    }

    const handleEdit = () => {
        if (selectedDoctor === null) {
            alert('Select a doctor first')
            return
        }

        const doctor = doctors.find(d => d.id === selectedDoctor)

        setFormData({
            name: doctor.name || '',
            degree: doctor.degree || '',
            experience: doctor.experience || '',
            speciality: doctor.speciality || '',
            username: doctor.username || '',
            password: ''
        })

        setEditingDoctorId(doctor.id)
        setIsEditing(true)
        setShowForm(true)
        setError('')
    }

    const handleDelete = async () => {
        if (selectedDoctor === null) {
            alert('Select a doctor first')
            return
        }

        const doctor = doctors.find(d => d.id === selectedDoctor)
        const confirmed = window.confirm(
            `Are you sure you want to delete ${doctor.name || doctor.username}?\n\nThis will permanently delete ALL patients, visits, and prescriptions belonging to this doctor.`
        )

        if (!confirmed) return

        try {
            const response = await fetch(
                `http://localhost:5001/admin/doctors/${selectedDoctor}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )

            if (!response.ok) {
                alert('Failed to delete doctor')
                return
            }

            fetchDoctors()
            setSelectedDoctor(null)

        } catch (err) {
            alert('Unable to connect to server')
        }
    }

    return (
        <div onClick={() => setSelectedDoctor(null)}>
            <div className="page-header">
                <h1>Doctors</h1>
                <div>
                    <button
                        className="primary-btn"
                        onClick={() => {
                            setIsEditing(false)
                            setFormData(emptyForm)
                            setError('')
                            setShowForm(!showForm)
                        }}
                    >
                        + Add Doctor
                    </button>

                    <button
                        className="primary-btn"
                        style={{ marginLeft: '10px' }}
                        onClick={handleEdit}
                    >
                        Edit Selected
                    </button>

                    <button
                        className="primary-btn"
                        style={{ marginLeft: '10px' }}
                        onClick={handleDelete}
                    >
                        Delete Selected
                    </button>
                </div>
            </div>

            {showForm && (
                <div
                    className="patient-card"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</h2>

                    {/* Step 1: Doctor Information */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', background: 'var(--bg-main)' }}>
                        <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '20px' }}>Step 1: Doctor Information</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>Name *</label>
                                <input
                                    className="visit-input"
                                    type="text"
                                    placeholder="Dr. Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>Degree</label>
                                <input
                                    className="visit-input"
                                    type="text"
                                    placeholder="e.g. MBBS, MD"
                                    value={formData.degree}
                                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>Experience</label>
                                <input
                                    className="visit-input"
                                    type="text"
                                    placeholder="e.g. 5 years"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>Speciality</label>
                                <input
                                    className="visit-input"
                                    type="text"
                                    placeholder="e.g. Cardiology"
                                    value={formData.speciality}
                                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Login Credentials */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', background: 'var(--bg-main)' }}>
                        <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '20px' }}>Step 2: Login Credentials</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>Username *</label>
                                <input
                                    className="visit-input"
                                    type="text"
                                    placeholder="Login username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                                    Password {isEditing ? '(leave blank to keep current)' : '*'}
                                </label>
                                <input
                                    className="visit-input"
                                    type="password"
                                    placeholder={isEditing ? 'Leave blank to keep current' : 'Set password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error" style={{ marginBottom: '16px' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        className="primary-btn"
                        onClick={handleSave}
                    >
                        {isEditing ? 'Update Doctor' : 'Create Doctor'}
                    </button>
                </div>
            )}

            <table className="patient-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Degree</th>
                        <th>Speciality</th>
                        <th>Experience</th>
                    </tr>
                </thead>

                <tbody>
                    {doctors.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                                No doctors registered
                            </td>
                        </tr>
                    ) : (
                        doctors.map(doctor => (
                            <tr
                                key={doctor.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedDoctor(doctor.id)
                                }}
                                style={{
                                    background:
                                        selectedDoctor === doctor.id
                                            ? '#eff6ff'
                                            : ''
                                }}
                            >
                                <td style={{ fontWeight: '600' }}>{doctor.name || '-'}</td>
                                <td>{doctor.username}</td>
                                <td>{doctor.degree || '-'}</td>
                                <td>{doctor.speciality || '-'}</td>
                                <td>{doctor.experience || '-'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default AdminDoctors
