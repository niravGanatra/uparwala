import { Search, Package, RefreshCw, CreditCard, User, HelpCircle, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Search Hero */}
            {/* Search Hero */}
            <div className="bg-slate-900 text-white pt-20 pb-32 px-4 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">How can we help you?</h1>
                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search for help (e.g. return order, track package)"
                        className="pl-12 py-6 text-slate-900 text-lg rounded-full shadow-2xl border-0 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
                    />
                </div>
            </div>

            {/* Quick Categories */}
            <div className="max-w-6xl mx-auto px-4 -mt-16 mb-20 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[
                        { icon: Package, label: "Orders", link: "/orders" },
                        { icon: RefreshCw, label: "Returns", link: "/refund-policy" },
                        { icon: CreditCard, label: "Payments", link: "/payments" },
                        { icon: User, label: "Account", link: "/profile" },
                        { icon: HelpCircle, label: "FAQ", link: "/faq" }
                    ].map((item, idx) => (
                        <Link key={idx} to={item.link}>
                            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border-0 shadow-lg bg-white">
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                                        <item.icon className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <span className="font-semibold text-slate-800">{item.label}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Popular Articles */}
            <div className="max-w-4xl mx-auto px-4 mb-16">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Topics</h2>
                <div className="space-y-4">
                    {[
                        { text: "How do I track my order status?", link: "/tickets" },
                        { text: "What is the return policy for spiritual items?", link: "/refund-policy" },
                        { text: "How can I change my delivery address?", link: "/profile" },
                        { text: "Do you offer international shipping?", link: "/shipping" },
                        { text: "How to contact a seller directly?", link: "/faq" }
                    ].map((topic, idx) => (
                        <Link key={idx} to={topic.link} className="block">
                            <div className="bg-white p-4 rounded-lg border border-slate-200 hover:border-orange-300 cursor-pointer transition-colors flex justify-between items-center group">
                                <span className="text-slate-700 group-hover:text-orange-700">{topic.text}</span>
                                <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-orange-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white border-t border-slate-200 py-12 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Still need help?</h2>
                    <p className="text-slate-600 mb-8">Our support team is available Mon-Sat, 9am - 6pm.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="mailto:support@uparwala.in" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors">
                            <MessageSquare className="h-5 w-5" />
                            Email Support
                        </a>
                        <a href="tel:+917990100510" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors">
                            Call Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
