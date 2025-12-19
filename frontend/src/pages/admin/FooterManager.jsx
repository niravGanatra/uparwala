import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FooterManager = () => {
    const [sections, setSections] = useState([]);
    const [links, setLinks] = useState([]);
    const [socialMedia, setSocialMedia] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [editingLink, setEditingLink] = useState(null);
    const [editingSocial, setEditingSocial] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [sectionsRes, linksRes, socialRes, settingsRes] = await Promise.all([
                api.get('/products/admin/footer-sections/'),
                api.get('/products/admin/footer-links/'),
                api.get('/products/admin/footer-social/'),
                api.get('/products/admin/footer-settings/')
            ]);
            setSections(sectionsRes.data);
            setLinks(linksRes.data);
            setSocialMedia(socialRes.data);
            setSettings(settingsRes.data[0] || null);
        } catch (error) {
            console.error('Failed to fetch footer data:', error);
            toast.error('Failed to load footer data');
        } finally {
            setLoading(false);
        }
    };

    // Section CRUD
    const handleSaveSection = async () => {
        try {
            if (editingSection.id) {
                await api.put(`/products/admin/footer-sections/${editingSection.id}/`, editingSection);
                toast.success('Section updated');
            } else {
                await api.post('/products/admin/footer-sections/', editingSection);
                toast.success('Section created');
            }
            setEditingSection(null);
            fetchAllData();
        } catch (error) {
            toast.error('Failed to save section');
        }
    };

    const handleDeleteSection = async (id) => {
        if (!confirm('Delete this section? All links in it will also be deleted.')) return;
        try {
            await api.delete(`/products/admin/footer-sections/${id}/`);
            toast.success('Section deleted');
            fetchAllData();
        } catch (error) {
            toast.error('Failed to delete section');
        }
    };

    // Link CRUD
    const handleSaveLink = async () => {
        try {
            if (editingLink.id) {
                await api.put(`/products/admin/footer-links/${editingLink.id}/`, editingLink);
                toast.success('Link updated');
            } else {
                await api.post('/products/admin/footer-links/', editingLink);
                toast.success('Link created');
            }
            setEditingLink(null);
            fetchAllData();
        } catch (error) {
            toast.error('Failed to save link');
        }
    };

    const handleDeleteLink = async (id) => {
        if (!confirm('Delete this link?')) return;
        try {
            await api.delete(`/products/admin/footer-links/${id}/`);
            toast.success('Link deleted');
            fetchAllData();
        } catch (error) {
            toast.error('Failed to delete link');
        }
    };

    // Social Media CRUD
    const handleSaveSocial = async () => {
        try {
            if (editingSocial.id) {
                await api.put(`/products/admin/footer-social/${editingSocial.id}/`, editingSocial);
                toast.success('Social media updated');
            } else {
                await api.post('/products/admin/footer-social/', editingSocial);
                toast.success('Social media created');
            }
            setEditingSocial(null);
            fetchAllData();
        } catch (error) {
            toast.error('Failed to save social media');
        }
    };

    const handleDeleteSocial = async (id) => {
        if (!confirm('Delete this social media link?')) return;
        try {
            await api.delete(`/products/admin/footer-social/${id}/`);
            toast.success('Social media deleted');
            fetchAllData();
        } catch (error) {
            toast.error('Failed to delete social media');
        }
    };

    // Settings Update
    const handleSaveSettings = async () => {
        try {
            if (settings?.id) {
                await api.put(`/products/admin/footer-settings/${settings.id}/`, settings);
            } else {
                const res = await api.post('/products/admin/footer-settings/', settings);
                setSettings(res.data);
            }
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Footer Management</h1>
                <p className="text-muted-foreground">Manage footer sections, links, social media, and settings</p>
            </div>

            <Tabs defaultValue="sections" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Sections Tab */}
                <TabsContent value="sections">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Footer Sections</CardTitle>
                                    <CardDescription>Manage main footer sections (About, Help, etc.)</CardDescription>
                                </div>
                                <Button onClick={() => setEditingSection({ title: '', order: sections.length + 1, is_active: true })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Section
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sections.map(section => (
                                    <div key={section.id} className="flex items-center justify-between p-4 border rounded">
                                        <div>
                                            <h3 className="font-semibold">{section.title}</h3>
                                            <p className="text-sm text-muted-foreground">Order: {section.order} • {section.is_active ? 'Active' : 'Inactive'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingSection(section)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteSection(section.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {editingSection && (
                                <div className="mt-4 p-4 border rounded bg-slate-50">
                                    <h3 className="font-semibold mb-4">{editingSection.id ? 'Edit Section' : 'New Section'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                value={editingSection.title}
                                                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                                                placeholder="e.g. About"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Order</label>
                                            <Input
                                                type="number"
                                                value={editingSection.order}
                                                onChange={(e) => setEditingSection({ ...editingSection, order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editingSection.is_active}
                                                onChange={(e) => setEditingSection({ ...editingSection, is_active: e.target.checked })}
                                            />
                                            <label className="text-sm font-medium">Active</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleSaveSection}>
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                            <Button variant="outline" onClick={() => setEditingSection(null)}>
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Links Tab */}
                <TabsContent value="links">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Footer Links</CardTitle>
                                    <CardDescription>Manage individual links within sections</CardDescription>
                                </div>
                                <Button onClick={() => setEditingLink({ title: '', url: '', section: sections[0]?.id, order: 1, is_active: true, opens_new_tab: false })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Link
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sections.map(section => (
                                <div key={section.id} className="mb-6">
                                    <h3 className="font-semibold mb-2">{section.title}</h3>
                                    <div className="space-y-2">
                                        {links.filter(link => link.section === section.id).map(link => (
                                            <div key={link.id} className="flex items-center justify-between p-3 border rounded">
                                                <div>
                                                    <p className="font-medium">{link.title}</p>
                                                    <p className="text-sm text-muted-foreground">{link.url}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setEditingLink(link)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteLink(link.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {editingLink && (
                                <div className="mt-4 p-4 border rounded bg-slate-50">
                                    <h3 className="font-semibold mb-4">{editingLink.id ? 'Edit Link' : 'New Link'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Section</label>
                                            <select
                                                className="w-full p-2 border rounded"
                                                value={editingLink.section}
                                                onChange={(e) => setEditingLink({ ...editingLink, section: parseInt(e.target.value) })}
                                            >
                                                {sections.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                value={editingLink.title}
                                                onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                                                placeholder="e.g. Contact Us"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">URL</label>
                                            <Input
                                                value={editingLink.url}
                                                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                                                placeholder="e.g. /pages/contact"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Order</label>
                                            <Input
                                                type="number"
                                                value={editingLink.order}
                                                onChange={(e) => setEditingLink({ ...editingLink, order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={editingLink.is_active}
                                                    onChange={(e) => setEditingLink({ ...editingLink, is_active: e.target.checked })}
                                                />
                                                <label className="text-sm font-medium">Active</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={editingLink.opens_new_tab}
                                                    onChange={(e) => setEditingLink({ ...editingLink, opens_new_tab: e.target.checked })}
                                                />
                                                <label className="text-sm font-medium">Open in new tab</label>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleSaveLink}>
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                            <Button variant="outline" onClick={() => setEditingLink(null)}>
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Social Media Tab */}
                <TabsContent value="social">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Social Media Links</CardTitle>
                                    <CardDescription>Manage social media platform links</CardDescription>
                                </div>
                                <Button onClick={() => setEditingSocial({ name: '', url: '', icon: 'facebook', order: 1, is_active: true })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Social Media
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {socialMedia.map(social => (
                                    <div key={social.id} className="flex items-center justify-between p-4 border rounded">
                                        <div>
                                            <h3 className="font-semibold">{social.name}</h3>
                                            <p className="text-sm text-muted-foreground">{social.url} • Icon: {social.icon}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingSocial(social)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteSocial(social.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {editingSocial && (
                                <div className="mt-4 p-4 border rounded bg-slate-50">
                                    <h3 className="font-semibold mb-4">{editingSocial.id ? 'Edit' : 'New'} Social Media</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Name</label>
                                            <Input
                                                value={editingSocial.name}
                                                onChange={(e) => setEditingSocial({ ...editingSocial, name: e.target.value })}
                                                placeholder="e.g. Facebook"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">URL</label>
                                            <Input
                                                value={editingSocial.url}
                                                onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                                                placeholder="https://facebook.com/yourpage"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Icon</label>
                                            <select
                                                className="w-full p-2 border rounded"
                                                value={editingSocial.icon}
                                                onChange={(e) => setEditingSocial({ ...editingSocial, icon: e.target.value })}
                                            >
                                                <option value="facebook">Facebook</option>
                                                <option value="twitter">Twitter</option>
                                                <option value="instagram">Instagram</option>
                                                <option value="youtube">Youtube</option>
                                                <option value="linkedin">Linkedin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Order</label>
                                            <Input
                                                type="number"
                                                value={editingSocial.order}
                                                onChange={(e) => setEditingSocial({ ...editingSocial, order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editingSocial.is_active}
                                                onChange={(e) => setEditingSocial({ ...editingSocial, is_active: e.target.checked })}
                                            />
                                            <label className="text-sm font-medium">Active</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleSaveSocial}>
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                            <Button variant="outline" onClick={() => setEditingSocial(null)}>
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Footer Settings</CardTitle>
                            <CardDescription>Company information and global footer settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input
                                        value={settings?.company_name || ''}
                                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                        placeholder="Uparwala Internet Pvt Ltd"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Registered Address</label>
                                    <Textarea
                                        value={settings?.registered_address || ''}
                                        onChange={(e) => setSettings({ ...settings, registered_address: e.target.value })}
                                        rows={4}
                                        placeholder="Full registered office address..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">CIN Number</label>
                                    <Input
                                        value={settings?.cin_number || ''}
                                        onChange={(e) => setSettings({ ...settings, cin_number: e.target.value })}
                                        placeholder="U51109KA2012PTC066107"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input
                                        value={settings?.phone_number || ''}
                                        onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                                        placeholder="044-8447878"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Copyright Text</label>
                                    <Input
                                        value={settings?.copyright_text || ''}
                                        onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                                        placeholder="© 2025 Uparwala. All rights reserved."
                                    />
                                </div>
                                <Button onClick={handleSaveSettings}>
                                    <Save className="h-4 w-4 mr-2" /> Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FooterManager;
