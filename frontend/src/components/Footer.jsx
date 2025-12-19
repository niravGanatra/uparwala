import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Footer = () => {
    const [footerData, setFooterData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFooterData();
    }, []);

    const fetchFooterData = async () => {
        try {
            const response = await api.get('/products/footer-data/');
            setFooterData(response.data);
        } catch (error) {
            console.error('Failed to fetch footer data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Icon mapping for social media
    const iconComponents = {
        facebook: Facebook,
        twitter: Twitter,
        instagram: Instagram,
        youtube: Youtube,
        linkedin: Linkedin,
    };

    if (loading || !footerData) {
        return (
            <footer className="bg-slate-900 text-gray-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    Loading...
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-slate-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Dynamic Sections */}
                    {footerData.sections && footerData.sections.map((section) => (
                        <div key={section.id}>
                            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.links && section.links
                                    .filter(link => link.is_active)
                                    .map((link) => (
                                        <li key={link.id}>
                                            <Link
                                                to={link.url}
                                                target={link.opens_new_tab ? '_blank' : undefined}
                                                rel={link.opens_new_tab ? 'noopener noreferrer' : undefined}
                                                className="hover:text-white transition-colors text-sm"
                                            >
                                                {link.title}
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    ))}

                    {/* Social Media & Address */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect With Us</h3>

                        {/* Social Media Icons */}
                        {footerData.social_media && footerData.social_media.length > 0 && (
                            <div className="flex gap-3 mb-6">
                                {footerData.social_media.map((social) => {
                                    const IconComponent = iconComponents[social.icon] || Facebook;
                                    return (
                                        <a
                                            key={social.id}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-white transition-colors"
                                            aria-label={social.name}
                                        >
                                            <IconComponent className="w-5 h-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* Registered Office Address */}
                        {footerData.settings && (
                            <div>
                                <h4 className="text-white font-semibold mb-2 text-sm">Registered Office Address</h4>
                                <address className="text-xs leading-relaxed not-italic">
                                    {footerData.settings.company_name && (
                                        <>{footerData.settings.company_name},<br /></>
                                    )}
                                    {footerData.settings.registered_address && (
                                        <>
                                            {footerData.settings.registered_address.split('\n').map((line, idx) => (
                                                <span key={idx}>
                                                    {line}
                                                    {idx < footerData.settings.registered_address.split('\n').length - 1 && <br />}
                                                </span>
                                            ))}
                                            <br />
                                        </>
                                    )}
                                    {footerData.settings.cin_number && (
                                        <span className="inline-block mt-2">CIN: {footerData.settings.cin_number}<br /></span>
                                    )}
                                    {footerData.settings.phone_number && (
                                        <span>
                                            Telephone: <a href={`tel:${footerData.settings.phone_number.replace(/[-\s]/g, '')}`} className="hover:text-white">
                                                {footerData.settings.phone_number}
                                            </a>
                                        </span>
                                    )}
                                </address>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-400">
                            {footerData.settings?.copyright_text || '© 2025 Uparwala. All rights reserved.'}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                            <Link to="/vendor/register" className="hover:text-white transition-colors">Become a Seller</Link>
                            <span>•</span>
                            <Link to="/pages/advertise" className="hover:text-white transition-colors">Advertise</Link>
                            <span>•</span>
                            <Link to="/pages/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link>
                            <span>•</span>
                            <Link to="/pages/help-center" className="hover:text-white transition-colors">Help Center</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
