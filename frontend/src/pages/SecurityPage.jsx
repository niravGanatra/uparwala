import { Shield, Lock, CreditCard, User, Package, AlertTriangle, RefreshCw, Mail } from 'lucide-react';

const SecurityPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-10 h-10 text-orange-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Security Policy</h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        <strong>Last Updated:</strong> December 21, 2025
                    </p>
                </header>

                {/* Intro */}
                <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">
                        At Uparwala Traders LLP ("Company", "We", "Us", or "Our"), We prioritize the security of Our Platform, Uparwala.in, to protect Users, Vendors, and their data. This Security Policy outlines Our practices to ensure a safe and secure environment for buying and selling Hindu religious products and related food items. While We implement robust measures, security is a shared responsibility, and Users must also take precautions.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {/* 1. Data Security Measures */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">1. Data Security Measures</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Encryption:</strong> All sensitive data, including personal information and payment details, is transmitted using Secure Sockets Layer (SSL)/Transport Layer Security (TLS) encryption (at least TLS 1.2). This ensures data is protected during transit.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Access Controls:</strong> We use role-based access controls, multi-factor authentication (MFA) for administrative accounts, and regular audits to prevent unauthorized access to Our systems.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Firewalls and Intrusion Detection:</strong> Our servers are protected by firewalls, intrusion detection/prevention systems (IDS/IPS), and regular vulnerability scans to detect and mitigate threats.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Data Storage:</strong> Data is stored in secure, compliant data centers in India, adhering to standards like ISO 27001 and the Information Technology Act, 2000.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 2. Payment Security */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">2. Payment Security</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Payments are processed through PCI DSS-compliant third-party gateways (e.g., Razorpay, PayU). We do not store full credit/debit card details on Our servers; only tokenized information is retained for recurring transactions.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We support secure payment methods like UPI, net banking, and wallets, ensuring compliance with RBI guidelines.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Fraud Detection:</strong> We employ AI-based tools to monitor transactions for suspicious activity, such as unusual patterns or high-risk IP addresses.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 3. User Account Security */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">3. User Account Security</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Password Policies:</strong> Users must use strong passwords (minimum 8 characters, including uppercase, lowercase, numbers, and symbols). We encourage enabling MFA where available.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Session Management:</strong> Inactive sessions time out automatically, and We log suspicious login attempts.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Vendor Verification:</strong> Vendors undergo KYC (Know Your Customer) checks, including GSTIN validation and bank account verification, to prevent fraudulent listings.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 4. Vendor and Product Security */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">4. Vendor and Product Security</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Vendors must ensure Products are free from contaminants or hazards. For food items, compliance with FSSAI standards is mandatory, including secure packaging to prevent tampering.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We scan uploaded images and content for malware using automated tools.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>The Platform prohibits listings of hazardous materials; any violations lead to immediate removal and Account suspension.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 5. Incident Response and Reporting */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">5. Incident Response and Reporting</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>In case of a security breach, We follow an incident response plan compliant with the CERT-In directions under the IT Act. Affected Users will be notified within 72 hours, as required.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Users should report security vulnerabilities or incidents to <a href="mailto:security@uparwala.in" className="text-orange-600 hover:underline">security@uparwala.in</a>. We may offer bug bounties for responsible disclosures.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We conduct regular penetration testing and security audits by third-party experts.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 6. User Responsibilities */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">6. User Responsibilities</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Keep Your devices secure with updated antivirus software and avoid public Wi-Fi for sensitive transactions.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Do not share Account credentials or click on suspicious links.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Report any suspected fraud or unauthorized activity immediately.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 7. Compliance and Updates */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCw className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">7. Compliance and Updates</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>This Policy complies with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and other applicable laws.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We may update this Policy; changes will be posted here. Continued use constitutes acceptance.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
                        </div>
                        <p className="text-slate-700">
                            For queries, contact us at <a href="mailto:support@uparwala.in" className="text-orange-600 hover:underline font-medium">support@uparwala.in</a> or call <a href="tel:+91XXXXXXXXXX" className="text-orange-600 hover:underline font-medium">+91-XXXXXXXXXX</a>.
                        </p>
                    </section>

                    {/* Note */}
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                        <p className="text-amber-800 text-sm">
                            <strong>Note:</strong> While We strive for maximum security, no system is infallible. Users use the Platform at their own risk.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
