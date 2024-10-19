import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ switchMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful', data);
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.log(error);
            setErrorMessage('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
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
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Login'}
                </button>
                   { errorMessage && <p className="error">{errorMessage}</p>}     
                </form>
            <p>
                Belum punya akun?{' '}
                <span onClick={switchMode} className="switch-link">
                    Daftar di sini
                </span>
            </p>
        </div>
    );
};

export default Login;
