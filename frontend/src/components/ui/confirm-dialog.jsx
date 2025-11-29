import { Modal } from './modal';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'default' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-slate-700 flex-1">{message}</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
