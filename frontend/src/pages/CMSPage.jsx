import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { FileText, AlertCircle } from 'lucide-react';

const CMSPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPage();
    }, [slug]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/products/pages/${slug}/`);
            setPage(response.data);

            // Update page title and meta tags
            if (response.data.meta_title) {
                document.title = response.data.meta_title;
            } else {
                document.title = response.data.title;
            }

            if (response.data.meta_description) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    metaDesc = document.createElement('meta');
                    metaDesc.name = 'description';
                    document.head.appendChild(metaDesc);
                }
                metaDesc.content = response.data.meta_description;
            }
        } catch (error) {
            console.error('Failed to fetch page:', error);
            setError(error.response?.status === 404 ? 'Page not found' : 'Failed to load page');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{error}</h1>
                    <p className="text-slate-600 mb-4">The page you're looking for doesn't exist or has been removed.</p>
                    <a href="/" className="text-blue-600 hover:underline">Go to Homepage</a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{page.title}</h1>
                    {page.published_at && (
                        <p className="text-sm text-slate-600">
                            Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </header>

                {/* Page Content */}
                <article className="prose prose-slate max-w-none">
                    <div
                        className="cms-content"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </article>
            </div>

            {/* Inline styles for better content formatting */}
            <style>{`
                .cms-content h1 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: #0f172a;
                }
                .cms-content h2 {
                    font-size: 1.875rem;
                    font-weight: 600;
                    margin-top: 1.75rem;
                    margin-bottom: 0.875rem;
                    color: #1e293b;
                }
                .cms-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #334155;
                }
                .cms-content p {
                    margin-bottom: 1rem;
                    line-height: 1.75;
                    color: #475569;
                }
                .cms-content ul, .cms-content ol {
                    margin-bottom: 1rem;
                    padding-left: 1.5rem;
                }
                .cms-content li {
                    margin-bottom: 0.5rem;
                }
                .cms-content a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .cms-content a:hover {
                    color: #1d4ed8;
                }
                .cms-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                }
                .cms-content strong {
                    font-weight: 600;
                    color: #1e293b;
                }
                .cms-content code {
                    background-color: #f1f5f9;
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                }
            `}</style>
        </div>
    );
};

export default CMSPage;
