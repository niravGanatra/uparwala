import { HandHeart, Users, Sparkles, Building2, MapPin } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="bg-orange-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">About Uparwala.in</h1>
                    <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
                        A dedicated online marketplace created with a sacred vision — to make authentic Hindu religious products and services easily accessible to devotees across India.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Core Mission */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-3xl font-bold text-slate-900">Our Story</h2>
                            <p className="text-slate-700 leading-relaxed">
                                Owned and operated by <strong>Uparwala Traders LLP</strong>, Uparwala.in connects trusted sellers, traditional artisans, and verified suppliers from different parts of the country to offer a wide range of pooja samagri, religious kits, idols, spiritual accessories, and sacred essentials, all under one divine platform.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                Understanding the deeper spiritual needs of devotees, we go beyond products. Upon request, we also assist in arranging experienced <strong>Pandit ji</strong> for various poojas, kathas, havans, and religious ceremonies, ensuring rituals are performed according to proper Vedic traditions. Additionally, we offer <strong>Vastu consultation services</strong> to help create harmony, positivity, and balance in homes and workplaces.
                            </p>
                        </div>
                        <div className="hidden md:flex justify-center flex-1">
                            <div className="bg-orange-100/50 p-8 rounded-full">
                                <Sparkles className="w-32 h-32 text-orange-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Philosophy */}
                <div className="bg-slate-50 rounded-2xl p-8 md:p-12 mb-16 border border-slate-100">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">What We Believe In</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                            <div className="bg-orange-100 p-3 rounded-lg h-fit">
                                <Sparkles className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Purity & Authenticity</h3>
                                <p className="text-sm text-slate-600">Pure, traditional, and authentic samagri without compromise.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                            <div className="bg-orange-100 p-3 rounded-lg h-fit">
                                <HandHeart className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Respect for Tradition</h3>
                                <p className="text-sm text-slate-600">Deep respect for Hindu rituals, scriptures, and Vedic practices.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                            <div className="bg-orange-100 p-3 rounded-lg h-fit">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Trusted Guidance</h3>
                                <p className="text-sm text-slate-600">Expert guidance through Vastu and Pandit services.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                            <div className="bg-orange-100 p-3 rounded-lg h-fit">
                                <Building2 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Modern Convenience</h3>
                                <p className="text-sm text-slate-600">Bridging ancient traditions with easy online access.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conclusion */}
                <div className="text-center max-w-2xl mx-auto space-y-6">
                    <p className="text-lg text-slate-700 italic">
                        "In today’s fast-paced world, sourcing genuine pooja items and reliable religious guidance can be challenging. At Uparwala.in, we simplify this journey so devotees can focus fully on devotion and faith."
                    </p>

                    <div className="pt-4">
                        <h3 className="text-2xl font-bold text-orange-600 mb-2">Uparwala.in</h3>
                        <p className="font-medium text-slate-900">Where Faith, Tradition, and Trust Come Together</p>
                    </div>

                    <div className="pt-8 flex justify-center items-center gap-2 text-slate-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Ahmedabad, Gujarat, India</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
