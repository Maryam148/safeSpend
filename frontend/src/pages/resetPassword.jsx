import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Check if this is a valid password recovery session
        const checkRecoverySession = async () => {
            // Check URL hash for recovery token (Supabase adds it to the URL hash)
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const type = hashParams.get('type');
            
            // Also check query params (some Supabase setups use query params)
            const queryParams = new URLSearchParams(window.location.search);
            const queryType = queryParams.get('type');
            const queryToken = queryParams.get('access_token');
            
            const recoveryType = type || queryType;
            const token = accessToken || queryToken;
            
            // Listen for PASSWORD_RECOVERY event
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setIsValidSession(true);
                    setCheckingSession(false);
                } else if (event === 'SIGNED_IN' && (recoveryType === 'recovery' || token)) {
                    // If signed in with recovery token in URL, it's a recovery session
                    setIsValidSession(true);
                    setCheckingSession(false);
                }
            });

            // Check current session
            const { data: { session } } = await supabase.auth.getSession();
            
            // If we have recovery type in URL or recovery token, allow password reset
            if (recoveryType === 'recovery' || token) {
                setIsValidSession(true);
                setCheckingSession(false);
            } else if (session) {
                // If there's a session, check if it's from a recovery (might have been processed already)
                // Allow password reset if session exists (user clicked recovery link)
                setIsValidSession(true);
                setCheckingSession(false);
            } else {
                // No session and no recovery token - invalid
                setIsValidSession(false);
                setCheckingSession(false);
            }

            return () => subscription.unsubscribe();
        };

        checkRecoverySession();
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Update the user's password
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage('Password updated successfully! Redirecting to login...');
            
            // Sign out the user so they can log in with new password
            await supabase.auth.signOut();
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking session
    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // If no valid session, show error
    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
                            Invalid or Expired Link
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            This password reset link is invalid or has expired.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-800 hover:text-gray-600 underline"
                    >
                        Go back to login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
                        Set New Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your new password below
                    </p>
                </div>
                <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">
                            New Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="relative block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <label htmlFor="confirmPassword" className="sr-only">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            className="relative block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>

                    {message && (
                        <div className={`text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;

