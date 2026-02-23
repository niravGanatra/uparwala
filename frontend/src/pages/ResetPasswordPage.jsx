import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        new_password: '', // Matches dj-rest-auth requirement
        new_password_check: '' // Note: actual dj-rest-auth field varies, often we just map it.
    });

    // Check if form supports new_password1 and new_password2 (common for dj-rest-auth)
    // Actually dj_rest_auth expects 'new_password1' and 'new_password2' sometimes, or just a single payload depending on settings.
    // Standard dj_rest_auth reset confirm takes: uid, token, new_password1, new_password2

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.new_password !== passwords.new_password_check) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwords.new_password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/password/reset/confirm/', {
                uid: uid,
                token: token,
                new_password1: passwords.new_password, // dj-rest-auth default
                new_password2: passwords.new_password_check, // dj-rest-auth default
            });

            setSuccess(true);
            toast.success('Password successfully reset!');

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error('Password reset failed:', error);
            // Handle validation errors from backend
            if (error.response?.data?.new_password1) {
                toast.error(error.response.data.new_password1[0]);
            } else if (error.response?.data?.non_field_errors) {
                toast.error(error.response.data.non_field_errors[0]);
            } else {
                toast.error('Failed to reset password. The link might be expired.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful</h2>
                    <p className="text-slate-600 mb-6">Your password has been successfully updated. You will be redirected to the login page momentarily.</p>
                    <Link to="/login">
                        <Button className="w-full">Go to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-orange-600 mb-2">Uparwala</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h2>
                    <p className="text-base text-slate-600">Please enter your new password below</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                <Input
                                    id="new_password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={passwords.new_password}
                                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                    className="pl-12 pr-12"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-10 w-12 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="new_password_check" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                <Input
                                    id="new_password_check"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={passwords.new_password_check}
                                    onChange={(e) => setPasswords({ ...passwords, new_password_check: e.target.value })}
                                    className="pl-12 pr-12"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            size="lg"
                            disabled={loading || !passwords.new_password || !passwords.new_password_check}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating Password...
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
