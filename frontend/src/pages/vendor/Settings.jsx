import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Store, MapPin } from 'lucide-react';
import SpiritualLoader from '../../components/ui/spiritual-loader';

const VendorSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        store_name: '',
        contact_number: '',
        bio: '',
        serviceable_pincodes: '',
        // New fields
        is_food_vendor: false,
        food_license_number: '',
        bank_account_holder_name: '',
        bank_name: '',
        bank_branch: '',
        bank_account_number: '',
        bank_ifsc_code: '',
    });
    // Separate state for files to only send if changed
    const [files, setFiles] = useState({
        food_license_certificate: null,
        cancelled_cheque: null
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/vendors/profile/');
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files: fileInput } = e.target;
        if (type === 'file') {
            setFiles(prev => ({ ...prev, [name]: fileInput[0] }));
        } else {
            setProfile(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();

            // Append profile fields
            Object.keys(profile).forEach(key => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key]);
                }
            });

            // Append files if they exist
            if (files.food_license_certificate) {
                formData.append('food_license_certificate', files.food_license_certificate);
            }
            if (files.cancelled_cheque) {
                formData.append('cancelled_cheque', files.cancelled_cheque);
            }

            await api.patch('/vendors/profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Settings updated successfully');
            // Refresh profile to get updated file URLs if needed
            fetchProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <SpiritualLoader size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Vendor Settings</h1>
                        <p className="text-sm md:text-base text-slate-600">Manage your vendor profile and preferences</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5 hover:text-orange-500" /> General Information
                                </CardTitle>
                                <CardDescription>
                                    Basic details about your store visible to customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="store_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Store Name</label>
                                        <Input
                                            id="store_name"
                                            name="store_name"
                                            value={profile.store_name}
                                            onChange={handleChange}
                                            placeholder="My Awesome Store"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact_number" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contact Number</label>
                                        <Input
                                            id="contact_number"
                                            name="contact_number"
                                            value={profile.contact_number}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Store Bio</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about your store..."
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 hover:text-orange-500" /> Delivery Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure where you can deliver products.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="serviceable_pincodes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Serviceable Pincodes</label>
                                    <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm mb-2 border border-blue-200">
                                        <strong>Note:</strong> Leave empty to serve ALL locations available on the platform.
                                        If you specify pincodes, you will ONLY receive orders from these locations (provided they are also served by Uparwala globally).
                                    </div>
                                    <textarea
                                        id="serviceable_pincodes"
                                        name="serviceable_pincodes"
                                        value={profile.serviceable_pincodes || ''}
                                        onChange={handleChange}
                                        placeholder="e.g. 400001, 400002, 110001 (Comma separated)"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter valid 6-digit pincodes separated by commas.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compliance & Bank Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">FileText & Compliance</CardTitle>
                                <CardDescription>Legal and Banking information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Food License */}
                                <div className="space-y-4 border-b pb-4">
                                    <h3 className="font-semibold">Food License</h3>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_food_vendor"
                                            name="is_food_vendor"
                                            checked={profile.is_food_vendor}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="is_food_vendor" className="text-sm font-medium">
                                            I am selling food products
                                        </label>
                                    </div>
                                    {profile.is_food_vendor && (
                                        <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-orange-100">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">License Number</label>
                                                <Input
                                                    name="food_license_number"
                                                    value={profile.food_license_number || ''}
                                                    onChange={handleChange}
                                                    placeholder="FSSAI License No."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Update Certificate</label>
                                                <Input
                                                    type="file"
                                                    name="food_license_certificate"
                                                    onChange={handleChange}
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                />
                                                {profile.food_license_certificate && typeof profile.food_license_certificate === 'string' && (
                                                    <p className="text-xs text-green-600">Current file: {profile.food_license_certificate.split('/').pop()}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bank Details */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Bank Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Account Holder</label>
                                            <Input
                                                name="bank_account_holder_name"
                                                value={profile.bank_account_holder_name || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Bank Name</label>
                                            <Input
                                                name="bank_name"
                                                value={profile.bank_name || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Branch</label>
                                            <Input
                                                name="bank_branch"
                                                value={profile.bank_branch || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">IFSC Code</label>
                                            <Input
                                                name="bank_ifsc_code"
                                                value={profile.bank_ifsc_code || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Account Number</label>
                                            <Input
                                                name="bank_account_number"
                                                value={profile.bank_account_number || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Update Cheque/Passbook</label>
                                            <Input
                                                type="file"
                                                name="cancelled_cheque"
                                                onChange={handleChange}
                                                accept=".jpg,.jpeg,.png,.pdf"
                                            />
                                            {profile.cancelled_cheque && typeof profile.cancelled_cheque === 'string' && (
                                                <p className="text-xs text-green-600">Current file: {profile.cancelled_cheque.split('/').pop()}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" disabled={saving}>
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorSettings;
