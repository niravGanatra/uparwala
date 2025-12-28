import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { register } from '../services/auth';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            const errorMsg = error.response?.data?.email?.[0] ||
                'Registration failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-orange-600 mb-2">Uparwala</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                    <p className="text-base text-slate-600">Join thousands of happy customers</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-2">
                                    First Name
                                </label>
                                <Input
                                    id="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-2">
                                    Last Name
                                </label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>



                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="password2" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <Input
                                id="password2"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password2}
                                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link to="/login">
                        <Button variant="outline" className="w-full" size="lg">
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                        Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
