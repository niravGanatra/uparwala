import { Gift, CreditCard, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';

const GiftCardsPage = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Gift className="h-20 w-20 text-yellow-400 mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Uparwala Gift Cards</h1>
                    <p className="text-xl text-purple-200 mb-8">
                        The perfect gift for every spiritual journey. Give your loved ones the freedom to choose from thousands of authentic products.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold">
                            Buy Gift Card
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-900 font-semibold">
                            Check Balance
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Smartphone, title: "Instant Delivery", desc: "Sent directly to email. Perfect for last-minute gifts." },
                        { icon: CreditCard, title: "Secure & Flexible", desc: "Add to wallet and spend across multiple orders." },
                        { icon: CheckCircle, title: "No Expiry Date", desc: "Take your time. Our gift cards never expire." }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-6">
                            <div className="bg-white p-4 rounded-full shadow-md mb-4">
                                <item.icon className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Balance Check Section */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Check Gift Card Balance</h2>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                                <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX" className="w-full p-2 border border-slate-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">PIN</label>
                                <input type="password" placeholder="****" className="w-full p-2 border border-slate-300 rounded-md" />
                            </div>
                        </div>
                        <Button className="w-full bg-slate-900 text-white">Check Balance</Button>
                    </form>
                </div>
            </div>

            {/* FAQ Teaser */}
            <div className="bg-indigo-50 py-12 px-4 text-center">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">Got questions?</h3>
                <p className="text-indigo-700 mb-6">Learn more about redeeming, terms, and conditions.</p>
                <a href="/faq" className="text-indigo-600 font-semibold hover:underline">Visit FAQ →</a>
            </div>
        </div>
    );
};

export default GiftCardsPage;
