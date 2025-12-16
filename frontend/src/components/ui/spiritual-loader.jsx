import { useState, useEffect } from 'react';

const shlokas = [
    { text: "Focus on your duty, not the results.", ref: "Bhagavad Gita 2.47" },
    { text: "Perform your duty with balance.", ref: "Bhagavad Gita 2.48" },
    { text: "There is no loss of effort here.", ref: "Bhagavad Gita 2.40" },
    { text: "Excellence in action is Yoga.", ref: "Bhagavad Gita 2.50" },
    { text: "The soul is neither born, nor does it die.", ref: "Bhagavad Gita 2.20" },
    { text: "A person is what their deep desire is.", ref: "Bhagavad Gita" },
    { text: "Change is the law of the universe.", ref: "Bhagavad Gita" },
    { text: "Man is made by his belief. As he believes, so he is.", ref: "Bhagavad Gita 17.3" }
];

const SpiritualLoader = ({ size = 'md' }) => {
    const [shloka, setShloka] = useState(shlokas[0]);

    useEffect(() => {
        const randomShloka = shlokas[Math.floor(Math.random() * shlokas.length)];
        setShloka(randomShloka);
    }, []);

    const sizeClasses = {
        sm: 'w-12 h-12 text-xl',
        md: 'w-16 h-16 text-2xl',
        lg: 'w-24 h-24 text-4xl'
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="relative flex items-center justify-center">
                <div className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin`}></div>
                <div className={`absolute ${sizeClasses[size].split(' ')[2]} flex items-center justify-center pb-1 text-orange-600`}>
                    🕉️
                </div>
            </div>
            <div className="text-center max-w-sm animate-fade-in">
                <p className="text-sm font-medium text-slate-700 italic mb-1">
                    "{shloka.text}"
                </p>
                <p className="text-xs text-orange-600 font-semibold">
                    - {shloka.ref}
                </p>
            </div>
        </div>
    );
};

export default SpiritualLoader;
