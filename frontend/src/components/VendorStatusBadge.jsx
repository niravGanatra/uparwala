import { Clock, CheckCircle, XCircle } from 'lucide-react';

const VendorStatusBadge = ({ status }) => {
    const statusConfig = {
        pending: {
            label: 'Pending Review',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            icon: Clock
        },
        verified: {
            label: 'Approved',
            color: 'bg-green-100 text-green-800 border-green-300',
            icon: CheckCircle
        },
        rejected: {
            label: 'Rejected',
            color: 'bg-red-100 text-red-800 border-red-300',
            icon: XCircle
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
            <Icon className="h-4 w-4" />
            {config.label}
        </span>
    );
};

export default VendorStatusBadge;
