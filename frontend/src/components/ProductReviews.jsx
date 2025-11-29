import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('-created_at');

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [productId, filter, sort]);

    const fetchReviews = async () => {
        try {
            let url = `/products/${productId}/reviews/?sort=${sort}`;
            if (filter !== 'all') {
                url += `&rating=${filter}`;
            }
            const response = await api.get(url);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get(`/products/${productId}/rating-stats/`);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleVote = async (reviewId, isHelpful) => {
        try {
            await api.post(`/products/reviews/${reviewId}/vote/`, { is_helpful: isHelpful });
            fetchReviews();
            toast.success('Vote recorded');
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const StarRating = ({ rating, size = 'sm' }) => {
        const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizes[size]} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const RatingDistribution = () => {
        if (!stats) return null;

        return (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex items-center gap-8 mb-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold">{stats.average_rating}</div>
                        <StarRating rating={Math.round(stats.average_rating)} size="md" />
                        <div className="text-sm text-gray-600 mt-1">{stats.total_reviews} reviews</div>
                    </div>
                    <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.rating_distribution[rating] || 0;
                            const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-2 mb-1">
                                    <span className="text-sm w-8">{rating} ★</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-12">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {stats.verified_purchase_count > 0 && (
                    <div className="text-sm text-gray-600">
                        {stats.verified_purchase_count} verified purchases
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Write a Review
                </button>
            </div>

            <RatingDistribution />

            {showReviewForm && (
                <ReviewForm
                    productId={productId}
                    onSuccess={() => {
                        setShowReviewForm(false);
                        fetchReviews();
                        fetchStats();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                />
            )}

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="-created_at">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="-rating">Highest Rating</option>
                    <option value="rating">Lowest Rating</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-8">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this product!
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{review.user_name}</span>
                                        {review.is_verified_purchase && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-semibold mb-2">{review.title}</h3>
                            <p className="text-gray-700 mb-4">{review.comment}</p>

                            {/* Vendor Response */}
                            {review.vendor_response && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-sm">Vendor Response</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(review.vendor_response_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{review.vendor_response}</p>
                                </div>
                            )}

                            {/* Helpful Votes */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Was this helpful?</span>
                                <button
                                    onClick={() => handleVote(review.id, true)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${review.user_vote === 'helpful'
                                            ? 'bg-blue-50 border-blue-600 text-blue-600'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span className="text-sm">{review.helpful_count}</span>
                                </button>
                                <button
                                    onClick={() => handleVote(review.id, false)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${review.user_vote === 'not_helpful'
                                            ? 'bg-red-50 border-red-600 text-red-600'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                    <span className="text-sm">{review.not_helpful_count}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ReviewForm = ({ productId, onSuccess, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/products/${productId}/reviews/`, {
                rating,
                title,
                comment
            });
            toast.success('Review submitted successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>

            {/* Star Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer transition-colors ${star <= (hoverRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Sum up your review"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Review *</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="4"
                    placeholder="Share your experience with this product"
                    required
                />
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ProductReviews;
