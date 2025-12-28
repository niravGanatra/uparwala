import { Recycle, Leaf, Store, Users, ClipboardCheck, AlertTriangle, Mail } from 'lucide-react';

const EPRCompliancePage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Recycle className="w-10 h-10 text-green-600" />
                        <h1 className="text-4xl font-bold text-slate-900">EPR Compliance</h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        <strong>Last Updated:</strong> December 21, 2025
                    </p>
                </header>

                {/* Intro */}
                <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">
                        Uparwala Traders LLP ("Company", "We", "Us", or "Our") complies with Extended Producer Responsibility (EPR) under the Plastic Waste Management Rules, 2016 (as amended), Battery Waste Management Rules, 2022, and E-Waste (Management) Rules, 2022, administered by the Central Pollution Control Board (CPCB). As a multi-vendor marketplace for Hindu religious products and food items, We ensure EPR obligations for packaging and waste management.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {/* 1. Scope */}
                    <section className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Leaf className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">1. Scope</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>EPR applies to plastic packaging, batteries (if any in Products), and e-waste (e.g., electronic puja items).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>Food items for prasad may involve packaging waste; Vendors must comply with applicable regulations.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 2. Our Responsibilities as Marketplace */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <ClipboardCheck className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">2. Our Responsibilities as Marketplace</h2>
                        </div>
                        <div className="space-y-4 text-slate-700">
                            <div>
                                <p className="font-medium text-slate-800">Registration:</p>
                                <p>We are registered with CPCB as a Producer/Importer/Brand Owner (PIBO) under EPR guidelines.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Collection and Recycling:</p>
                                <p>We facilitate reverse logistics for post-consumer waste through authorized recyclers/producers.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Targets:</p>
                                <p>We meet annual EPR targets for plastic (e.g., recycling equivalent to packaging introduced) and report to CPCB via the EPR Portal.</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Awareness:</p>
                                <p>We educate Users and Vendors via Platform notices and emails about proper waste disposal and recycling practices.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Vendor Obligations */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Store className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">3. Vendor Obligations</h2>
                        </div>
                        <p className="text-slate-700 mb-4">Vendors must:</p>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Register as PIBO if applicable and provide EPR certificates.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Use recyclable packaging and label with recycling symbols.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Report packaging details (e.g., weight, type) for each listing.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>Participate in take-back programs for waste.</span>
                            </li>
                        </ul>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded mt-4">
                            <p className="text-amber-800 text-sm">
                                <strong>Note:</strong> Non-compliance may result in listing removal or Account suspension.
                            </p>
                        </div>
                    </section>

                    {/* 4. User Role */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">4. User Role</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>Buyers are encouraged to recycle packaging and return waste via Our collection points or partners.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>Report non-compliant packaging to <a href="mailto:epr@uparwala.in" className="text-green-600 hover:underline">epr@uparwala.in</a>.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 5. Compliance Mechanism */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <ClipboardCheck className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">5. Compliance Mechanism</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>We audit Vendors periodically and file annual returns with CPCB.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span><strong>Partnerships:</strong> We work with authorized recyclers and waste management partners for effective waste collection and recycling.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 6. Penalties and Updates */}
                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">6. Penalties and Updates</h2>
                        </div>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>Violations attract fines under EPR rules as per applicable regulations.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-600 font-bold">•</span>
                                <span>This policy may be updated per regulatory changes.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="bg-green-100 p-6 rounded-lg border border-green-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
                        </div>
                        <p className="text-slate-700">
                            For EPR-related queries, contact us at <a href="mailto:epr@uparwala.in" className="text-green-600 hover:underline font-medium">epr@uparwala.in</a> or call <a href="tel:+917990100510" className="text-green-600 hover:underline font-medium">+91 7990100510</a>.
                        </p>
                    </section>

                    {/* Recycling Symbol Info */}
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-green-800 text-sm">
                            <strong>♻️ Together for a Greener Future:</strong> By complying with EPR regulations, We contribute to reducing environmental pollution and promoting sustainable waste management practices.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EPRCompliancePage;
