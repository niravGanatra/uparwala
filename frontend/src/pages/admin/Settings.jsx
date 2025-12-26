import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Settings as SettingsIcon, Globe, Mail, CreditCard, Bell,
    Truck, Gift, LayoutGrid
} from 'lucide-react';
import api from '../../services/api';
import CODManager from '../../components/admin/settings/CODManager';
import GiftManager from '../../components/admin/settings/GiftManager';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [testEmailGroup, setTestEmailGroup] = useState('customer');

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'logistics', label: 'Logistics', icon: Truck },
        { id: 'addons', label: 'Add-ons', icon: Gift },
    ];
    const [testTemplate, setTestTemplate] = useState('welcome_email');

    const emailTemplates = {
        customer: [
            { id: 'welcome_email', name: 'Welcome Email' },
            { id: 'password_reset', name: 'Password Reset' },
            { id: 'order_confirmation', name: 'Order Confirmation' },
            { id: 'order_shipped', name: 'Order Shipped' },
            { id: 'order_out_for_delivery', name: 'Out for Delivery' },
            { id: 'order_delivered', name: 'Order Delivered' },
            { id: 'order_cancellation', name: 'Order Cancellation' },
            { id: 'payment_received', name: 'Payment Received' },
            { id: 'return_request_received', name: 'Return Request Received' },
            { id: 'refund_processed', name: 'Refund Processed' },
            { id: 'rate_and_review', name: 'Rate & Review' },
            { id: 'abandoned_cart', name: 'Abandoned Cart' },
            { id: 'back_in_stock', name: 'Back in Stock' },
        ],
        vendor: [
            { id: 'vendor_registration_received', name: 'Registration Received' },
            { id: 'vendor_account_approved', name: 'Account Approved' },
            { id: 'vendor_account_rejected', name: 'Account Rejected' },
            { id: 'vendor_new_order', name: 'New Order Alert' },
            { id: 'vendor_order_cancelled', name: 'Order Cancelled Alert' },
            { id: 'vendor_sla_warning', name: 'SLA Warning' },
            { id: 'vendor_product_status_update', name: 'Product Status Update' },
            { id: 'vendor_low_stock', name: 'Low Stock Alert' },
            { id: 'vendor_payout_processed', name: 'Payout Processed' },
            { id: 'vendor_commission_invoice', name: 'Commission Invoice' },
            { id: 'vendor_return_requested', name: 'Return Requested' },
            { id: 'vendor_rto_delivered', name: 'RTO Delivered' },
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">System Settings</h1>
                        <p className="text-sm md:text-base text-slate-600">Configure marketplace settings and preferences</p>
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

                            {/* Test Notifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Test Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Recipient Email</label>
                                            <Input
                                                id="test-email-recipient"
                                                placeholder="user@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Group</label>
                                            <select
                                                value={testEmailGroup}
                                                onChange={(e) => {
                                                    setTestEmailGroup(e.target.value);
                                                    setTestTemplate(emailTemplates[e.target.value][0].id);
                                                }}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-4"
                                            >
                                                <option value="customer">Customer Emails</option>
                                                <option value="vendor">Vendor Emails</option>
                                            </select>

                                            <label className="block text-sm font-medium mb-2">Template</label>
                                            <select
                                                id="test-email-template"
                                                value={testTemplate}
                                                onChange={(e) => setTestTemplate(e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {emailTemplates[testEmailGroup].map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            const email = document.getElementById('test-email-recipient').value;
                                            // const template = document.getElementById('test-email-template').value; // Use state instead
                                            const template = testTemplate;

                                            if (!email) {
                                                alert('Please enter an email');
                                                return;
                                            }
                                            try {
                                                const res = await api.post('/notifications/test-email/', {
                                                    email,
                                                    template,
                                                    sync: true
                                                });
                                                alert(`Test email (${template}) sent successfully!`);
                                            } catch (e) {
                                                const errData = e.response?.data || {};
                                                let msg = errData.error || 'Error sending test email';

                                                // Add config info to alert if available
                                                if (errData.config) {
                                                    const conf = errData.config;
                                                    msg += `\n\nDebug Info:\nHost: ${conf.host}:${conf.port}\nUser: ${conf.user}\nTLS: ${conf.use_tls}\nPassword Set: ${conf.password_configured}`;
                                                }
                                                alert('Failed: ' + msg);
                                            }
                                        }}
                                    >
                                        Send Test Email
                                    </Button>

                                    <div className="border-t pt-4 mt-4">
                                        <h3 className="text-sm font-medium mb-4">Test WhatsApp</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                                <Input
                                                    id="test-whatsapp-phone"
                                                    placeholder="+919876543210 (with country code)"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const phone = document.getElementById('test-whatsapp-phone').value;
                                                if (!phone) {
                                                    alert('Please enter a phone number');
                                                    return;
                                                }
                                                try {
                                                    const res = await api.post('/notifications/test-whatsapp/', {
                                                        phone
                                                    });
                                                    alert('Test WhatsApp message sent successfully!');
                                                } catch (e) {
                                                    const msg = e.response?.data?.error || 'Error sending test message';
                                                    alert('Failed: ' + msg);
                                                }
                                            }}
                                        >
                                            Send Test WhatsApp
                                        </Button>
                                    </div>
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
            </div>
        </div>
    );
};

export default AdminSettings;
