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

    const { login, signup, loginWithGoogle } = useAuth();
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

            <div className="mt-6">
                <button
                    onClick={async () => {
                        try {
                            setLoading(true);
                            await loginWithGoogle();
                            navigate('/dashboard');
                        } catch (err: any) {
                            setError(err.message.replace('Firebase: ', ''));
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-jalanea-300 rounded-md shadow-sm text-sm font-medium text-jalanea-700 bg-white hover:bg-jalanea-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jalanea-500"
                >
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path
                            d="M12.0003 20.45c4.6667 0 7.4286-3.2143 7.4286-7.5536 0-.5893-.0625-1.0446-.1518-1.4285H12.0003v3.0803h4.2232c-.1964 1.259-.9732 2.75-2.616 3.8483l-.0226.1472 2.4542 1.8847.1691.0169c2.4553-2.25 3.875-5.5536 3.875-9.375 0-6.625-5.375-12-12-12-3.3214 0-6.3125 1.2232-8.5268 3.2321l1.866 2.0536C6.7235 2.6875 8.786 1.5 11.2503 1.5c4.7857 0 7.8214 3.7321 7.8214 3.7321s-3.0357 5.7679-7.8214 5.7679c-2.3125 0-4.3393-1.125-5.7143-2.8393l-1.9553 1.5268C5.2324 12.3929 8.3574 15 12.0003 15z"
                            fill="currentColor"
                            fillOpacity="0" // Only using path structure, relying on multi-color normally but here mono or simple
                        />
                        <path d="M12 5.25C13.626 5.25 14.9725 5.8 16.0125 6.775L18.425 4.3625C16.7125 2.8 14.5125 1.75 12 1.75C8.0875 1.75 4.675 4 2.8625 7.4375L5.7 9.6125C6.6 7.1125 8.9875 5.25 12 5.25Z" fill="#EA4335" />
                        <path d="M12 19.5C8.9875 19.5 6.6 17.6375 5.7 15.1375L2.8625 17.3125C4.675 20.75 8.0875 23 12 23C14.5125 23 16.7125 22.0625 18.25 20.65L15.65 18.25C14.725 18.9875 13.525 19.5 12 19.5Z" fill="#34A853" />
                        <path d="M5.7 15.1375C5.4625 14.425 5.3375 13.675 5.3375 12.9125C5.3375 12.15 5.4625 11.4 5.7 10.6875L2.8625 8.5125C2.2625 9.875 1.9125 11.375 1.9125 12.9125C1.9125 14.45 2.2625 15.95 2.8625 17.3125L5.7 15.1375Z" fill="#FBBC05" />
                        <path d="M22.0875 12.9125C22.0875 12.3875 22.0125 11.975 21.875 11.5375H12V15.7125H18.05C17.75 17.225 16.5875 19.0625 15.65 19.7875L18.25 21.7875C19.75 20.4 22.0875 18.15 22.0875 12.9125Z" fill="#4285F4" />
                    </svg>
                    Sign in with Google
                </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <span className="border-b w-1/5 lg:w-1/4"></span>
                <span className="text-xs text-center text-gray-500 uppercase">or email</span>
                <span className="border-b w-1/5 lg:w-1/4"></span>
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
