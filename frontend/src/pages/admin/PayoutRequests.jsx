import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { DollarSign, TrendingUp, Users, CheckCircle2, Clock, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PayoutRequests = () => {
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showTriggerDialog, setShowTriggerDialog] = useState(false);
    const [vendorToPayOut, setVendorToPayOut] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch pending payouts
            const pendingResponse = await api.get('/vendors/admin/payouts/calculate/');
            setPendingPayouts(pendingResponse.data.pending_payouts || []);
            setSummary(pendingResponse.data.summary || {});

            // Fetch payout history
            const historyResponse = await api.get('/vendors/admin/payouts/history/');
            setPayoutHistory(historyResponse.data.history || []);
        } catch (error) {
            console.error('Failed to fetch payout data:', error);
            toast.error('Failed to load payout data');
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerPayout = async () => {
        if (!vendorToPayOut) return;

        try {
            await api.post(`/vendors/admin/payouts/trigger/${vendorToPayOut.vendor_id}/`, {
                transaction_id: transactionId,
                notes: notes
            });

            toast.success(`Payout triggered for ${vendorToPayOut.vendor_name}`);
            setShowTriggerDialog(false);
            setVendorToPayOut(null);
            setTransactionId('');
            setNotes('');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to trigger payout:', error);
            toast.error(error.response?.data?.error || 'Failed to trigger payout');
        }
    };

    const openTriggerDialog = (vendor) => {
        setVendorToPayOut(vendor);
        setShowTriggerDialog(true);
    };

    const openDetailsModal = (payout) => {
        setSelectedPayout(payout);
        setShowDetailsModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Vendor Payouts</h1>
                        <p className="text-sm md:text-base text-slate-600">Manage vendor payouts based on delivered orders</p>
                    </div>

                    {/* Summary Cards */}
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Vendors Pending</p>
                                            <p className="text-2xl font-bold text-slate-900">{summary.total_vendors || 0}</p>
                                        </div>
                                        <Users className="h-12 w-12 text-blue-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Total Sales</p>
                                            <p className="text-2xl font-bold text-slate-900">₹{(summary.total_sales || 0).toFixed(2)}</p>
                                        </div>
                                        <TrendingUp className="h-12 w-12 text-green-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Platform Commission</p>
                                            <p className="text-2xl font-bold text-orange-600">₹{(summary.total_commission || 0).toFixed(2)}</p>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-orange-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Pending Payouts</p>
                                            <p className="text-2xl font-bold text-blue-600">₹{(summary.total_pending_payout || 0).toFixed(2)}</p>
                                        </div>
                                        <Clock className="h-12 w-12 text-blue-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {loading ? (
                        <p className="text-center py-8 text-slate-500">Loading...</p>
                    ) : (
                        <>
                            {/* Pending Payouts Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Pending Payouts ({pendingPayouts.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingPayouts.length === 0 ? (
                                        <p className="text-center py-8 text-slate-500">No pending payouts</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="border-b">
                                                    <tr className="text-left">
                                                        <th className="pb-3 font-semibold text-slate-900">Vendor</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Total Sales</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Commission</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Net Payout</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Items</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingPayouts.map((payout) => (
                                                        <tr key={payout.vendor_id} className="border-b last:border-0">
                                                            <td className="py-4">
                                                                <div>
                                                                    <div className="font-medium text-slate-900">{payout.vendor_name}</div>
                                                                    <div className="text-sm text-slate-500">{payout.vendor_email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 font-semibold">₹{payout.total_sales.toFixed(2)}</td>
                                                            <td className="py-4 text-orange-600 font-semibold">₹{payout.total_commission.toFixed(2)}</td>
                                                            <td className="py-4 text-green-600 font-bold text-lg">₹{payout.net_payout.toFixed(2)}</td>
                                                            <td className="py-4">{payout.order_items.length} items</td>
                                                            <td className="py-4">
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => openDetailsModal(payout)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => openTriggerDialog(payout)}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        Trigger Payout
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payout History Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Payout History ({payoutHistory.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {payoutHistory.length === 0 ? (
                                        <p className="text-center py-8 text-slate-500">No payout history</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="border-b">
                                                    <tr className="text-left">
                                                        <th className="pb-3 font-semibold text-slate-900">Vendor</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Amount Paid</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Date</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Transaction ID</th>
                                                        <th className="pb-3 font-semibold text-slate-900">Approved By</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payoutHistory.map((payout) => (
                                                        <tr key={payout.id} className="border-b last:border-0">
                                                            <td className="py-4">
                                                                <div>
                                                                    <div className="font-medium text-slate-900">{payout.vendor_name}</div>
                                                                    <div className="text-sm text-slate-500">{payout.vendor_email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 font-semibold text-green-600">₹{payout.amount.toFixed(2)}</td>
                                                            <td className="py-4">{new Date(payout.payout_date).toLocaleDateString()}</td>
                                                            <td className="py-4 text-sm text-slate-600">{payout.transaction_id || 'N/A'}</td>
                                                            <td className="py-4 text-sm text-slate-600">{payout.approved_by}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Details Modal */}
                    <Modal
                        isOpen={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        title={`Payout Details - ${selectedPayout?.vendor_name}`}
                        size="lg"
                    >
                        {selectedPayout && (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Sales</p>
                                        <p className="text-lg font-semibold">₹{selectedPayout.total_sales.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Commission</p>
                                        <p className="text-lg font-semibold text-orange-600">₹{selectedPayout.total_commission.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Net Payout</p>
                                        <p className="text-lg font-bold text-green-600">₹{selectedPayout.net_payout.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Category Breakdown */}
                                <div>
                                    <h3 className="font-semibold mb-3">Commission by Category</h3>
                                    <div className="space-y-2">
                                        {Object.entries(selectedPayout.category_breakdown || {}).map(([category, data]) => (
                                            <div key={category} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                                <div>
                                                    <p className="font-medium">{category}</p>
                                                    <p className="text-sm text-slate-600">Rate: {data.commission_rate}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{data.sales.toFixed(2)}</p>
                                                    <p className="text-sm text-orange-600">Commission: ₹{data.commission.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold mb-3">Order Items ({selectedPayout.order_items.length})</h3>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {selectedPayout.order_items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-slate-600">
                                                        Order #{item.order_id} • Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{item.total.toFixed(2)}</p>
                                                    <p className="text-sm text-slate-600">Payout: ₹{item.payout.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Trigger Payout Dialog */}
                    <Modal
                        isOpen={showTriggerDialog}
                        onClose={() => {
                            setShowTriggerDialog(false);
                            setVendorToPayOut(null);
                            setTransactionId('');
                            setNotes('');
                        }}
                        title="Trigger Payout"
                    >
                        {vendorToPayOut && (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">Vendor</p>
                                    <p className="font-semibold">{vendorToPayOut.vendor_name}</p>
                                    <p className="text-sm text-slate-600 mt-2">Payout Amount</p>
                                    <p className="text-2xl font-bold text-green-600">₹{vendorToPayOut.net_payout.toFixed(2)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Transaction ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter transaction/reference ID"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Add any notes..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleTriggerPayout}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        Confirm Payout
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowTriggerDialog(false);
                                            setVendorToPayOut(null);
                                            setTransactionId('');
                                            setNotes('');
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default PayoutRequests;
