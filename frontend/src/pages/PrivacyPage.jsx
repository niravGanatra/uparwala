import { Eye, Database, Share2, Clock, UserCheck, Cookie, Users, Globe, Shield, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-10 h-10 text-orange-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        <strong>Last Updated:</strong> December 21, 2025
                    </p>
                </header>

                {/* Intro */}
                <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">
                        Uparwala Traders LLP ("Company", "We", "Us", or "Our") respects Your privacy and is committed to protecting Your personal data. This Privacy Policy explains how We collect, use, disclose, and safeguard information on Uparwala.in ("Platform"), in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (if enacted and applicable).
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                        <p className="text-blue-800 text-sm">
                            By using the Platform, You consent to Our practices as described herein.
                        </p>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {/* 1. Information We Collect */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">1. Information We Collect</h2>
                        </div>
                        <div className="space-y-4 text-slate-700">
                            <div>
                                <p className="font-medium text-slate-800">Personal Information:</p>
                                <p>Name, email, mobile number, address, date of birth, gender, and payment details (e.g., bank account for Vendors).</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Sensitive Personal Data:</p>
                                <p>Financial information (e.g., tokenized card details), health-related data if shared voluntarily (e.g., allergies for food items).</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Non-Personal Information:</p>
                                <p>IP address, browser type, device ID, location data (with consent), browsing history, and cookies.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Vendor-Specific:</p>
                                <p>Business details, GSTIN, PAN, and Product-related data.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Automatically Collected:</p>
                                <p>Usage data, such as pages visited, time spent, and interactions.</p>
                            </div>
                            <p className="text-sm text-slate-600 italic mt-2">
                                We collect data when You register, make purchases, list Products, contact support, or interact with features.
                            </p>
                        </div>
                    </section>

                    {/* 2. How We Use Your Information */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>To operate the Platform:</strong> Process orders, facilitate payments, and manage Accounts.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>For personalization:</strong> Recommend Products based on browsing history.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Marketing:</strong> Send promotional emails/SMS (with opt-out options), subject to TRAI regulations.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Analytics:</strong> Improve services using tools like Google Analytics.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Legal Compliance:</strong> Respond to government requests or audits.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Fraud Prevention:</strong> Detect and prevent misuse.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 3. Sharing of Information */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Share2 className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">3. Sharing of Information</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>With Vendors:</strong> Buyer details (e.g., shipping address) for order fulfillment.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Service Providers:</strong> Third parties for hosting, payments, logistics (e.g., India Post, Delhivery), analytics, and marketing, bound by confidentiality.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Legal Requirements:</strong> If required by law, court order, or regulatory authority (e.g., under Section 69 of IT Act).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale.</span>
                            </li>
                        </ul>
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-4">
                            <p className="text-green-800 text-sm font-medium">
                                We do not sell Your data to third parties.
                            </p>
                        </div>
                    </section>

                    {/* 4. Data Retention */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">4. Data Retention</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We retain personal data as long as necessary for the purposes outlined, or as required by law (e.g., 5 years for tax records under GST Act).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>You can request deletion, subject to legal obligations.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 5. Your Rights */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">5. Your Rights</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Access, correct, or delete Your data.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Opt-out of marketing communications.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Withdraw consent (may limit services).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>File complaints with Our Data Protection Officer (DPO) at <a href="mailto:privacy@uparwala.in" className="text-orange-600 hover:underline">privacy@uparwala.in</a>.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 6. Cookies and Tracking */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Cookie className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">6. Cookies and Tracking</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We use cookies for functionality, analytics, and advertising. You can manage preferences via browser settings.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Third-party services may place cookies; refer to their policies.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 7. Children's Privacy */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">7. Children's Privacy</h2>
                        </div>
                        <p className="text-slate-700">
                            The Platform is not for children under 13. We do not knowingly collect data from them.
                        </p>
                    </section>

                    {/* 8. International Transfers */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">8. International Transfers</h2>
                        </div>
                        <p className="text-slate-700">
                            Data may be transferred to servers outside India, with adequate safeguards (e.g., standard contractual clauses).
                        </p>
                    </section>

                    {/* 9. Security */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">9. Security</h2>
                        </div>
                        <p className="text-slate-700">
                            See Our <Link to="/security" className="text-orange-600 hover:underline font-medium">Security Policy</Link> for details. We implement reasonable measures but cannot guarantee absolute security.
                        </p>
                    </section>

                    {/* 10. Changes to Policy */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCw className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">10. Changes to Policy</h2>
                        </div>
                        <p className="text-slate-700">
                            We may update this Policy; notified via email or Platform notice.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Contact Our Data Protection Officer</h2>
                        </div>
                        <p className="text-slate-700">
                            For queries or to exercise Your rights, contact Our DPO at <a href="mailto:privacy@uparwala.in" className="text-orange-600 hover:underline font-medium">privacy@uparwala.in</a> or call <a href="tel:+91XXXXXXXXXX" className="text-orange-600 hover:underline font-medium">+91-XXXXXXXXXX</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
