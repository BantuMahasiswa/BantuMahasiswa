import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState('');
    const [newPost, setNewPost] = useState({ image: '', description: '' });
    const [imagePreview, setImagePreview] = useState('');

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file && file.size > 10 * 1024 * 1024) {
            setErrorMessage('Ukuran file terlalu besar. Maksimal 10MB.');
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 200;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const resizedImage = canvas.toDataURL('image/jpeg');
                    setImagePreview(resizedImage);
                    setNewPost({ ...newPost, image: resizedImage });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPost = async (e) => {
        e.preventDefault();

        if (!newPost.image || !newPost.description) {
            setErrorMessage('Gambar dan deskripsi tidak boleh kosong');
            return;
        }

        try {
            const formData = new FormData();
            const imageFile = await fetch(newPost.image)
                .then(res => res.blob());

            formData.append('image', imageFile, 'image.jpg'); // Menambahkan file gambar ke FormData
            formData.append('description', newPost.description); // Menambahkan deskripsi

            const response = await fetch('http://localhost:5000/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data', // Jangan set Content-Type untuk FormData
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Gagal menambahkan post');
            }

            // Reset form dan preview setelah berhasil menambahkan post
            const addedPost = await response.json();
            console.log('Post added:', addedPost); // Debugging
            setNewPost({ image: '', description: '' });
            setImagePreview('');
        } catch (error) {
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
                        <button>Profile</button>
                    </Link>
                </div>
            )}

            {/* Form untuk Menambahkan Post */}
            {userData && (
                <form onSubmit={handleAddPost} className="add-post-form">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
                    <input
                        type="text"
                        placeholder="Deskripsi"
                        value={newPost.description}
                        onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    />
                    <button type="submit">Post</button>
                </form>
            )}
        </div>
    );
};

export default Dashboard;
