import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        is_vendor: false,
        is_customer: true,
        is_staff: false
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/admin/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register/', formData);
            toast.success('User created successfully!');
            setIsAddModalOpen(false);
            setFormData({ username: '', email: '', password: '', is_vendor: false, is_customer: true, is_staff: false });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.username?.[0] || 'Failed to create user');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            is_vendor: user.is_vendor,
            is_customer: user.is_customer,
            is_staff: user.is_staff
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/users/admin/users/${selectedUser.id}/`, formData);
            toast.success('User updated successfully!');
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/users/admin/users/${userId}/`, { is_active: !currentStatus });
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_active: !currentStatus } : u
            ));
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleToggleManager = async (userId, isCurrentlyManager) => {
        try {
            const action = isCurrentlyManager ? 'remove_manager' : 'make_manager';
            await api.post(`/users/admin/users/${userId}/toggle-manager/`, { action });
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_manager: !isCurrentlyManager } : u
            ));
            toast.success(isCurrentlyManager ? 'Manager role removed' : 'User is now a Manager');
        } catch (error) {
            toast.error('Failed to update manager status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">User Management</h1>
                            <p className="text-sm md:text-base text-slate-600">Manage all users in the system</p>
                        </div>
                        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>

                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-8 text-slate-500">Loading users...</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900">Username</th>
                                                <th className="pb-3 font-semibold text-slate-900">Email</th>
                                                <th className="pb-3 font-semibold text-slate-900">Role</th>
                                                <th className="pb-3 font-semibold text-slate-900">Status</th>
                                                <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="border-b last:border-0">
                                                    <td className="py-4">{user.username}</td>
                                                    <td className="py-4">{user.email}</td>
                                                    <td className="py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${user.is_staff ? 'bg-purple-100 text-purple-700' :
                                                                user.is_vendor ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {user.is_staff ? 'Admin' : user.is_vendor ? 'Vendor' : 'Customer'}
                                                            </span>
                                                            {user.is_manager && (
                                                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                                                    Manager
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                                            role="switch"
                                                            aria-checked={user.is_active}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </button>
                                                        <span className={`ml-2 text-sm font-medium ${user.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex gap-2">
                                                            {!user.is_staff && (
                                                                <Button
                                                                    variant={user.is_manager ? "outline" : "default"}
                                                                    size="sm"
                                                                    onClick={() => handleToggleManager(user.id, user.is_manager)}
                                                                    className={user.is_manager ? "border-red-300 text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
                                                                >
                                                                    {user.is_manager ? 'Remove Manager' : 'Make Manager'}
                                                                </Button>
                                                            )}
                                                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add User Modal */}
                    <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User">
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Username *</label>
                                <Input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Password *</label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_vendor}
                                        onChange={(e) => setFormData({ ...formData, is_vendor: e.target.checked })}
                                    />
                                    <span className="text-sm">Vendor</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_staff}
                                        onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                                    />
                                    <span className="text-sm">Admin</span>
                                </label>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create User</Button>
                            </div>
                        </form>
                    </Modal>

                    {/* Edit User Modal */}
                    <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Username</label>
                                <Input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_vendor}
                                        onChange={(e) => setFormData({ ...formData, is_vendor: e.target.checked })}
                                    />
                                    <span className="text-sm">Vendor</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_staff}
                                        onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                                    />
                                    <span className="text-sm">Admin</span>
                                </label>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Update User</Button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
