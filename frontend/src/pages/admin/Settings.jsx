import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Settings as SettingsIcon, Globe, Mail, CreditCard, Bell,
    Truck, Gift, LayoutGrid
} from 'lucide-react';
import CODManager from '../../components/admin/settings/CODManager';
import GiftManager from '../../components/admin/settings/GiftManager';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'logistics', label: 'Logistics', icon: Truck },
        { id: 'addons', label: 'Store Add-ons', icon: LayoutGrid },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">System Settings</h1>
                <p className="text-slate-600">Configure marketplace settings and preferences</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow'
                                : 'text-slate-500 hover:text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && (
                <div className="grid gap-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                General Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Site Name</label>
                                <Input defaultValue="Uparwala" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Site Description</label>
                                <Input defaultValue="Hindu Religious Items Marketplace" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Contact Email</label>
                                <Input type="email" defaultValue="admin@uparwala.com" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    {/* Email Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                                <Input placeholder="smtp.example.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">SMTP Port</label>
                                    <Input placeholder="587" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">SMTP Username</label>
                                    <Input placeholder="username" />
                                </div>
                            </div>
                            <Button>Save Email Settings</Button>
                        </CardContent>
                    </Card>

                    {/* Payment Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Gateway Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Stripe Public Key</label>
                                <Input placeholder="pk_test_..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
                                <Input type="password" placeholder="sk_test_..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Razorpay Key ID</label>
                                <Input placeholder="rzp_test_..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Razorpay Key Secret</label>
                                <Input type="password" placeholder="..." />
                            </div>
                            <Button>Save Payment Settings</Button>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Order Notifications</div>
                                    <div className="text-sm text-slate-500">Receive notifications for new orders</div>
                                </div>
                                <input type="checkbox" defaultChecked className="w-4 h-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Vendor Registration</div>
                                    <div className="text-sm text-slate-500">Notify when new vendors register</div>
                                </div>
                                <input type="checkbox" defaultChecked className="w-4 h-4" />
                            </div>
                            <Button>Save Notification Settings</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'logistics' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Logistics Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CODManager />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'addons' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5" />
                                Store Add-ons
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GiftManager />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
