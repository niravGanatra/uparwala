import { HelpCircle, ShoppingCart, Store, Shield, AlertCircle, Package, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
            >
                <span className="font-medium text-slate-900">{question}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="px-4 pb-4 text-slate-700 bg-slate-50">
                    {children}
                </div>
            )}
        </div>
    );
};

const FAQPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <header className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <HelpCircle className="w-10 h-10 text-orange-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Frequently Asked Questions</h1>
                    </div>
                    <p className="text-slate-600">
                        Find answers to common questions about Uparwala.in
                    </p>
                </header>

                {/* FAQ Sections */}
                <div className="space-y-8">
                    {/* General */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <HelpCircle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">General</h2>
                        </div>
                        <div className="space-y-3">
                            <FAQItem question="What is Uparwala.in?">
                                <p>Uparwala.in is an online marketplace for Hindu religious products like idols, puja samagri, books, and prasad food items, operated by Uparwala Traders LLP. It's a platform where Vendors sell to Buyers.</p>
                            </FAQItem>
                            <FAQItem question="How do I register?">
                                <p>Click "Sign Up" and provide Your details. Vendors need additional business information including GSTIN, PAN, and bank account details.</p>
                            </FAQItem>
                            <FAQItem question="Is the Platform safe?">
                                <p>Yes, We use encryption and fraud detection to protect Your data and transactions. See our <Link to="/security" className="text-orange-600 hover:underline">Security Policy</Link> for more details.</p>
                            </FAQItem>
                        </div>
                    </section>

                    {/* Buying */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingCart className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Buying</h2>
                        </div>
                        <div className="space-y-3">
                            <FAQItem question="How do I place an order?">
                                <p>Search for Products, add them to your cart, proceed to checkout, and pay via our secure payment gateways.</p>
                            </FAQItem>
                            <FAQItem question="What payment methods are accepted?">
                                <p>We accept UPI, credit/debit cards, net banking, and digital wallets through our secure payment partners.</p>
                            </FAQItem>
                            <FAQItem question="Can I return Products?">
                                <p>Yes, returns are accepted for defective or damaged products within 7 days. Food items are non-returnable except in cases of safety issues or contamination. See our <Link to="/terms-of-use" className="text-orange-600 hover:underline">Terms of Use</Link> for the complete policy.</p>
                            </FAQItem>
                            <FAQItem question="What if my order is delayed?">
                                <p>You can track your order via the Platform in your Orders section. If there are issues, contact our support team or file a grievance through the Grievance Redressal process.</p>
                            </FAQItem>
                        </div>
                    </section>

                    {/* Selling (Vendors) */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Store className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Selling (Vendors)</h2>
                        </div>
                        <div className="space-y-3">
                            <FAQItem question="How do I become a Vendor?">
                                <p>Register on the Platform, submit your KYC documents (GSTIN, PAN, bank details), and wait for approval from our team. Once approved, you can start listing your products.</p>
                            </FAQItem>
                            <FAQItem question="What fees do You charge?">
                                <p>We charge a commission on each sale. Detailed fee structure is provided in the Vendor agreement during registration.</p>
                            </FAQItem>
                            <FAQItem question="Must I comply with laws?">
                                <p>Yes, Vendors must comply with all applicable laws including GST regulations, FSSAI standards for food items, and EPR (Extended Producer Responsibility) for packaging.</p>
                            </FAQItem>
                        </div>
                    </section>

                    {/* Privacy and Security */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Privacy and Security</h2>
                        </div>
                        <div className="space-y-3">
                            <FAQItem question="How is my data protected?">
                                <p>We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits. See our <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link> and <Link to="/security" className="text-orange-600 hover:underline">Security Policy</Link> for details.</p>
                            </FAQItem>
                            <FAQItem question="Do You share my data?">
                                <p>We only share your data with Vendors for order fulfillment and with service providers for platform operations. We never sell your personal data to third parties.</p>
                            </FAQItem>
                        </div>
                    </section>

                    {/* Grievances */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Grievances</h2>
                        </div>
                        <div className="space-y-3">
                            <FAQItem question="How do I file a complaint?">
                                <p>Email our Grievance Officer with your order details and description of the issue. We aim to resolve all grievances within the timeframe specified in our Grievance Redressal policy.</p>
                            </FAQItem>
                            <FAQItem question="What is EPR?">
                                <p>EPR stands for Extended Producer Responsibility. It's a regulation for waste management where producers/sellers are responsible for the environmental impact of their packaging. See our EPR Compliance page for details.</p>
                            </FAQItem>
                        </div>
                    </section>

                    {/* Other */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Other</h2>
                        </div>
                        <div className="space-y-3">
                            <FAQItem question="Are Products authentic?">
                                <p>Vendors are required to ensure the authenticity of their products. We monitor listings but ultimately the Vendor is responsible for product authenticity and quality.</p>
                            </FAQItem>
                            <FAQItem question="Can I sell non-Hindu items?">
                                <p>No, our Platform is specifically for Hindu religious products and prasad food items only. Non-Hindu religious products are not permitted.</p>
                            </FAQItem>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Still Have Questions?</h2>
                        </div>
                        <p className="text-slate-700">
                            For more help, contact us at <a href="mailto:support@uparwala.in" className="text-orange-600 hover:underline font-medium">support@uparwala.in</a> or call <a href="tel:+91XXXXXXXXXX" className="text-orange-600 hover:underline font-medium">+91-XXXXXXXXXX</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
