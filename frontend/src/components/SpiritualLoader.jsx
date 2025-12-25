import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Sanskrit Shlokas for loading screen
const SANSKRIT_SHLOKAS = [
    {
        sanskrit: "ॐ सर्वे भवन्तु सुखिनः",
        translation: "May all beings be happy"
    },
    {
        sanskrit: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ",
        translation: "O Lord Ganesha, of curved trunk and massive form"
    },
    {
        sanskrit: "ॐ असतो मा सद्गमय",
        translation: "Lead me from untruth to truth"
    },
    {
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
        translation: "You have the right to work, but not to the fruits"
    },
    {
        sanskrit: "ॐ शान्तिः शान्तिः शान्तिः",
        translation: "Om Peace, Peace, Peace"
    },
    {
        sanskrit: "सत्यमेव जयते",
        translation: "Truth alone triumphs"
    },
    {
        sanskrit: "ॐ भूर्भुवः स्वः",
        translation: "Om, the three worlds - Earth, Atmosphere, Heaven"
    },
    {
        sanskrit: "लोकाः समस्ताः सुखिनो भवन्तु",
        translation: "May all the worlds be happy"
    },
    {
        sanskrit: "ॐ नमः शिवाय",
        translation: "Salutations to Lord Shiva"
    },
    {
        sanskrit: "श्री गणेशाय नमः",
        translation: "Salutations to Lord Ganesha"
    },
    {
        sanskrit: "ॐ नमो भगवते वासुदेवाय",
        translation: "Salutations to Lord Vasudeva"
    },
    {
        sanskrit: "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः",
        translation: "Where there is Krishna, there is victory"
    }
];

/**
 * Spiritual Loading Screen with Om Symbol and Sanskrit Shlokas
 * 
 * @param {Object} props
 * @param {boolean} props.fullScreen - Whether to show full screen (default: true)
 * @param {string} props.message - Optional custom message for slow loading
 * @param {boolean} props.showShloka - Whether to show shloka (default: true)
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'lg')
 */
const SpiritualLoader = ({
    fullScreen = true,
    message = null,
    showShloka = true,
    size = 'lg'
}) => {
    // Random shloka (memoized to not change during loading)
    const randomShloka = useMemo(() => {
        return SANSKRIT_SHLOKAS[Math.floor(Math.random() * SANSKRIT_SHLOKAS.length)];
    }, []);

    const sizeConfig = {
        sm: {
            container: 'py-8',
            om: 'text-4xl',
            glow: 'w-16 h-16',
            shloka: 'text-lg',
            translation: 'text-xs'
        },
        md: {
            container: 'py-12',
            om: 'text-6xl',
            glow: 'w-24 h-24',
            shloka: 'text-xl md:text-2xl',
            translation: 'text-sm'
        },
        lg: {
            container: 'py-16',
            om: 'text-8xl',
            glow: 'w-32 h-32',
            shloka: 'text-2xl md:text-3xl',
            translation: 'text-sm md:text-base'
        }
    };

    const config = sizeConfig[size] || sizeConfig.lg;

    const content = (
        <div className={`text-center px-6 max-w-md mx-auto ${config.container}`}>
            {/* Animated Om Symbol */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
            >
                {/* Glowing background */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`${config.glow} bg-gradient-to-br from-orange-300 to-amber-400 rounded-full blur-xl`}
                    />
                </div>

                {/* Om Symbol */}
                <motion.div
                    animate={{
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`relative ${config.om} font-bold text-orange-600 drop-shadow-lg`}
                    style={{ fontFamily: 'serif' }}
                >
                    ॐ
                </motion.div>
            </motion.div>

            {/* Sanskrit Shloka */}
            {showShloka && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-6"
                >
                    <p className={`${config.shloka} font-medium text-amber-800 mb-3`} style={{ fontFamily: 'serif' }}>
                        {randomShloka.sanskrit}
                    </p>
                    <p className={`${config.translation} text-amber-600 italic`}>
                        "{randomShloka.translation}"
                    </p>
                </motion.div>
            )}

            {/* Loading indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-amber-700"
            >
                <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-amber-500 rounded-full"
                />
                <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-amber-500 rounded-full"
                />
                <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-amber-500 rounded-full"
                />
            </motion.div>

            {/* Custom message */}
            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-sm text-amber-600"
                >
                    🙏 {message}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl">
            {content}
        </div>
    );
};

export default SpiritualLoader;
