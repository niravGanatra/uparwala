import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Sanskrit Shlokas for loading screen (50 sacred verses)
const SANSKRIT_SHLOKAS = [
    {
        sanskrit: "कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती । करमूले तु गोविन्दः प्रभाते करदर्शनम् ॥",
        translation: "At the tip of the hands resides Lakshmi, in the middle Saraswati, at the base Govinda"
    },
    {
        sanskrit: "समुद्रवसने देवि पर्वतस्तनमण्डले । विष्णुपत्नि नमस्तुभ्यं पादस्पर्शं क्षमस्व मे ॥",
        translation: "O Earth Goddess, consort of Vishnu, forgive me for touching you with my feet"
    },
    {
        sanskrit: "वक्रतुण्ड महाकाय सूर्यकोटिसमप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
        translation: "O Lord Ganesha, remove all obstacles from my endeavors always"
    },
    {
        sanskrit: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः । गुरुः साक्षात् परब्रह्मा तस्मै श्रीगुरवे नमः ॥",
        translation: "Guru is Brahma, Vishnu, and Maheshwara; Guru is the Supreme Brahman"
    },
    {
        sanskrit: "सरस्वति नमस्तुभ्यं वरदे कामरूपिणि । विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा ॥",
        translation: "O Saraswati, grant me success as I begin my studies"
    },
    {
        sanskrit: "शुभं करोति कल्याणमारोग्यं धनसंपदा । शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते ॥",
        translation: "The lamp light brings auspiciousness, health, and wealth"
    },
    {
        sanskrit: "गङ्गे च यमुने चैव गोदावरि सरस्वति । नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु ॥",
        translation: "O sacred rivers Ganga, Yamuna, Godavari, be present in this water"
    },
    {
        sanskrit: "आदिदेव नमस्तुभ्यं प्रसीद मम भास्कर । दिवाकर नमस्तुभ्यं प्रभाकर नमोऽस्तु ते ॥",
        translation: "Salutations to the Sun God, source of all light"
    },
    {
        sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं । भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
        translation: "We meditate on the divine light of Savitri, may it inspire our intellect"
    },
    {
        sanskrit: "ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम् । ब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना ॥",
        translation: "The offering is Brahman, offered by Brahman into the fire of Brahman"
    },
    {
        sanskrit: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥",
        translation: "May all be happy, may all be free from illness, may none suffer"
    },
    {
        sanskrit: "ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥",
        translation: "Lead me from untruth to truth, from darkness to light, from death to immortality"
    },
    {
        sanskrit: "ॐ सह नाववतु । सह नौ भुनक्तु । सह वीर्यं करवावहै ॥",
        translation: "May we be protected together, may we be nourished together"
    },
    {
        sanskrit: "ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते । पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते ॥",
        translation: "That is whole, this is whole; from wholeness emerges wholeness"
    },
    {
        sanskrit: "ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिः ॥",
        translation: "May there be peace in heaven, peace in the sky, peace on earth"
    },
    {
        sanskrit: "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः । न हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः ॥",
        translation: "Work accomplishes goals, not mere wishes; prey doesn't enter a sleeping lion's mouth"
    },
    {
        sanskrit: "सत्यमेव जयते नानृतं सत्येन पन्था विततो देवयानः ॥",
        translation: "Truth alone triumphs, not falsehood; the path of gods is paved with truth"
    },
    {
        sanskrit: "अयं निजः परो वेति गणना लघुचेतसाम् । उदारचरितानां तु वसुधैव कुटुम्बकम् ॥",
        translation: "For the noble, the entire world is one family"
    },
    {
        sanskrit: "विद्या ददाति विनयं विनयाद्याति पात्रताम् । पात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम् ॥",
        translation: "Knowledge gives humility, humility brings worthiness, from that comes happiness"
    },
    {
        sanskrit: "धर्मो रक्षति रक्षितः ॥",
        translation: "Dharma protects those who protect Dharma"
    },
    {
        sanskrit: "अहिंसा परमो धर्मः ॥",
        translation: "Non-violence is the supreme Dharma"
    },
    {
        sanskrit: "सत्यं ब्रूयात् प्रियं ब्रूयात् न ब्रूयात् सत्यमप्रियम् । प्रियं च नानृतं ब्रूयात् एष धर्मः सनातनः ॥",
        translation: "Speak the truth, speak pleasantly; this is eternal Dharma"
    },
    {
        sanskrit: "जननी जन्मभूमिश्च स्वर्गादपि गरीयसी ॥",
        translation: "Mother and motherland are greater than heaven"
    },
    {
        sanskrit: "सत्सङ्गत्वे निस्सङ्गत्वं निस्सङ्गत्वे निर्मोहत्वम् । निर्मोहत्वे निश्चलतत्त्वं निश्चलतत्त्वे जीवन्मुक्तिः ॥",
        translation: "From good company comes detachment, from detachment liberation"
    },
    {
        sanskrit: "विद्वत्वं च नृपत्वं च नैव तुल्यं कदाचन । स्वदेशे पूज्यते राजा विद्वान् सर्वत्र पूज्यते ॥",
        translation: "A king is honored in his kingdom; a scholar is honored everywhere"
    },
    {
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
        translation: "You have the right to work, but never to its fruits"
    },
    {
        sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत । अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥",
        translation: "Whenever Dharma declines, I manifest myself"
    },
    {
        sanskrit: "परित्राणाय साधूनां विनाशाय च दुष्कृताम् । धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥",
        translation: "To protect the righteous and destroy evil, I appear age after age"
    },
    {
        sanskrit: "नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः । न चैनं क्लेदयन्त्यापो न शोषयति मारुतः ॥",
        translation: "Weapons cannot cut the soul, fire cannot burn it, water cannot wet it"
    },
    {
        sanskrit: "वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि । तथा शरीराणि विहाय जीर्णान्यन्यानि संयाति नवानि देही ॥",
        translation: "As one discards old clothes for new, the soul takes on new bodies"
    },
    {
        sanskrit: "क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः । स्मृतिभ्रंशाद् बुद्धिनाशो बुद्धिनाशात्प्रणश्यति ॥",
        translation: "From anger comes delusion, from delusion loss of memory, leading to destruction"
    },
    {
        sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय । सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥",
        translation: "Perform action established in yoga, renouncing attachment; equanimity is yoga"
    },
    {
        sanskrit: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः । अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे ॥",
        translation: "The soul is never born nor dies; it is eternal and indestructible"
    },
    {
        sanskrit: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते । तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥",
        translation: "Those who worship Me with undivided attention, I provide what they need"
    },
    {
        sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज । अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥",
        translation: "Abandon all dharmas and surrender to Me; I shall liberate you from all sins"
    },
    {
        sanskrit: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥",
        translation: "Salutations to Vishnu, of calm form, lying on the serpent"
    },
    {
        sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥",
        translation: "We worship the three-eyed Lord; may He liberate us from death"
    },
    {
        sanskrit: "कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम् । सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि ॥",
        translation: "I bow to Lord Shiva, as white as camphor, ever residing in the heart"
    },
    {
        sanskrit: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके । शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥",
        translation: "Salutations to Goddess Durga, the embodiment of all auspiciousness"
    },
    {
        sanskrit: "बुद्धिर्बलं यशोधैर्यं निर्भयत्वमरोगता । अजाड्यं वाक्पटुत्वं च हनुमत्स्मरणद्भवेत् ॥",
        translation: "Remembering Hanuman brings wisdom, strength, fame, courage"
    },
    {
        sanskrit: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् । वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥",
        translation: "I surrender to Hanuman, swift as mind, messenger of Lord Rama"
    },
    {
        sanskrit: "वसुदेवसुतं देवं कंसचाणूरमर्दनम् । देवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम् ॥",
        translation: "I bow to Krishna, son of Vasudeva, the world teacher"
    },
    {
        sanskrit: "रामाय रामभद्राय रामचन्द्राय वेधसे । रघुनाथाय नाथाय सीतायाः पतये नमः ॥",
        translation: "Salutations to Lord Rama, lord of Raghu dynasty, husband of Sita"
    },
    {
        sanskrit: "कस्तूरीतिलकं ललाटपटले वक्षःस्थले कौस्तुभं नासाग्रे वरमौक्तिकं करतले वेणुं करे कङ्कणम् ॥",
        translation: "With musk on His forehead, Kaustubha gem on His chest, flute in hand"
    },
    {
        sanskrit: "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥",
        translation: "Salutations to the Goddess who resides in all beings as power"
    },
    {
        sanskrit: "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात् । करोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि ॥",
        translation: "Whatever I do with body, speech, mind, I offer to Lord Narayana"
    },
    {
        sanskrit: "अपराधसहस्राणि क्रियन्तेऽहर्निशं मया । दासोऽयमिति मां मत्वा क्षमस्व परमेश्वर ॥",
        translation: "Forgive my thousands of offenses, O Supreme Lord"
    },
    {
        sanskrit: "आकाशात्पतितं तोयं यथा गच्छति सागरम् । सर्वदेवनमस्कारः केशवं प्रतिगच्छति ॥",
        translation: "As rain water reaches the ocean, all prayers reach Lord Keshava"
    },
    {
        sanskrit: "त्वमेव माता च पिता त्वमेव । त्वमेव बन्धुश्च सखा त्वमेव । त्वमेव विद्या द्रविणं त्वमेव । त्वमेव सर्वं मम देवदेव ॥",
        translation: "You are my mother, father, friend, knowledge, wealth, everything"
    },
    {
        sanskrit: "मङ्गलम् भगवान विष्णुः मङ्गलम् गरुडध्वजः । मङ्गलम् पुण्डरीकाक्षः मङ्गलम् तनोहरिः ॥",
        translation: "Lord Vishnu is auspiciousness, He with the Garuda flag is auspiciousness"
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
