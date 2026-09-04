import { Link } from 'react-router-dom'

function AdminSidebar({ user, onLogout }) {
    return (
        <div className="sidebar">
            <h2>🏥 CityCare</h2>

            <nav>
                <ul>
                    <li>
                        <Link to="/">Dashboard</Link>
                    </li>

                    <li>
                        <Link to="/patients">Patients</Link>
                    </li>

                    <li>
                        <Link to="/doctors">Doctors</Link>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-doctor">
                    <div className="sidebar-doctor-avatar" style={{ background: 'rgba(225, 29, 72, 0.3)' }}>
                        A
                    </div>
                    <div className="sidebar-doctor-info">
                        <span className="sidebar-doctor-name">{user?.name || 'Administrator'}</span>
                        <span className="sidebar-doctor-id">Admin</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default AdminSidebar
