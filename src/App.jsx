import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Sidebar from './components/Sidebar'
import AdminSidebar from './components/AdminSidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetails from './pages/PatientDetails'
import AdminDashboard from './pages/AdminDashboard'
import AdminPatients from './pages/AdminPatients'
import AdminPatientDetails from './pages/AdminPatientDetails'
import AdminDoctors from './pages/AdminDoctors'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [patients, setPatients] = useState([])
  const [authChecked, setAuthChecked] = useState(false)

  // Verify token on mount
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5001/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          if (!response.ok) {
            handleLogout()
            return null
          }
          return response.json()
        })
        .then(data => {
          if (data) {
            setUser(data)
            setRole(data.role)
            localStorage.setItem('user', JSON.stringify(data))
            localStorage.setItem('role', data.role)
          }
          setAuthChecked(true)
        })
        .catch(() => {
          handleLogout()
          setAuthChecked(true)
        })
    } else {
      setAuthChecked(true)
    }
  }, [])

  // Fetch patients when authenticated as doctor
  useEffect(() => {
    if (token && role === 'doctor') {
      fetch('http://localhost:5001/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => response.json())
        .then(data => setPatients(data))
        .catch(error => console.error(error))
    }
  }, [token, role])

  const handleLogin = (newToken, userData, userRole) => {
    setToken(newToken)
    setUser(userData)
    setRole(userRole)
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setRole(null)
    setPatients([])
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  // Show nothing while checking auth
  if (!authChecked) {
    return null
  }

  // Not logged in — show login page
  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  // Admin layout
  if (role === 'admin') {
    return (
      <BrowserRouter>
        <div className="app">
          <AdminSidebar user={user} onLogout={handleLogout} />

          <div className="main-content">
            <div className="topbar">
              <h1>🏥 CityCare Hospital Management System</h1>
            </div>
            <Routes>
              <Route
                path="/"
                element={<AdminDashboard token={token} />}
              />
              <Route
                path="/patients"
                element={<AdminPatients token={token} />}
              />
              <Route
                path="/patient/:id"
                element={<AdminPatientDetails token={token} />}
              />
              <Route
                path="/doctors"
                element={<AdminDoctors token={token} />}
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    )
  }

  // Doctor layout (unchanged)
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar doctor={user} onLogout={handleLogout} />

        <div className="main-content">
          <div className="topbar">
            <h1>🏥 CityCare Hospital Management System</h1>
          </div>
          <Routes>
            <Route
              path="/"
              element={<Dashboard token={token} />}
            />

            <Route
              path="/patients"
              element={
                <Patients
                  patients={patients}
                  setPatients={setPatients}
                  token={token}
                />
              }
            />

            <Route
              path="/patient/:id"
              element={
                <PatientDetails
                  patients={patients}
                  setPatients={setPatients}
                  token={token}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App