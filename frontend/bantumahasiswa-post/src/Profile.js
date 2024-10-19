// Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link dari react-router-dom

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setErrorMessage('Token tidak ditemukan. Silakan login kembali.');
                return;
            }
            setToken(storedToken);

            try {
                const response = await fetch('http://localhost:5000/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                setErrorMessage(error.message);
            }
        };

        fetchUserData();
    }, [token]);

    return (
        <div>
            <h1>Profile</h1>
            {errorMessage && <p className="error">{errorMessage}</p>}
            {userData ? (
                <div className="profile">
                    {userData.profilePicture && (
                        <img
                            src={userData.profilePicture}
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                        />
                    )}
                    <p><strong>Name:</strong> {userData.name || 'Name not provided'}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}

            {/* Tambahkan tombol back ke dashboard */}
            <div className="back-to-dashboard">
                <Link to="/dashboard">
                    <button>Back to Dashboard</button>
                </Link>
            </div>
        </div>
    );
};

export default Profile;
