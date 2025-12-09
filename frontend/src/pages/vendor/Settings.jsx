import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Loader2, Store, MapPin } from 'lucide-react';

const VendorSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        store_name: '',
        contact_number: '',
        bio: '',
        serviceable_pincodes: ''
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
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/vendors/profile/', profile);
            toast.success('Settings updated successfully');
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
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Store Settings</h2>
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

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default VendorSettings;
