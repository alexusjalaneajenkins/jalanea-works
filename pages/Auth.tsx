import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // For signup
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                navigate('/dashboard');
            } else {
                await signup(email, password, name);
                navigate('/onboarding');
            }
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-jalanea-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-display font-bold text-jalanea-900">
                    {isLogin ? 'Sign in to your account' : 'Start your journey'}
                </h2>
                <p className="mt-2 text-center text-sm text-jalanea-600">
                    Or{' '}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="font-medium text-jalanea-600 hover:text-jalanea-500 underline"
                    >
                        {isLogin ? 'create a new account' : 'sign in to existing account'}
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-jalanea-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-jalanea-700">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-jalanea-300 rounded-md shadow-sm placeholder-jalanea-400 focus:outline-none focus:ring-jalanea-500 focus:border-jalanea-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-jalanea-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-jalanea-300 rounded-md shadow-sm placeholder-jalanea-400 focus:outline-none focus:ring-jalanea-500 focus:border-jalanea-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-jalanea-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-jalanea-300 rounded-md shadow-sm placeholder-jalanea-400 focus:outline-none focus:ring-jalanea-500 focus:border-jalanea-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jalanea-600 hover:bg-jalanea-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jalanea-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
