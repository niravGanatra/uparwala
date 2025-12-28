import { Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';

const CorporatePage = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                        <Building2 className="h-10 w-10 text-orange-600" />
                        Corporate Information
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Details about our registered entity, Uparwala Traders LLP.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Company Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
                            About The Company
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            <p className="mb-4">
                                <strong>Uparwala.in</strong> is operated by <strong>Uparwala Traders LLP</strong>, a company dedicated to providing high-quality religious products and services. We are committed to transparency, ethical business practices, and customer satisfaction.
                            </p>
                            <p>
                                Our mission is to connect devotees with authentic spiritual products and support our vendor community through fair commerce and technology-driven solutions.
                            </p>
                        </div>
                    </div>

                    {/* Registered Office Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-600" />
                            Registered Office Address
                        </h2>
                        <address className="not-italic text-slate-600 space-y-1">
                            <strong>Uparwala Traders LLP</strong><br />
                            11, Kohinoor Society,<br />
                            Vijay Nagar Road,<br />
                            Naranpura,<br />
                            Ahmedabad, 380013,<br />
                            Gujarat, India
                        </address>
                    </div>

                    {/* Contact & Legal Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Phone className="h-5 w-5 text-orange-600" />
                                Contact Details
                            </h2>
                            <ul className="space-y-4 text-slate-600">
                                <li className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-900">Telephone</span>
                                        <a href="tel:+917990100510" className="hover:text-orange-600 transition-colors">+91 7990100510</a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-900">Email</span>
                                        <a href="mailto:support@uparwala.in" className="hover:text-orange-600 transition-colors">support@uparwala.in</a>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-orange-600" />
                                Legal Identity
                            </h2>
                            <ul className="space-y-4 text-slate-600">
                                <li className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900">Corporate Identity Number (CIN)</span>
                                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block w-fit mt-1">
                                        U51109KA2012PTC066107
                                    </span>
                                </li>
                                <li className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900">Business Type</span>
                                    <span>Limited Liability Partnership (LLP)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Uparwala Traders LLP. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default CorporatePage;
