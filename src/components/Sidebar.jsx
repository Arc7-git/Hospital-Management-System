import { Link } from 'react-router-dom'

function Sidebar({ doctor, onLogout }) {
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
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-doctor">
                    <div className="sidebar-doctor-avatar">
                        {doctor?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <div className="sidebar-doctor-info">
                        <span className="sidebar-doctor-name">{doctor?.name || 'Doctor'}</span>
                        <span className="sidebar-doctor-id">@{doctor?.username || ''}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar