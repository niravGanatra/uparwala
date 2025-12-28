import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">About</h3>
                        <ul className="space-y-2">
                            <li><Link to="/pages/contact-us" className="hover:text-white transition-colors text-sm">Contact Us</Link></li>
                            <li><Link to="/about-us" className="hover:text-white transition-colors text-sm">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition-colors text-sm">Careers</Link></li>
                            <li><Link to="/pages/corporate-information" className="hover:text-white transition-colors text-sm">Corporate Information</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Help</h3>
                        <ul className="space-y-2">
                            <li><Link to="/payments" className="hover:text-white transition-colors text-sm">Payments</Link></li>
                            <li><Link to="/shipping" className="hover:text-white transition-colors text-sm">Shipping</Link></li>
                            <li><Link to="/pages/cancellations-returns" className="hover:text-white transition-colors text-sm">Cancellations & Returns</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors text-sm">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Consumer Policy */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Consumer Policy</h3>
                        <ul className="space-y-2">
                            <li><Link to="/refund-policy" className="hover:text-white transition-colors text-sm">Cancellation & Returns</Link></li>
                            <li><Link to="/terms-of-use" className="hover:text-white transition-colors text-sm">Terms of Use</Link></li>
                            <li><Link to="/security" className="hover:text-white transition-colors text-sm">Security</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-white transition-colors text-sm">Privacy</Link></li>
                            <li><Link to="/pages/sitemap" className="hover:text-white transition-colors text-sm">Sitemap</Link></li>
                            <li><Link to="/pages/grievance-redressal" className="hover:text-white transition-colors text-sm">Grievance Redressal</Link></li>
                            <li><Link to="/epr-compliance" className="hover:text-white transition-colors text-sm">EPR Compliance</Link></li>
                        </ul>
                    </div>

                    {/* Social & Address */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect With Us</h3>
                        {/* Social Media */}
                        <div className="flex gap-3 mb-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Registered Office Address */}
                        <div>
                            <h4 className="text-white font-semibold mb-2 text-sm">Registered Office Address</h4>
                            <address className="text-xs leading-relaxed not-italic">
                                Uparwala Traders LLP,<br />
                                11, Kohinoor Society,<br />
                                Vijay Nagar Road,<br />
                                Naranpura,<br />
                                Ahmedabad, 380013,<br />
                                Gujarat, India<br />
                                <span className="inline-block mt-2">CIN: U51109KA2012PTC066107</span><br />
                                <span>Telephone: <a href="tel:0448447878" className="hover:text-white">044-8447878</a></span>
                            </address>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-400">
                            © 2025 Uparwala. All rights reserved.
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
