import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/servicesService';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import SpiritualLoader from '../components/SpiritualLoader';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                // Find service by slug (or fetch by ID if slug not supported in getById, but user passed slug)
                // Since our API currently supports getById or getAll, we might need to filter.
                // Or better, fetch all and find. Optimally backend would support slug lookup.
                const response = await servicesAPI.getAll();
                const found = response.data.find(s => s.slug === slug);
                if (found) {
                    setService(found);
                } else {
                    toast.error("Service not found");
                    navigate('/services');
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading service details");
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchService();
    }, [slug, navigate]);

    const handleConfirmBooking = () => {
        if (!user) {
            toast.error("Please login to book a service");
            navigate('/login');
            return;
        }
        // Here we would call bookingsAPI.create
        toast.success("Booking request sent to Pandits! (Demo)");
        navigate('/orders'); // Or /services/bookings
    };

    if (loading) return <SpiritualLoader message="Preparing Booking..." />;
    if (!service) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white text-center">
                        <h1 className="text-3xl font-bold font-serif mb-2">Book {service.name}</h1>
                        <p className="text-orange-100">Complete your divine request</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Service Details</h3>
                            <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block">Duration</span>
                                    <span className="font-medium text-slate-800">{service.duration_minutes} Minutes</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Dakshina</span>
                                    <span className="font-medium text-slate-800">₹{parseFloat(service.base_price).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Date & Time</h3>
                            <p className="text-slate-500 text-sm italic">
                                Calendar selection would appear here.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => navigate('/services')} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmBooking} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                                Confirm Request
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BookingPage;
