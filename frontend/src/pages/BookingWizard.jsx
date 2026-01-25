import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingProvider, useBooking } from '../context/BookingContext';
import PoojaSelection from '../components/booking/PoojaSelection';
import PanditMarketplace from '../components/booking/PanditMarketplace';
import BookingScheduler from '../components/booking/BookingScheduler';
import { Check } from 'lucide-react';

const STEPS = [
    { number: 1, title: "Select Service" },
    { number: 2, title: "Choose Pandit" },
    { number: 3, title: "Schedule" },
];

const ProgressBar = () => {
    const { step } = useBooking();

    return (
        <div className="w-full max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10" />

                {STEPS.map((s) => {
                    const isCompleted = step > s.number;
                    const isCurrent = step === s.number;

                    return (
                        <div key={s.number} className="flex flex-col items-center bg-slate-50 px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : isCurrent
                                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg scale-110'
                                        : 'bg-white border-slate-300 text-slate-400'
                                    }`}
                            >
                                {isCompleted ? <Check className="w-6 h-6" /> : <span className="font-bold">{s.number}</span>}
                            </div>
                            <span
                                className={`text-xs mt-2 font-medium transition-colors duration-300 ${isCurrent ? 'text-orange-700' : 'text-slate-500'
                                    }`}
                            >
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Animated Progress Line */}
            <div className="relative h-1 bg-slate-100 mt-4 rounded-full overflow-hidden hidden md:block">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
};

const WizardContent = () => {
    const { step } = useBooking();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
            >
                {step === 1 && <PoojaSelection />}
                {step === 2 && <PanditMarketplace />}
                {step === 3 && <BookingScheduler />}
            </motion.div>
        </AnimatePresence>
    );
};

const WizardInitializer = () => {
    const { state } = useLocation();
    const { selectPooja, bookingData } = useBooking();

    useEffect(() => {
        if (state?.selectedService && !bookingData.pooja) {
            selectPooja(state.selectedService);
        }
    }, [state, selectPooja, bookingData.pooja]);

    return null;
};

const BookingWizard = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Divine Header Background */}
            <div className="h-48 bg-gradient-to-r from-orange-400 to-red-600 text-white pt-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                <h1 className="text-3xl font-bold font-serif relative z-10">Book Your Divine Service</h1>
            </div>

            <BookingProvider>
                <WizardInitializer />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 min-h-[600px]">
                        <ProgressBar />
                        <WizardContent />
                    </div>
                </div>
            </BookingProvider>

            {/* Trust Footer */}
            <div className="max-w-7xl mx-auto px-4 mt-8 text-center text-slate-400 text-sm">
                <p>100% Verified Pandits • Secure Payments • Satisfaction Guaranteed</p>
            </div>
        </div>
    );
};

export default BookingWizard;
