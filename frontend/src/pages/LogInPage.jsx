import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router';

function LogInPage() {
  const navigate = useNavigate();
    async function responseGoogle(authResult) {
        try {
            if (authResult.code) {
                const result = await axios.post(
                    `${import.meta.env.VITE_BACKEND}/api/auth/google`,
                    { code: authResult.code }
                );

                console.log(result)

                const { email, name, image } = result.data.user;

                const token = result.data.token

                const obj = {email, name, image, token}

                localStorage.setItem('user-info', JSON.stringify(obj))

                navigate("/")

                console.log('result.data.user----', {
                    email,
                    name,
                    image,
                });

                console.log('JWT:', result.data.token);
            }
        } catch (error) {
            console.error(
                'Error:',
                error.response?.data?.message || error.message
            );
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: (error) => console.error('Google login error:', error),
        flow: 'auth-code',
        scope: 'openid email profile',
    });

    return (
        <div>
            <button
                className="btn btn-primary"
                onClick={() => googleLogin()}
            >
                Login
            </button>
        </div>
    );
}

export default LogInPage;