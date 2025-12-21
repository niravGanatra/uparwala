import { FileText, User, Shield, ShoppingBag, Scale, Lock, RefreshCw, AlertTriangle, Gavel, Mail } from 'lucide-react';

const TermsOfUsePage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-10 h-10 text-orange-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Terms of Use</h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        <strong>Last Updated:</strong> December 21, 2025
                    </p>
                </header>

                {/* Intro */}
                <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">
                        Welcome to Uparwala.in ("Platform" or "Website"), an online marketplace operated by Uparwala Traders LLP ("Company", "We", "Us", or "Our"), a limited liability partnership registered under the Limited Liability Partnership Act, 2008, with its registered office at 11, Kohinoor Society, Vijay Nagar Road, Naranpura, Ahmedabad, Gujarat, India - 380013.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        The Platform facilitates the sale and purchase of Hindu religious products, including but not limited to idols, puja items, books, clothing, and accessories, as well as certain food items suitable for prasad (collectively, "Products"). The Platform operates as a multi-vendor marketplace, where registered sellers ("Vendors") can list and sell their Products to buyers ("Buyers" or "Users").
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        By accessing or using the Platform, including browsing, registering an account, listing Products (as a Vendor), purchasing Products (as a Buyer), or otherwise interacting with Our services, You ("User", "You", or "Your") agree to be bound by these Terms of Use ("Terms"). If You do not agree with these Terms, please do not access or use the Platform.
                    </p>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mt-4">
                        <p className="text-amber-800 text-sm">
                            These Terms constitute a legally binding agreement between You and the Company. We reserve the right to modify these Terms at any time, and such modifications will be effective upon posting on the Platform. Your continued use of the Platform after any changes constitutes Your acceptance of the revised Terms.
                        </p>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {/* 1. Eligibility */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">1. Eligibility</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>You must be at least 18 years old or the age of majority in Your jurisdiction to use the Platform. If You are under 18, You may use the Platform only under the supervision of a parent or legal guardian who agrees to be bound by these Terms.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>By using the Platform, You represent and warrant that You have the full right, power, and authority to enter into these Terms and that You are not prohibited from doing so under any applicable laws.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Vendors must be legally registered entities or individuals authorized to sell Products in India, complying with all applicable laws, including but not limited to the Goods and Services Tax (GST) Act, 2017, Food Safety and Standards Act, 2006 (for food items), and Consumer Protection Act, 2019.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 2. Account Registration and Security */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">2. Account Registration and Security</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>To access certain features, such as buying, selling, or posting reviews, You must create an account ("Account") by providing accurate information, including Your name, email address, mobile number, and other details as requested.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>You are responsible for maintaining the confidentiality of Your Account credentials (username, password, etc.) and for all activities that occur under Your Account. You agree to notify Us immediately of any unauthorized use or security breach.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We reserve the right to suspend or terminate Your Account if We suspect any violation of these Terms, fraudulent activity, or for any other reason deemed necessary to protect the Platform or other Users.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Vendors must provide additional information, such as business registration details, GSTIN, bank account details, and proof of compliance with relevant laws, during registration.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 3. User Conduct and Prohibited Activities */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">3. User Conduct and Prohibited Activities</h2>
                        </div>
                        <p className="text-slate-700 mb-4">
                            You agree to use the Platform only for lawful purposes and in compliance with all applicable laws, including but not limited to the Information Technology Act, 2000, Indian Penal Code, 1860, and rules thereunder.
                        </p>
                        <p className="font-medium text-slate-800 mb-2">As a User, You shall not:</p>
                        <ul className="space-y-2 text-slate-700 mb-4">
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, obscene, defamatory, invasive of privacy, or promotes hatred, violence, or discrimination.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Infringe on intellectual property rights, including copyrights, trademarks, or patents of third parties.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Engage in spamming, phishing, or distributing malware.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Misrepresent Your identity or affiliation.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Interfere with the Platform's functionality, such as through hacking, denial-of-service attacks, or unauthorized access.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Sell or list counterfeit, illegal, or prohibited items.</span>
                            </li>
                        </ul>
                        <p className="font-medium text-slate-800 mb-2">Vendors specifically agree not to:</p>
                        <ul className="space-y-2 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>List Products that do not comply with quality standards, labeling requirements, or safety norms under applicable laws.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Engage in price manipulation, false advertising, or misleading descriptions.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-500 font-bold">✗</span>
                                <span>Use the Platform to promote non-Hindu religious products or items that could offend Hindu religious sentiments.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 4. Product Listings and Transactions */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingBag className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">4. Product Listings and Transactions</h2>
                        </div>
                        <div className="space-y-4 text-slate-700">
                            <div>
                                <p className="font-medium text-slate-800">Vendor Responsibilities:</p>
                                <p>Vendors are solely responsible for the accuracy of Product listings, including descriptions, images, prices, specifications, availability, and compliance with laws. Vendors must ensure that all Products are genuine, safe, and appropriately packaged. For food items, Vendors must comply with FSSAI regulations.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Buyer Responsibilities:</p>
                                <p>Buyers must review Product details carefully before purchase. All sales are final unless otherwise specified in the return policy.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Platform's Role:</p>
                                <p>The Company acts solely as an intermediary facilitating transactions between Vendors and Buyers. We do not own, control, or endorse any Products listed by Vendors. We are not responsible for the quality, safety, legality, or delivery of Products.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Payments:</p>
                                <p>All transactions are processed through third-party payment gateways. You agree to comply with their terms. The Company is not liable for any payment failures, fraud, or disputes related to payments.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Taxes and Fees:</p>
                                <p>Vendors are responsible for collecting and remitting applicable taxes (e.g., GST). The Company may charge platform fees, commissions, or other charges as notified.</p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Intellectual Property */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">5. Intellectual Property</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>The Platform, including its design, logos, trademarks (e.g., "Uparwala.in"), content, and software, is owned by or licensed to the Company and protected under Indian and international intellectual property laws.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Users grant the Company a non-exclusive, royalty-free license to use, reproduce, and display any content uploaded (e.g., Product images, reviews) for Platform operations.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Vendors represent that they have all necessary rights to list and sell Products without infringing third-party IP.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 6. Privacy and Data Protection */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">6. Privacy and Data Protection</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Your use of the Platform is subject to Our Privacy Policy, which is incorporated herein by reference.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We collect and process personal data in compliance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (if applicable).</span>
                            </li>
                        </ul>
                    </section>

                    {/* 7. Returns, Refunds, and Cancellations */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCw className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">7. Returns, Refunds, and Cancellations</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Returns are accepted only for damaged, defective, or incorrect Products, subject to verification. Food items are non-returnable due to hygiene reasons, except in cases of contamination.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Refunds will be processed to the original payment method within 7-10 business days after approval.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Cancellations by Buyers are allowed within 24 hours of order placement, unless the order has shipped.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Vendors must adhere to this policy; failure may result in Account suspension.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 8. Limitation of Liability */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">8. Limitation of Liability</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>The Platform is provided "as is" without warranties of any kind. The Company disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>In no event shall the Company, its partners, employees, or affiliates be liable for any indirect, incidental, special, or consequential damages arising from Your use of the Platform.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Our total liability shall not exceed the amount paid by You for the specific transaction in question.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>The Company is not liable for any acts or omissions of Vendors, including Product defects, delays, or non-delivery.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 9. Indemnification */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">9. Indemnification</h2>
                        </div>
                        <p className="text-slate-700">
                            You agree to indemnify, defend, and hold harmless the Company, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses arising from Your violation of these Terms, misuse of the Platform, or infringement of third-party rights.
                        </p>
                    </section>

                    {/* 10. Governing Law and Dispute Resolution */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Gavel className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">10. Governing Law and Dispute Resolution</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>These Terms shall be governed by the laws of India, without regard to conflict of laws principles.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Any disputes arising from or relating to these Terms or the Platform shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996, by a sole arbitrator appointed by the Company. The venue of arbitration shall be Ahmedabad, and proceedings shall be in English.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Subject to arbitration, the courts in Ahmedabad shall have exclusive jurisdiction.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 11. Termination */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">11. Termination</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>We may terminate these Terms or Your access to the Platform at any time, with or without cause, without prior notice.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span>Upon termination, all rights granted to You cease, and You must destroy any downloaded materials.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 12. Miscellaneous */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">12. Miscellaneous</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Force Majeure:</strong> The Company shall not be liable for delays or failures due to events beyond Our control, such as natural disasters, wars, or pandemics.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Severability:</strong> If any provision is held invalid, the remainder shall remain in effect.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-600 font-bold">•</span>
                                <span><strong>Entire Agreement:</strong> These Terms, along with Our Privacy Policy and other linked policies, constitute the entire agreement.</span>
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
                            For questions, contact us at <a href="mailto:support@uparwala.in" className="text-orange-600 hover:underline font-medium">support@uparwala.in</a> or call <a href="tel:+91XXXXXXXXXX" className="text-orange-600 hover:underline font-medium">+91-XXXXXXXXXX</a>.
                        </p>
                    </section>

                    {/* Acknowledgment */}
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-green-800 text-sm">
                            <strong>By using the Platform, You acknowledge that You have read, understood, and agree to these Terms.</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
