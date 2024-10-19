import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);  

    const switchMode = () => {
        setIsLogin(!isLogin); 
    };

    return (
        <div className="auth-container">
            {isLogin ? (
                <Login switchMode={switchMode} />
            ) : (
                <Register switchMode={switchMode} />
            )}
        </div>
    );
};

export default AuthPage;
