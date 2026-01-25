import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
    // Current Wizard Step (1, 2, 3)
    const [step, setStep] = useState(1);

    // Persisted Selection Data
    const [bookingData, setBookingData] = useState({
        pooja: null,     // Selected Service Object
        pandit: null,    // Selected Pandit Object
        date: null,      // Selected Date
        slot: null,      // Selected Time Slot
        totalAmount: 0,  // Final calculated amount
    });

    // Actions
    const selectPooja = (pooja) => {
        setBookingData(prev => ({
            ...prev,
            pooja,
            pandit: null, // Reset subsequent selections
            slot: null,
            totalAmount: parseFloat(pooja.base_price) || 0
        }));
        setStep(2);
    };

    const selectPandit = (pandit) => {
        setBookingData(prev => ({
            ...prev,
            pandit,
            slot: null
            // Here you could adjust totalAmount based on Pandit expertise if needed
        }));
        setStep(3);
    };

    const selectSlot = (date, slot) => {
        setBookingData(prev => ({ ...prev, date, slot }));
    };

    const resetBooking = () => {
        setStep(1);
        setBookingData({
            pooja: null,
            pandit: null,
            date: null,
            slot: null,
            totalAmount: 0
        });
    };

    return (
        <BookingContext.Provider value={{
            step,
            setStep,
            bookingData,
            selectPooja,
            selectPandit,
            selectSlot,
            resetBooking
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
