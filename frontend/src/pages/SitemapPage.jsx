import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronRight, Map, ExternalLink } from 'lucide-react';

const SitemapPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch all categories
                const response = await api.get('/products/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const sections = [
        {
            title: "Main Pages",
            links: [
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about-us" },
                { name: "Contact Us", path: "/contact" },
                { name: "Careers", path: "/careers" },
                { name: "Login", path: "/login" },
                { name: "Register", path: "/register" }
            ]
        },
        {
            title: "Shop",
            links: [
                { name: "All Products", path: "/products" },
                { name: "Cart", path: "/cart" },
                { name: "Wishlist", path: "/wishlist" }
            ]
        },
        {
            title: "Support & Help",
            links: [
                { name: "Help Center", path: "/pages/help-center" },
                { name: "FAQ", path: "/faq" },
                { name: "Shipping Policy", path: "/shipping" },
                { name: "Payments", path: "/payments" },
                { name: "Cancellations & Returns", path: "/refund-policy" },
                { name: "Order Tracking", path: "/tickets" }
            ]
        },
        {
            title: "Legal & Policy",
            links: [
                { name: "Terms of Use", path: "/terms-of-use" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Security Policy", path: "/security" },
                { name: "EPR Compliance", path: "/epr-compliance" },
                { name: "Grievance Redressal", path: "/pages/grievance-redressal" },
                { name: "Corporate Information", path: "/pages/corporate-information" }
            ]
        },
        {
            title: "For Sellers",
            links: [
                { name: "Become a Seller", path: "/vendor/register" },
                { name: "Vendor Login", path: "/login" }
            ]
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                        <Map className="h-10 w-10 text-orange-600" />
                        Sitemap
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Explore all the sections of Uparwala.in to find exactly what you are looking for.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Static Sections */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                                {section.title}
                            </h2>
                            <ul className="space-y-3">
                                {section.links.map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <Link
                                            to={link.path}
                                            className="flex items-center text-slate-600 hover:text-orange-600 transition-colors group"
                                        >
                                            <ChevronRight className="h-4 w-4 mr-2 text-slate-400 group-hover:text-orange-500" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Dynamic Categories Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                            Product Categories
                        </h2>
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-6 bg-slate-100 rounded w-3/4"></div>
                                ))}
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <li key={category.id}>
                                            <Link
                                                to={`/category/${category.slug}`}
                                                className="flex items-center text-slate-600 hover:text-orange-600 transition-colors group"
                                            >
                                                <ChevronRight className="h-4 w-4 mr-2 text-slate-400 group-hover:text-orange-500" />
                                                {category.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm">No categories available.</p>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Uparwala Traders LLP. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default SitemapPage;
