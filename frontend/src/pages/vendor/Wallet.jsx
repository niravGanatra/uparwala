import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Wallet as WalletIcon, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const VendorWallet = () => {
    const [walletData, setWalletData] = useState({
        balance: 45231.50,
        totalEarnings: 125430.00,
        pendingPayouts: 12500.00,
        lastPayout: 32730.50
    });

    const transactions = [
        { id: 1, type: 'credit', amount: 2500, description: 'Order #156 - Payment received', date: '2025-11-28' },
        { id: 2, type: 'debit', amount: 5000, description: 'Payout to bank account', date: '2025-11-25' },
        { id: 3, type: 'credit', amount: 1800, description: 'Order #155 - Payment received', date: '2025-11-24' },
        { id: 4, type: 'credit', amount: 3200, description: 'Order #154 - Payment received', date: '2025-11-23' },
        { id: 5, type: 'debit', amount: 3000, description: 'Payout to bank account', date: '2025-11-20' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Wallet</h1>
                <p className="text-slate-600">Manage your earnings and payouts</p>
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <p className="text-sm text-slate-500 mt-1">Nov 25, 2025</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
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
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VendorWallet;
