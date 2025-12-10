import { useState } from 'react';
import BannersManager from '../../components/admin/homepage/BannersManager';
import FeaturedManager from '../../components/admin/homepage/FeaturedManager';
import SectionsManager from '../../components/admin/homepage/SectionsManager';
import CodesManager from '../../components/admin/homepage/CodesManager';
import { Layout, Image, Tag, Ticket } from 'lucide-react';

const HomepageManager = () => {
    const [activeTab, setActiveTab] = useState('banners');

    const tabs = [
        { id: 'banners', label: 'Banners & Sliders', icon: Image },
        { id: 'featured', label: 'Featured & Deals', icon: Tag },
        { id: 'sections', label: 'Page Sections', icon: Layout },
        { id: 'codes', label: 'Coupon Codes', icon: Ticket },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Homepage Manager</h1>
                <p className="text-slate-600">Customize the layout and content of your storefront</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow'
                                : 'text-slate-500 hover:text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Content - Switcher */}
            <div className="mt-6">
                {activeTab === 'banners' && <BannersManager />}
                {activeTab === 'featured' && <FeaturedManager />}
                {activeTab === 'sections' && <SectionsManager />}
                {activeTab === 'codes' && <CodesManager />}
            </div>
        </div>
    );
};

export default HomepageManager;
