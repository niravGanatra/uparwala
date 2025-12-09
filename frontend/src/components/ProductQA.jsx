import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductQA = ({ productId }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [productId]);

    const fetchQuestions = async () => {
        try {
            const response = await api.get(`/products/${productId}/questions/`);
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/products/${productId}/questions/`, {
                question: newQuestion
            });
            toast.success('Question submitted! It will appear after approval.');
            setNewQuestion('');
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit question');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="product-qa mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Questions & Answers
            </h2>

            {/* Ask Question Form */}
            <form onSubmit={handleAskQuestion} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Ask a question about this product..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newQuestion.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Ask
                    </button>
                </div>
            </form>

            {/* Questions List */}
            {loading ? (
                <div className="text-center py-8">Loading questions...</div>
            ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No questions yet. Be the first to ask!
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q) => (
                        <div key={q.id} className="border-b pb-4">
                            {/* Question */}
                            <div className="flex gap-3">
                                <div className="bg-gray-100 p-2 rounded-full h-fit">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-500 mb-1">
                                        Q: {q.user.username}
                                    </p>
                                    <p className="text-gray-800">{q.question}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(q.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Answers */}
                            {q.answers && q.answers.length > 0 && (
                                <div className="ml-12 mt-3 space-y-3">
                                    {q.answers.map((answer) => (
                                        <div key={answer.id} className="bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-sm text-blue-700">
                                                    A: {answer.user.username}
                                                </p>
                                                {answer.is_vendor && (
                                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                                                        Vendor
                                                    </span>
                                                )}
                                                {answer.is_staff && (
                                                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                                                        Staff
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700">{answer.answer}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(answer.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductQA;
