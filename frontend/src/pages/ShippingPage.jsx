import { Truck, Clock, MapPin, Package, Bell, AlertTriangle } from 'lucide-react';

const ShippingPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Shipping & Delivery</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        We strive to deliver your sacred items safely, hygienically, and on time.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* Shipping Coverage */}
                    <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-bold text-slate-900">Shipping Coverage</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-2">
                            <li>We offer Pan-India delivery across most serviceable pin codes.</li>
                            <li>Delivery availability may vary based on product type and location.</li>
                        </ul>
                    </section>

                    {/* Timeline Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Processing Time */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6 text-orange-600" />
                                <h2 className="text-xl font-bold text-slate-900">Processing Time</h2>
                            </div>
                            <div className="prose prose-slate text-slate-700">
                                <p>Orders are usually processed within <strong>1–3 working days</strong> after confirmation.</p>
                                <p className="text-sm text-slate-500 mt-2">Custom kits or special arrangements may require additional processing time.</p>
                            </div>
                        </section>

                        {/* Delivery Timeline */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Truck className="w-6 h-6 text-orange-600" />
                                <h2 className="text-xl font-bold text-slate-900">Delivery Timeline</h2>
                            </div>
                            <div className="prose prose-slate text-slate-700">
                                <p>Standard delivery usually takes <strong>3–7 working days</strong>, depending on your location.</p>
                                <p className="text-sm text-slate-500 mt-2">Remote or non-metro areas may take slightly longer.</p>
                            </div>
                        </section>
                    </div>

                    {/* Packaging & Tracking */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-3 mb-3">
                                <Package className="w-6 h-6 text-orange-700" />
                                <h3 className="font-bold text-slate-900">Packaging</h3>
                            </div>
                            <p className="text-slate-700 text-sm">
                                All pooja samagri and religious items are carefully packed to maintain purity and safety during transit. Fragile items are packed with extra care.
                            </p>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                                <Bell className="w-6 h-6 text-blue-700" />
                                <h3 className="font-bold text-slate-900">Tracking</h3>
                            </div>
                            <p className="text-slate-700 text-sm">
                                Once shipped, you will receive tracking details via SMS/email to monitor your order status.
                            </p>
                        </section>
                    </div>

                    {/* Important Notes */}
                    <section className="border-t pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <h2 className="text-xl font-bold text-slate-900">Important Notes</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-3">
                                <span className="text-orange-500 text-xl">•</span>
                                <span>Delivery timelines may vary during festivals, public holidays, or unforeseen circumstances.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-orange-500 text-xl">•</span>
                                <span>Pandit ji arrangements and Vastu services are scheduled separately and are not part of physical shipping.</span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
