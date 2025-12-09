import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        preferred_language: 'en',
        preferred_currency: 'INR',
        preferred_categories: []
    });

    useEffect(() => {
        fetchProfile();
        fetchCategories();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile/');
            setProfile(response.data);
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/users/profile/', profile);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        setProfile(prev => ({
            ...prev,
            preferred_categories: prev.preferred_categories.includes(categoryId)
                ? prev.preferred_categories.filter(id => id !== categoryId)
                : [...prev.preferred_categories, categoryId]
        }));
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <User className="w-8 h-8" />
                Profile Settings
            </h1>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                value={profile.first_name}
                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                value={profile.last_name}
                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={profile.date_of_birth || ''}
                                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <select
                                value={profile.gender || ''}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Preferred Language</label>
                            <select
                                value={profile.preferred_language}
                                onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="mr">Marathi</option>
                                <option value="gu">Gujarati</option>
                                <option value="ta">Tamil</option>
                                <option value="te">Telugu</option>
                                <option value="kn">Kannada</option>
                                <option value="ml">Malayalam</option>
                                <option value="bn">Bengali</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Preferred Currency</label>
                            <select
                                value={profile.preferred_currency}
                                onChange={(e) => setProfile({ ...profile, preferred_currency: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Preferred Categories */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Preferred Categories</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Select categories you're interested in for personalized recommendations
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${profile.preferred_categories.includes(category.id)
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={profile.preferred_categories.includes(category.id)}
                                    onChange={() => handleCategoryToggle(category.id)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">{category.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;
