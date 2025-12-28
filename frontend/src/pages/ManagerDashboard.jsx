import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        totalVendors: 0,
        pendingApplications: 0,
        approvedToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch vendor applications for stats
            const response = await api.get('/vendors/admin/applications/');
            const applications = response.data;

            setStats({
                totalVendors: applications.filter(a => a.status === 'approved').length,
                pendingApplications: applications.filter(a => a.status === 'pending').length,
                approvedToday: applications.filter(a => {
                    const today = new Date().toDateString();
                    return a.status === 'approved' && new Date(a.approved_at).toDateString() === today;
                }).length
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Manager Dashboard</h1>
                    <p className="text-slate-600">Welcome to vendor management panel</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Total Vendors
                            </CardTitle>
                            <Users className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalVendors}</div>
                            <p className="text-xs text-slate-500">Approved vendors</p>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700">
                                Pending Applications
                            </CardTitle>
                            <Clock className="h-5 w-5 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-700">{stats.pendingApplications}</div>
                            <p className="text-xs text-orange-600">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Approved Today
                            </CardTitle>
                            <UserCheck className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.approvedToday}</div>
                            <p className="text-xs text-slate-500">Applications approved</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/manager/vendor-applications"
                                className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <UserCheck className="h-5 w-5" />
                                Review Pending Applications
                                {stats.pendingApplications > 0 && (
                                    <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-sm font-bold">
                                        {stats.pendingApplications}
                                    </span>
                                )}
                            </Link>
                            <Link
                                to="/manager/vendors"
                                className="flex items-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <Users className="h-5 w-5" />
                                View All Vendors
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboard;
