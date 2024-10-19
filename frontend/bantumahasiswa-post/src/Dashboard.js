import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './import/import.jsx';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState('');
    const [newPost, setNewPost] = useState({ description: '' });
    const [posts, setPosts] = useState([]); // Untuk menyimpan daftar post

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
                    throw new Error('Gagal mengambil data pengguna.');
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                setErrorMessage(error.message);
            }
        };

        fetchUserData();
    }, []);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        console.log('Posting data:', newPost); // Log data postingan yang akan dikirim
        try {
            const response = await fetch('http://localhost:5000/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
            });

            if (!response.ok) {
                throw new Error('Gagal mengirim komentar.');
            }

            // Update daftar post setelah berhasil
            setPosts([...posts, { description: newPost.description, userId: userData._id }]);
            setNewPost({ description: '' });
        } catch (error) {
            console.error(error); // Tambahkan console log untuk error
            setErrorMessage(error.message);
        }
    };
    

    return (
        <div className="dashboard-container">
            {errorMessage && <p className="error">{errorMessage}</p>}

            {/* Profile Button */}
            {userData && (
                <div className="profile-button">
                    <Link to="/profile">
                        <button className="btn-profile">Profile</button>
                    </Link>
                    <p>{userData.email}</p>
                    <p>ID: {userData.id}</p>
                </div>
            )}

            {/* Form untuk membuat post */}
            {userData && (
                <form onSubmit={handlePostSubmit} className="post-form">
                    <textarea
                        placeholder="Apa yang Anda pikirkan?"
                        value={newPost.description}
                        onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                        className="input-description"
                    />
                    <button type="submit" className="btn-submit">Post</button>
                </form>
            )}

            {/* Tampilkan daftar post */}
            <div className="posts-container">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={index} className="post">
                            <p>{post.description}</p>
                        </div>
                    ))
                ) : (
                    <p>Tidak ada post yang tersedia.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
