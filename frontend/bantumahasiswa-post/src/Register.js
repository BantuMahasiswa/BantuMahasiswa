// src/components/Register.js
import React, { useState } from 'react';

const Register = ({ switchMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('User registered successfully', data);
                switchMode();
            } else {
                console.error('Registration error:', data); // Log error response from server
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('An error occurred:', error); // Log error
            setErrorMessage('An error occurred');
        }
    };

    return (
        <div className="form-container">
            <h2>Daftar</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Konfirmasi Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Daftar</button>
                {errorMessage && <p className="error">{errorMessage}</p>}
            </form>
            <p>
                Sudah punya akun?{' '}
                <span onClick={switchMode} className="switch-link">
                    Login di sini
                </span>
            </p>
        </div>
    );
};

export default Register;
