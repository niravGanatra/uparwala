import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorWalletPage = () => {
    const [walletStats, setWalletStats] = useState(null);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [statsRes, historyRes] = await Promise.all([
                api.get('/vendors/wallet/stats/'),
                api.get('/vendors/admin/payouts/history/?limit=50')
            ]);

            setWalletStats(statsRes.data);
            setPayoutHistory(historyRes.data.history || []);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            toast.error('Failed to load wallet information');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">Loading wallet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Wallet & Payouts</h1>
                <p className="text-slate-600">Track your earnings and payout history</p>
            </div>

            {/* Wallet Stats Cards */}
            {walletStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Available Balance</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₹{(walletStats.available_balance || 0).toFixed(2)}
                                    </p>
                                </div>
                                <Wallet className="h-12 w-12 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Pending Earnings</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        ₹{(walletStats.pending_earnings || 0).toFixed(2)}
                                    </p>
                                </div>
                                <Clock className="h-12 w-12 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Paid Out</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ₹{(walletStats.total_paid_out || 0).toFixed(2)}
                                    </p>
                                </div>
                                <CheckCircle className="h-12 w-12 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Lifetime Earnings</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        ₹{(walletStats.lifetime_earnings || 0).toFixed(2)}
                                    </p>
                                </div>
                                <TrendingUp className="h-12 w-12 text-purple-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Payout History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                    {payoutHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-slate-900">Date</th>
                                        <th className="pb-3 font-semibold text-slate-900">Amount</th>
                                        <th className="pb-3 font-semibold text-slate-900">Transaction ID</th>
                                        <th className="pb-3 font-semibold text-slate-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payoutHistory.map((payout) => (
                                        <tr key={payout.id} className="border-b last:border-0">
                                            <td className="py-4">
                                                {new Date(payout.payout_date).toLocaleString()}
                                            </td>
                                            <td className="py-4 font-semibold text-green-600">
                                                ₹{(payout.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 text-sm text-slate-600">
                                                {payout.transaction_id || 'N/A'}
                                            </td>
                                            <td className="py-4">
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-12 text-slate-500">No payout history yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VendorWalletPage;
