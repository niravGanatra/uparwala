import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, FileText, Download, Mail, Phone, Calendar, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';

const CareerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/users/career/applications/');
            setApplications(response.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            toast.error('Failed to load career applications');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await api.delete(`/users/career/applications/${deleteId}/`);
            setApplications(applications.filter(app => app.id !== deleteId));
            toast.success('Application deleted successfully');
        } catch (error) {
            console.error('Failed to delete application:', error);
            toast.error('Failed to delete application');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const filteredApplications = applications.filter(app =>
        app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Career Applications</h1>
                        <p className="text-sm md:text-base text-slate-600">View and manage job applications</p>
                    </div>

                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name, email or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-8 text-slate-500">Loading applications...</p>
                            ) : filteredApplications.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">No applications found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900 pl-4">Candidate</th>
                                                <th className="pb-3 font-semibold text-slate-900">Contact</th>
                                                <th className="pb-3 font-semibold text-slate-900">Message</th>
                                                <th className="pb-3 font-semibold text-slate-900">Date</th>
                                                <th className="pb-3 font-semibold text-slate-900">Resume</th>
                                                <th className="pb-3 font-semibold text-slate-900 text-right pr-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredApplications.map((app) => (
                                                <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 pl-4">
                                                        <div className="font-medium text-slate-900">{app.full_name}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {app.email}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {app.phone}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <p className="text-sm text-slate-600 max-w-xs truncate" title={app.message}>
                                                            {app.message || '-'}
                                                        </p>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(app.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        {app.resume ? (
                                                            <a
                                                                href={app.resume}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                View Resume
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 text-sm">No resume</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right pr-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDeleteClick(app.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Application"
                message="Are you sure you want to delete this application? This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                confirmVariant="destructive"
            />
        </div >
    );
};

export default CareerApplications;
