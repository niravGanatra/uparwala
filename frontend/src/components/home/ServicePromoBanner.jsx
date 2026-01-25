import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * ServicePromoBanner - Divine aesthetic promotional banner for Pandit Booking Services
 * Placed prominently after the hero section as a "Value Break" pattern
 */
const ServicePromoBanner = () => {
    const navigate = useNavigate();

    const handleBookNow = () => {
        navigate('/services');
    };

    return (
        <section className="py-6 md:py-10 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
            >
                <div
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                    onClick={handleBookNow}
                    style={{
                        background: 'linear-gradient(135deg, #FF9933 0%, #CC5500 50%, #800000 100%)'
                    }}
                >
                    {/* Decorative Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '60px 60px'
                            }}
                        />
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-10 lg:p-12">
                        {/* Content Section */}
                        <div className="flex-1 text-center md:text-left mb-6 md:mb-0 md:pr-8">
                            {/* NEW SERVICE Badge */}
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs md:text-sm font-bold rounded-full mb-4 border border-white/30 tracking-wider"
                            >
                                ✨ NEW SERVICE
                            </motion.span>

                            {/* Main Headline - Serif Font for Traditional Feel */}
                            <h2
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight tracking-wide"
                                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                            >
                                Bring Divine Blessings Home
                            </h2>

                            {/* Subheadline */}
                            <p className="text-base sm:text-lg md:text-xl text-orange-100 mb-2 font-medium">
                                Book Vedic Pandits for Your Puja
                            </p>

                            {/* Service Details */}
                            <p className="text-sm md:text-base text-orange-200/90 mb-6 md:mb-8 max-w-xl">
                                Verified professionals for Satyanarayan, Griha Pravesh, Weddings, and all sacred ceremonies
                            </p>

                            {/* CTA Button - White with Gold Text */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookNow();
                                }}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                                style={{ color: '#B8860B' }}
                            >
                                <span>Book Now</span>
                                <svg
                                    className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </motion.button>

                            {/* Trust Badges */}
                            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-orange-100">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified Pandits
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Live Tracking
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Secure Payments
                                </span>
                            </div>
                        </div>

                        {/* Kalash / Pandit Illustration Section */}
                        <div className="relative flex-shrink-0 w-48 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72">
                            {/* Glowing Background Circle */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-yellow-200/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                            {/* Kalash SVG Illustration */}
                            <svg
                                viewBox="0 0 200 200"
                                className="relative w-full h-full drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                            >
                                {/* Kalash Base */}
                                <ellipse cx="100" cy="170" rx="45" ry="10" fill="#FFD700" opacity="0.3" />

                                {/* Kalash Body */}
                                <path
                                    d="M60 140 Q55 120 60 100 Q65 70 100 60 Q135 70 140 100 Q145 120 140 140 Q120 150 100 150 Q80 150 60 140 Z"
                                    fill="url(#kalashGradient)"
                                    stroke="#FFD700"
                                    strokeWidth="2"
                                />

                                {/* Kalash Neck */}
                                <path
                                    d="M80 60 Q80 50 85 45 Q100 35 115 45 Q120 50 120 60 Q110 65 100 65 Q90 65 80 60 Z"
                                    fill="#FFD700"
                                    opacity="0.9"
                                />

                                {/* Coconut */}
                                <ellipse cx="100" cy="35" rx="18" ry="16" fill="#8B4513" />
                                <ellipse cx="100" cy="32" rx="12" ry="10" fill="#A0522D" />

                                {/* Mango Leaves */}
                                <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                                    <path d="M100 45 Q80 30 70 15" stroke="#228B22" strokeWidth="2" fill="none" />
                                    <path d="M70 15 Q75 25 80 20 Q72 18 70 15 Z" fill="#32CD32" />

                                    <path d="M100 45 Q90 25 85 10" stroke="#228B22" strokeWidth="2" fill="none" />
                                    <path d="M85 10 Q88 22 93 17 Q87 15 85 10 Z" fill="#32CD32" />

                                    <path d="M100 45 Q110 25 115 10" stroke="#228B22" strokeWidth="2" fill="none" />
                                    <path d="M115 10 Q112 22 107 17 Q113 15 115 10 Z" fill="#32CD32" />

                                    <path d="M100 45 Q120 30 130 15" stroke="#228B22" strokeWidth="2" fill="none" />
                                    <path d="M130 15 Q125 25 120 20 Q128 18 130 15 Z" fill="#32CD32" />
                                </g>

                                {/* Decorative Band */}
                                <rect x="70" y="95" width="60" height="8" rx="2" fill="#FFD700" opacity="0.8" />
                                <rect x="75" y="110" width="50" height="4" rx="2" fill="#FFD700" opacity="0.6" />

                                {/* Swastika Symbol */}
                                <g transform="translate(90, 120)" fill="#FF6600" opacity="0.7">
                                    <rect x="8" y="0" width="4" height="20" />
                                    <rect x="0" y="8" width="20" height="4" />
                                    <rect x="0" y="0" width="8" height="4" />
                                    <rect x="12" y="16" width="8" height="4" />
                                    <rect x="0" y="16" width="4" height="4" />
                                    <rect x="16" y="0" width="4" height="8" />
                                </g>

                                {/* Gradient Definitions */}
                                <defs>
                                    <linearGradient id="kalashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FFD700" />
                                        <stop offset="50%" stopColor="#FFA500" />
                                        <stop offset="100%" stopColor="#DAA520" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* Bottom Decorative Border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-400" />
                </div>
            </motion.div>
        </section>
    );
};

export default ServicePromoBanner;
