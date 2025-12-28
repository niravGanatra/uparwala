import { CreditCard, Smartphone, Globe, Wallet, Truck, CheckCircle, ShieldCheck } from 'lucide-react';

const PaymentsPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Payments</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        At Uparwala.in, we offer safe, secure, and convenient payment options to make your shopping experience smooth and worry-free.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* Accepted Payment Methods */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-8 h-8 text-orange-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Accepted Payment Methods</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <Globe className="w-6 h-6 text-blue-600" />
                                    <h3 className="font-semibold text-slate-900">Cards & Net Banking</h3>
                                </div>
                                <p className="text-slate-600">Debit Cards, Credit Cards, and Net Banking from all major banks.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <Smartphone className="w-6 h-6 text-green-600" />
                                    <h3 className="font-semibold text-slate-900">UPI</h3>
                                </div>
                                <p className="text-slate-600">Google Pay, PhonePe, Paytm, BHIM, and other UPI apps.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <Wallet className="w-6 h-6 text-purple-600" />
                                    <h3 className="font-semibold text-slate-900">Wallets</h3>
                                </div>
                                <p className="text-slate-600">Popular digital wallets (as applicable).</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <Truck className="w-6 h-6 text-orange-600" />
                                    <h3 className="font-semibold text-slate-900">Cash on Delivery</h3>
                                </div>
                                <p className="text-slate-600">Available on selected products & locations.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                            <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-green-800 text-sm">
                                All online payments are processed through secure and trusted payment gateways, ensuring complete safety of your personal and financial information.
                            </p>
                        </div>
                    </section>

                    {/* Payment Confirmation */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-8 h-8 text-orange-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Payment Confirmation</h2>
                        </div>
                        <div className="bg-white border-l-4 border-orange-500 pl-6 py-2 space-y-4">
                            <p className="text-slate-700">
                                <strong>Orders are confirmed</strong> once payment is successfully received.
                            </p>
                            <p className="text-slate-700">
                                You will receive an order confirmation message/email after placing your order.
                            </p>
                            <p className="text-slate-700">
                                In case of <strong>payment failure</strong>, the amount (if debited) is usually auto-reversed by your bank within 3–7 working days.
                            </p>
                            <p className="text-slate-700 italic">
                                For any payment-related assistance, our support team is always ready to help.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
