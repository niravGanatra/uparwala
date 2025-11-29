import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Store, Mail, Phone, MapPin, FileText, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const VendorRegistrationPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        business_name: '',
        business_email: '',
        business_phone: '',
        business_address: '',
        store_description: '',
        tax_number: '',
    });
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!agreedToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/users/vendor/apply/', formData);

            toast.success('Vendor application submitted successfully! Please wait for admin approval.', {
                duration: 5000,
            });

            // Redirect to login page
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Vendor registration failed:', error);
            const errorMessage = error.response?.data?.username?.[0] ||
                error.response?.data?.email?.[0] ||
                'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="shadow-2xl">
                        <CardHeader className="text-center pb-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <Store className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold">Become a Vendor</CardTitle>
                            <p className="text-slate-600 mt-2">Join our marketplace and start selling your products</p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Account Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Username *</label>
                                            <Input
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                placeholder="johndoe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email *</label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Password *</label>
                                            <Input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                                            <Input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Business Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Business Name *</label>
                                            <div className="relative">
                                                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    name="business_name"
                                                    value={formData.business_name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Your Store Name"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Business Email *</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        type="email"
                                                        name="business_email"
                                                        value={formData.business_email}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="business@example.com"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Business Phone *</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        type="tel"
                                                        name="business_phone"
                                                        value={formData.business_phone}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="+91 1234567890"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Business Address *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <textarea
                                                    name="business_address"
                                                    value={formData.business_address}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Full business address"
                                                    className="w-full pl-10 p-2 border rounded-lg min-h-[80px]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Store Description *</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <textarea
                                                    name="store_description"
                                                    value={formData.store_description}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Tell us about your store and products..."
                                                    className="w-full pl-10 p-2 border rounded-lg min-h-[100px]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tax/GST Number (Optional)</label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    name="tax_number"
                                                    value={formData.tax_number}
                                                    onChange={handleChange}
                                                    placeholder="GST/Tax Number"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="border-t pt-6">
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-orange-600 hover:underline">
                                                Terms and Conditions
                                            </Link>{' '}
                                            and understand that my application will be reviewed by the admin before approval.
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting Application...
                                        </div>
                                    ) : (
                                        'Submit Vendor Application'
                                    )}
                                </Button>

                                <p className="text-center text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-orange-600 hover:underline font-semibold">
                                        Sign In
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default VendorRegistrationPage;
