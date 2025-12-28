import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Star, Trash2, CheckCircle, XCircle, User, Package } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, approved, unapproved
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            let url = '/products/admin/reviews/';
            if (filter === 'approved') {
                url += '?is_approved=true';
            } else if (filter === 'unapproved') {
                url += '?is_approved=false';
            }
            const response = await api.get(url);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!reviewToDelete) return;

        try {
            await api.delete(`/products/admin/reviews/${reviewToDelete.id}/delete/`);
            toast.success('Review deleted');
            setDeleteDialogOpen(false);
            setReviewToDelete(null);
            fetchReviews();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const handleApproval = async (reviewId, action) => {
        try {
            await api.post(`/products/admin/reviews/${reviewId}/approval/`, { action });
            toast.success(`Review ${action === 'approve' ? 'approved' : 'unapproved'}`);
            fetchReviews();
        } catch (error) {
            toast.error('Failed to update review');
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product?.toString().includes(searchTerm)
    );

    const StarRating = ({ rating }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Review Management</h1>
                        <p className="text-sm md:text-base text-slate-600">Manage and moderate customer reviews</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-slate-900">{reviews.length}</p>
                                    <p className="text-sm text-slate-600">Total Reviews</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">
                                        {reviews.filter(r => r.is_approved).length}
                                    </p>
                                    <p className="text-sm text-slate-600">Approved</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-red-600">
                                        {reviews.filter(r => !r.is_approved).length}
                                    </p>
                                    <p className="text-sm text-slate-600">Pending</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search reviews..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    <option value="all">All Reviews</option>
                                    <option value="approved">Approved</option>
                                    <option value="unapproved">Pending Approval</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Reviews ({filteredReviews.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-8 text-slate-500">Loading reviews...</p>
                            ) : filteredReviews.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">No reviews found</p>
                            ) : (
                                <div className="space-y-4">
                                    {filteredReviews.map((review) => (
                                        <div key={review.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    {review.product_details?.image ? (
                                                        <img
                                                            src={review.product_details.image}
                                                            alt={review.product_details.name}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                                                            <Package className="h-8 w-8 text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Review Content */}
                                                <div className="flex-1">
                                                    {/* Header Row */}
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <StarRating rating={review.rating} />
                                                            {review.is_verified_purchase && (
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                    Verified Purchase
                                                                </span>
                                                            )}
                                                            <span className={`text-xs px-2 py-1 rounded ${review.is_approved
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {review.is_approved ? 'Approved' : 'Pending'}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            {review.is_approved ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleApproval(review.id, 'unapprove')}
                                                                    className="text-yellow-600"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Unapprove
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleApproval(review.id, 'approve')}
                                                                    className="text-green-600"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setReviewToDelete(review);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="mb-2">
                                                        <a
                                                            href={`/products/${review.product_details?.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            {review.product_details?.name || `Product #${review.product}`}
                                                        </a>
                                                        {review.product_details?.price > 0 && (
                                                            <span className="text-slate-500 ml-2">
                                                                ₹{review.product_details.price.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Review Content */}
                                                    <h4 className="font-semibold mb-1">{review.title}</h4>
                                                    <p className="text-slate-700 mb-3">{review.comment}</p>

                                                    {/* Customer Info */}
                                                    {review.user_details && (
                                                        <div className="bg-slate-100 rounded-lg p-3 text-sm">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User className="h-4 w-4 text-slate-500" />
                                                                <span className="font-medium">
                                                                    {review.user_details.first_name || review.user_details.last_name
                                                                        ? `${review.user_details.first_name} ${review.user_details.last_name}`.trim()
                                                                        : review.user_details.username}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 text-slate-600">
                                                                {review.user_details.email && (
                                                                    <span>📧 {review.user_details.email}</span>
                                                                )}
                                                                {review.user_details.phone && (
                                                                    <span>📱 {review.user_details.phone}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setReviewToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Review"
                message={`Are you sure you want to delete this review by "${reviewToDelete?.user_name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
            />
        </div>
    );
};

export default ReviewManagement;
