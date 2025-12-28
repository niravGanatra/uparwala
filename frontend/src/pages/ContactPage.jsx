import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Message sent! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Have questions about your order or our products? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Support Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Phone className="h-5 w-5 text-orange-600" />
                                Sales & Support
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Call Us</p>
                                    <a href="tel:0448447878" className="text-lg font-semibold text-slate-900 hover:text-orange-600 transition-colors">
                                        044-8447878
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Sales & Support Email</p>
                                    <a href="mailto:support@uparwala.in" className="text-lg font-semibold text-slate-900 hover:text-orange-600 transition-colors">
                                        support@uparwala.in
                                    </a>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-start gap-3 text-slate-600">
                                        <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900">Working Hours</p>
                                            <p className="text-sm">Mon - Sat: 9:00 AM - 6:00 PM</p>
                                            <p className="text-sm">Sunday: Closed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                Visit Us
                            </h3>
                            <address className="not-italic text-slate-600 leading-relaxed">
                                <strong>Uparwala Traders LLP</strong><br />
                                11, Kohinoor Society,<br />
                                Vijay Nagar Road,<br />
                                Naranpura,<br />
                                Ahmedabad, 380013,<br />
                                Gujarat, India
                            </address>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="How can we help?"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-slate-400"
                                        placeholder="Type your message here..."
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="bg-slate-900 hover:bg-slate-800 text-white min-w-[150px]"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
