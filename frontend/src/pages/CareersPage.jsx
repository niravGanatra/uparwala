import { useState } from 'react';
import { Briefcase, Upload, Mail, Phone, User, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import api from '../services/api';
import toast from 'react-hot-toast';

const CareersPage = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please upload PDF or DOC/DOCX file");
                return;
            }
            setResumeFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            toast.error("Please upload your resume");
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('message', formData.message);
        data.append('resume', resumeFile);

        try {
            await api.post('/users/career/apply/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            toast.success("Application submitted successfully!");
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Application failed:", error);
            const msg = error.response?.data?.detail || "Failed to submit application. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-green-50 rounded-2xl p-12 text-center border border-green-100 shadow-sm">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
                    <p className="text-lg text-slate-700 mb-8">
                        Thank you for your interest in joining <strong>Uparwala.in</strong>. We have received your details and resume. Our team will review your profile and get back to you shortly via email.
                    </p>
                    <Button onClick={() => window.location.href = '/'} className="w-full">
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Be a part of Uparwala.in and help us bridge tradition with technology. We are looking for passionate individuals to join our journey.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100 -mt-20 relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Briefcase className="w-8 h-8 text-orange-600" />
                        <h2 className="text-2xl font-bold text-slate-900">Apply Now</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 9876543210"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Upload Resume/CV *</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 text-center hover:border-orange-500 transition-colors cursor-pointer relative"
                                onClick={() => document.getElementById('resume-upload').click()}
                            >
                                <input
                                    id="resume-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center">
                                    <Upload className={`h-10 w-10 mb-3 ${resumeFile ? 'text-green-600' : 'text-slate-400'}`} />
                                    {resumeFile ? (
                                        <div>
                                            <p className="font-medium text-slate-900">{resumeFile.name}</p>
                                            <p className="text-xs text-green-600 font-medium mt-1">Ready to upload</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Message / Cover Letter (Optional)</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Tell us why you'd be a great fit..."
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </Button>
                        </div>

                        <div className="flex items-start gap-2 bg-blue-50 p-4 rounded text-xs text-blue-700">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                By submitting this form, you agree to our processing of your personal data for recruitment purposes. We will send you a confirmation email upon successful submission.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CareersPage;
