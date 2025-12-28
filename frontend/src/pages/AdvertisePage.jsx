import { Megaphone, BarChart, Users, ArrowRight, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';

const AdvertisePage = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <Megaphone className="h-16 w-16 text-orange-500 mx-auto mb-6 animate-bounce" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Grow Your Business with Uparwala
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                        Reach millions of devotees looking for authentic spiritual products.
                        Showcase your brand to a targeted, high-intent audience.
                    </p>
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8">
                        Start Advertising
                    </Button>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Users, title: "1M+ Monthly Visitors", desc: "Access a vast community of spiritual seekers." },
                        { icon: BarChart, title: "High Conversion Rates", desc: "Target customers actively looking to buy." },
                        { icon: Megaphone, title: "Premium Ad Spots", desc: "Get featured on homepage and category tops." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
                            <item.icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Advertise with Us?</h2>
                        <ul className="space-y-4">
                            {[
                                "Targeted Reach: Connect with specific demographics.",
                                "Flexible Budget: Options for businesses of all sizes.",
                                "Performance Tracking: Real-time analytics dashboard.",
                                "Dedicated Support: Expert team to optimize your campaigns."
                            ].map((point, idx) => (
                                <li key={idx} className="flex items-start text-slate-700">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                                        <ArrowRight className="h-4 w-4 text-green-600" />
                                    </div>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-orange-100 to-amber-50 h-80 rounded-2xl flex items-center justify-center p-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-orange-800 mb-2">Ad Preview</h3>
                            <p className="text-orange-600">Your Brand Here</p>
                            <div className="w-full bg-white h-32 mt-4 rounded-lg shadow-sm border border-orange-200"></div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="bg-indigo-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to boost your sales?</h2>
                    <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
                        Contact our advertising team today to discuss custom packages tailored to your business needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="mailto:support@uparwala.in" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors">
                            <Mail className="h-5 w-5" />
                            Contact Sales
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvertisePage;
