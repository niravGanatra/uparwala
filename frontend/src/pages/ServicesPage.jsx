import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Sparkles, Calendar, CheckCircle } from 'lucide-react';
import { servicesAPI } from '../services/servicesService';
import { Button } from '../components/ui/button';
import SpiritualLoader from '../components/SpiritualLoader';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await servicesAPI.getAll();
                setServices(response.data || response); // Handle likely response format
            } catch (error) {
                console.error('Failed to load services:', error);
                toast.error("Unable to load divine services at this moment.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleBookService = (slug) => {
        // Navigate to booking page or open modal
        // For now, let's navigate to a booking route we will create next
        navigate(`/services/book/${slug}`);
    };

    if (loading) return <SpiritualLoader message="Loading Sacred Services..." />;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Divine Hero Header */}
            <div
                className="relative py-20 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #FF9933 0%, #CC5500 50%, #800000 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Sacred Vedic Services
                    </h1>
                    <p className="text-xl md:text-2xl text-orange-100 font-medium">
                        Connect with verified Pandits for authentic rituals at your home
                    </p>
                </motion.div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                        >
                            {/* Card Header with Icon */}
                            <div className="bg-orange-50 p-6 flex items-start justify-between">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-slate-900 font-serif">
                                        ₹{parseFloat(service.base_price).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wide">Base Dakshina</span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-700 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>
                                    {service.name}
                                </h3>
                                <p className="text-slate-600 mb-6 line-clamp-2 min-h-[48px]">
                                    {service.description}
                                </p>

                                {/* Meta Info */}
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span>{service.duration_minutes} Mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Verified Pandit</span>
                                    </div>
                                </div>

                                {/* Samagri Preview */}
                                {service.required_samagri_list && service.required_samagri_list.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Samagri Included</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {service.required_samagri_list.slice(0, 3).map((item, i) => (
                                                <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100">
                                                    {item.item}
                                                </span>
                                            ))}
                                            {service.required_samagri_list.length > 3 && (
                                                <span className="text-xs text-slate-400 px-2 py-1">
                                                    +{service.required_samagri_list.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => handleBookService(service.slug)}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                                >
                                    Book Now
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {services.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-2xl text-slate-400 font-serif italic">No services available at the moment.</p>
                        <p className="text-slate-400 mt-2">Please check back later for divine blessings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
