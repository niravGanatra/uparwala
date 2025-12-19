import React from 'react';
import { Shield, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 px-8 py-10 text-white text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <h1 className="text-3xl font-bold mb-2">Return, Cancellation & Refund Policy</h1>
                        <p className="text-slate-400 text-lg">(India – Marketplace Model)</p>
                    </div>

                    <div className="p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">

                        {/* 1. Platform Role */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">1</span>
                                Platform Role & Applicability
                            </h2>
                            <p>
                                <strong>www.uparwala.in</strong> operates as an online marketplace under Indian law and does not own, manufacture, store, or sell products directly.
                                Products are sold by independent third-party sellers, including individual artisans, priests, temples, and shopkeepers.
                                This policy governs all transactions made on the platform and is binding on buyers upon order placement.
                            </p>
                        </section>

                        {/* 2. Mandatory Acceptance */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">2</span>
                                Mandatory Acceptance
                            </h2>
                            <p>
                                By placing an order on the platform, the buyer confirms that they have read, understood, and expressly agreed to this Return, Cancellation & Refund Policy.
                            </p>
                        </section>

                        {/* 3. Policy Rationale */}
                        <section className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                3. Policy Rationale (Religious Products)
                            </h2>
                            <p className="text-amber-800">
                                Due to the religious, sacred, personal, consumable, hygiene-sensitive, and faith-based nature of Hindu religious products,
                                returns, cancellations, and refunds are limited and subject to strict conditions.
                            </p>
                        </section>

                        {/* 4. Cancellation Policy */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">4</span>
                                Cancellation Policy
                            </h2>

                            <div className="mb-6">
                                <h3 className="font-bold text-slate-900 mb-2">4.1 Buyer-Initiated Cancellation</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Cancellation is permitted only before dispatch of the product.</li>
                                    <li>Once an order is packed, customized, energized, blessed, consecrated, or dispatched, it cannot be cancelled.</li>
                                    <li>Certain categories are non-cancellable immediately upon order confirmation, including but not limited to:
                                        <ul className="list-circle pl-5 mt-2 space-y-1 text-sm text-slate-600">
                                            <li>Puja samagri</li>
                                            <li>Idols and murtis</li>
                                            <li>Energized, consecrated, or mantra-activated items</li>
                                            <li>Customized or made-to-order products</li>
                                            <li>Consumable and perishable items</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">4.2 Seller / Marketplace Cancellation</h3>
                                <p className="mb-2">An order may be cancelled due to:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Seller stock unavailability</li>
                                    <li>Incorrect listing or pricing error</li>
                                    <li>Incomplete or incorrect buyer details</li>
                                    <li>Force majeure events</li>
                                </ul>
                                <p className="mt-2 text-sm italic">In such cases, refunds (if applicable) will be processed as per Clause 7.</p>
                            </div>
                        </section>

                        {/* 5. Return Policy */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">5</span>
                                Return Policy
                            </h2>

                            <div className="mb-6">
                                <h3 className="font-bold text-red-600 mb-2">5.1 Non-Returnable Products</h3>
                                <p className="mb-3 text-sm">The following are strictly non-returnable as permitted under Indian consumer law:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Religious idols, statues, and murtis</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Puja samagri (flowers, agarbatti, diyas, oils, etc.)</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Yantras, malas, rudraksha, gemstones</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Energized, blessed, or consecrated items</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Consumable or perishable goods</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Customized or personalized items</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div> Used, worn, or altered products</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-green-600 mb-2">5.2 Returnable Products (Limited Exception)</h3>
                                <p className="mb-2">Returns will be accepted only in the following cases:</p>
                                <ol className="list-decimal pl-5 space-y-1 mb-4">
                                    <li>Product received is physically damaged, or</li>
                                    <li>Product received is materially different from what was ordered</li>
                                </ol>
                                <div className="bg-slate-50 p-4 rounded-lg text-sm">
                                    <strong>Conditions:</strong>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Return request must be raised within 48 hours of delivery</li>
                                        <li>Product must be unused, unopened, and in original packaging</li>
                                        <li>Clear photo/video evidence is mandatory</li>
                                        <li>Seller verification and approval is required</li>
                                        <li>Seller’s decision shall be final</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 6. No Return for Faith */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">6</span>
                                No Return or Refund for Faith-Based Reasons
                            </h2>
                            <p className="mb-2">Returns or refunds will not be provided for:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Lack of expected spiritual or religious results</li>
                                <li>Personal beliefs, faith outcomes, or dissatisfaction</li>
                                <li>Change of mind or personal preference</li>
                                <li>Inability or unwillingness to perform rituals</li>
                            </ul>
                        </section>

                        {/* 7. Refund Policy */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">7</span>
                                Refund Policy
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900">7.1 Refund Eligibility</h3>
                                    <p className="text-sm text-slate-600">Refunds are issued only if cancellation is approved before dispatch, or return is approved under Clause 5.2.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">7.2 Refund Method & Timeline</h3>
                                    <ul className="list-disc pl-5 text-sm text-slate-600 mt-1">
                                        <li>Refunds processed to original payment method</li>
                                        <li>Timeline: 7–14 business days from approval</li>
                                        <li>Non-refundable charges: Shipping fees, COD charges, Convenience/Platform fees</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">7.3 Partial Refunds</h3>
                                    <p className="text-sm text-slate-600">May be issued if accessories are missing, packaging is damaged, or signs of usage are found.</p>
                                </div>
                            </div>
                        </section>

                        {/* 8. Replacement Policy */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">8</span>
                                Replacement Policy
                            </h2>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Replacement may be offered at the seller’s discretion instead of a refund</li>
                                <li>Subject to product availability</li>
                                <li>Only one replacement request is allowed per order</li>
                            </ul>
                        </section>

                        {/* 9. Inspection & Abuse */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">9</span>
                                Inspection & Abuse Prevention
                            </h2>
                            <p className="text-sm">Sellers reserve the right to inspect returned products, reject returns not meeting policy conditions, and deny refunds in cases of misuse, fraud, or policy abuse.</p>
                        </section>

                        {/* 10. Limitation of Liability */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">10</span>
                                Limitation of Marketplace Liability
                            </h2>
                            <p className="mb-2 text-sm">Uparwala shall not be liable for:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Spiritual interpretations or religious outcomes</li>
                                <li>Seller product quality beyond facilitation obligations</li>
                                <li>Indirect, incidental, or consequential damages</li>
                                <li>Delays caused by logistics partners or force majeure</li>
                            </ul>
                        </section>

                        {/* 11. Governing Law */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm">11</span>
                                Governing Law & Jurisdiction
                            </h2>
                            <p className="text-sm">This policy shall be governed by the laws of India, and courts at Navi Mumbai, Maharashtra shall have exclusive jurisdiction.</p>
                        </section>

                        <div className="bg-slate-100 p-6 rounded-xl text-center text-sm text-slate-500 mt-8">
                            Last Updated: December 2025
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
