import { useEffect, useState } from 'react'

function AdminDashboard({ token }) {

    const [stats, setStats] = useState({
        totalPatients: 0,
        totalVisits: 0,
        totalRevenue: 0,
        todayVisits: 0
    })

    useEffect(() => {
        fetch('http://localhost:5001/admin/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(data => setStats(data))
            .catch(error => console.error(error))
    }, [token])

    return (
        <div>
            <h1>Admin Dashboard</h1>

            <div className="dashboard-grid">
                <div className="patient-card">
                    <h2>Total Patients</h2>
                    <h1>{stats.totalPatients}</h1>
                </div>

                <div className="patient-card">
                    <h2>Total Visits</h2>
                    <h1>{stats.totalVisits}</h1>
                </div>

                <div className="patient-card">
                    <h2>Today's Visits</h2>
                    <h1>{stats.todayVisits}</h1>
                </div>

                <div className="patient-card">
                    <h2>Revenue</h2>
                    <h1>₹{stats.totalRevenue}</h1>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
