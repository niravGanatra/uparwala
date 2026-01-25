import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../../components/ui/button';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Star, ShieldCheck, Info } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

const TIME_SLOTS = [
    { time: "07:00 AM", shubh: true },
    { time: "09:00 AM", shubh: true },
    { time: "11:00 AM", shubh: false },
    { time: "02:00 PM", shubh: false },
    { time: "04:00 PM", shubh: true },
    { time: "06:00 PM", shubh: true },
    { time: "08:00 PM", shubh: false },
];

const BookingScheduler = () => {
    const { bookingData, selectSlot, setStep } = useBooking();
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [selectedTime, setSelectedTime] = useState(null);

    // Generate next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

    const handleSlotClick = (slot) => {
        setSelectedTime(slot.time);
        selectSlot(selectedDate, slot.time);
    };

    const handleProceed = () => {
        // Here you would navigate to payment or show separate confirmation
        // For this demo, just alert
        alert(`Booking Confirmed!\nPandit: ${bookingData.pandit.name}\nDate: ${format(selectedDate, 'dd MMM yyyy')}\nTime: ${selectedTime}`);
    };

    if (!bookingData.pandit) return null; // Safety check

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setStep(2)} className="p-1 hover:bg-slate-100 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h2 className="text-xl font-bold text-slate-900">Schedule & Book</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 pb-24">
                {/* Left: Pandit Details Summary */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center lg:text-left">
                        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto lg:mx-0 border-4 border-orange-50 mb-4">
                            <img src={bookingData.pandit.image} alt={bookingData.pandit.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{bookingData.pandit.name}</h3>
                        <div className="flex items-center justify-center lg:justify-start gap-1 text-sm text-slate-600 mt-1">
                            <Star className="w-4 h-4 text-orange-500 fill-current" />
                            <span className="font-medium">{bookingData.pandit.rating}</span>
                            <span className="text-slate-300">|</span>
                            <span>{bookingData.pandit.experience} Exp</span>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Service Details</h4>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-700">{bookingData.pooja?.name}</span>
                                <span className="font-bold text-slate-900">₹{bookingData.pooja?.base_price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <span>Pandit Dakshina</span>
                                <span>Included</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-500 mt-1">
                                <span>Platform Fee</span>
                                <span>₹50</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-lg font-bold text-slate-900">
                                <span>Total</span>
                                <span>₹{parseFloat(bookingData.pooja?.base_price || 0) + 50}</span>
                            </div>
                        </div>

                        <div className="mt-4 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2 justify-center lg:justify-start">
                            <ShieldCheck className="w-4 h-4" />
                            Verified & Background Checked
                        </div>
                    </div>
                </div>

                {/* Right: Calendar & Slots */}
                <div className="lg:w-2/3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-fit">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-orange-600" />
                            Select Date
                        </h3>
                        {/* Horizontal Date Picker */}
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
                            {dates.map((date, i) => {
                                const isSelected = selectedDate.toDateString() === date.toDateString();
                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setSelectedTime(null);
                                        }}
                                        className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-xl border transition-all ${isSelected
                                                ? 'bg-orange-600 border-orange-600 text-white shadow-md scale-105'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                                            }`}
                                    >
                                        <span className="text-xs font-medium uppercase">{format(date, 'EEE')}</span>
                                        <span className="text-xl font-bold mt-1">{format(date, 'dd')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-600" />
                                Select Time Slot
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                Shubh Muhurat
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {TIME_SLOTS.map((slot, i) => {
                                const isSelected = selectedTime === slot.time;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSlotClick(slot)}
                                        className={`relative py-3 px-2 rounded-xl border text-sm font-medium transition-all ${isSelected
                                                ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                                            }`}
                                    >
                                        {slot.time}
                                        {slot.shubh && (
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Prices may vary based on specific muhurat and customizations required during the ceremony.</p>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Total to Pay</p>
                        <p className="text-2xl font-bold text-slate-900">₹{parseFloat(bookingData.pooja?.base_price || 0) + 50}</p>
                    </div>
                    <Button
                        disabled={!selectedTime}
                        onClick={handleProceed}
                        className={`px-8 py-6 text-lg rounded-xl shadow-lg transition-all ${selectedTime ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-300 cursor-not-allowed'}`}
                    >
                        Proceed to Pay
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BookingScheduler;
