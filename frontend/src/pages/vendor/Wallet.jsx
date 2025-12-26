import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Wallet as WalletIcon, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../services/api';

const VendorWallet = () => {
    const [walletData, setWalletData] = useState({
        balance: 0,
        totalEarnings: 0,
        pendingPayouts: 0,
        lastPayout: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const response = await api.get('/vendors/wallet/stats/');
            setWalletData({
                balance: response.data.balance,
                totalEarnings: response.data.totalEarnings,
                pendingPayouts: response.data.pendingPayouts,
                lastPayout: response.data.lastPayout
            });
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            // toast.error('Failed to load wallet data'); // Optional: silent fail for dashboard
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Wallet</h1>
                        <p className="text-sm md:text-base text-slate-600">Manage your earnings and payouts</p>
                    </div>

                    {/* Wallet Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-full overflow-hidden">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-600">Available Balance</p>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <WalletIcon className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">₹{walletData.balance.toLocaleString()}</p>
                                <p className="text-sm text-green-600 mt-1">Ready for withdrawal</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">₹{walletData.totalEarnings.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">All time</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-600">Pending Payouts</p>
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">₹{walletData.pendingPayouts.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">Processing</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-600">Last Payout</p>
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <ArrowUpRight className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">₹{walletData.lastPayout.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">Latest Approved</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction History */}
                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-center text-slate-500 py-4">Loading transactions...</p>
                                ) : transactions.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No transactions found</p>
                                ) : (
                                    transactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                                                    }`}>
                                                    {transaction.type === 'credit' ? (
                                                        <ArrowDownRight className={`h-5 w-5 text-green-600`} />
                                                    ) : (
                                                        <ArrowUpRight className={`h-5 w-5 text-red-600`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{transaction.description}</p>
                                                    <p className="text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VendorWallet;
