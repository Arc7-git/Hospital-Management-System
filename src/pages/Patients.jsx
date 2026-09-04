import { Link } from 'react-router-dom'
import { useState } from 'react'

function Patients({ patients, setPatients, token }) {
const [showForm, setShowForm] = useState(false)
const [selectedPatient, setSelectedPatient] = useState(null)
const [isEditing, setIsEditing] = useState(false)
const [editingPatientId, setEditingPatientId] = useState(null)

const [newPatient, setNewPatient] = useState({
  name: '',
  age: '',
  gender: '',
  phone: '',
  blood_group: ''
})

const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}

const handleAddPatient = async () => {

  if (
    !newPatient.name ||
    !newPatient.age ||
    !newPatient.gender ||
    !newPatient.phone
  ) {
    alert('Please fill all fields')
    return
  }

  const response = await fetch(
    'http://localhost:5001/patients',
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: newPatient.name,
        age: Number(newPatient.age),
        gender: newPatient.gender,
        phone: newPatient.phone,
        blood_group: newPatient.blood_group
      })
    }
  )

  if (!response.ok) {
    alert('Failed to add patient')
    return
  }

  const patientsResponse = await fetch(
    'http://localhost:5001/patients',
    { headers: { 'Authorization': `Bearer ${token}` } }
  )

  const updatedPatients = await patientsResponse.json()

  setPatients(updatedPatients)

  setNewPatient({
    name: '',
    age: '',
    gender: '',
    phone: '',
    blood_group: ''
  })

  setShowForm(false)
}

const handleEditPatient = () => {

  if (selectedPatient === null) {
    alert('Select a patient first')
    return
  }

  const patient = patients.find(
    p => p.id === selectedPatient
  )

  setNewPatient({
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    blood_group: patient.blood_group || ''
  })

  setEditingPatientId(patient.id)
  setIsEditing(true)
  setShowForm(true)
}

const handleSavePatient = async () => {

  if (
    !newPatient.name ||
    !newPatient.age ||
    !newPatient.gender ||
    !newPatient.phone
  ) {
    alert('Please fill all fields')
    return
  }

  if (isEditing) {

    const response = await fetch(
      `http://localhost:5001/patients/${editingPatientId}`,
      {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: newPatient.name,
          age: Number(newPatient.age),
          gender: newPatient.gender,
          phone: newPatient.phone,
          blood_group: newPatient.blood_group
        })
      }
    )

    if (!response.ok) {
      alert('Failed to update patient')
      return
    }

    const patientsResponse = await fetch(
      'http://localhost:5001/patients',
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    const updatedPatients = await patientsResponse.json()

    setPatients(updatedPatients)

  } else {

    handleAddPatient()
    return
  }

  setShowForm(false)
  setIsEditing(false)
  setEditingPatientId(null)
}

const handleDeletePatient = async () => {

  if (selectedPatient === null) {
    alert('Select a patient first')
    return
  }

  const confirmed = window.confirm(
    'Delete selected patient?'
  )

  if (!confirmed) return

  const response = await fetch(
    `http://localhost:5001/patients/${selectedPatient}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  )

  if (!response.ok) {
    alert('Failed to delete patient')
    return
  }

  const patientsResponse = await fetch(
    'http://localhost:5001/patients',
    { headers: { 'Authorization': `Bearer ${token}` } }
  )

  const updatedPatients = await patientsResponse.json()

  setPatients(updatedPatients)
  setSelectedPatient(null)
}

    return (
  <div onClick={() => setSelectedPatient(null)}>
    <div className="page-header">
      <h1>Patients</h1>
      <div>
        <button
          className="primary-btn"
          onClick={() => {
            setIsEditing(false)
            setShowForm(!showForm)
          }}
        >
          + Add Patient
        </button>

        <button
          className="primary-btn"
          style={{ marginLeft: '10px' }}
          onClick={handleEditPatient}
        >
          Edit Selected Patient
        </button>

        <button
          className="primary-btn"
          style={{ marginLeft: '10px' }}
          onClick={handleDeletePatient}
        >
          Delete Selected Patient
        </button>
      </div>
    </div>

    {showForm && (
      <div
        className="patient-card"
        onClick={(e) => e.stopPropagation()}
      >

        <h2>
          {isEditing ? 'Edit Patient' : 'Add Patient'}
        </h2>

        <input
          className="visit-input"
          type="text"
          placeholder="Patient Name"
          value={newPatient.name}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              name: e.target.value
            })
          }
        />

        <br /><br />

        <input
          className="visit-input"
          type="number"
          placeholder="Age"
          value={newPatient.age}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              age: e.target.value
            })
          }
        />

        <br /><br />

        <select
          className="visit-input"
          value={newPatient.gender}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              gender: e.target.value
            })
          }
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <br /><br />

        <input
          className="visit-input"
          type="text"
          placeholder="Phone Number"
          value={newPatient.phone}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              phone: e.target.value
            })
          }
        />

        <br /><br />

        <select
          className="visit-input"
          value={newPatient.blood_group}
          onChange={(e) =>
            setNewPatient({
              ...newPatient,
              blood_group: e.target.value
            })
          }
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <br /><br />

        <button
          className="primary-btn"
          onClick={handleSavePatient}
        >
          Save Patient
        </button>

      </div>
    )}

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
        {patients.map(patient => (
          <tr
            key={patient.id}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPatient(patient.id)
            }}
            style={{
              background:
                selectedPatient === patient.id
                  ? '#eff6ff'
                  : ''
            }}
          >
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
        ))}
      </tbody>
    </table>
  </div>
)
}

export default Patients