import { useState } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageZoomModal = ({ images = [], initialIndex = 0, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!isOpen || !images || images.length === 0) return null;

    const currentImage = images[currentIndex];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setZoomLevel(1); // Reset zoom on image change
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoomLevel(1); // Reset zoom on image change
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                    onClick={onClose}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleZoomOut();
                            }}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                            aria-label="Zoom Out"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-white text-sm font-medium min-w-[60px] text-center">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleZoomIn();
                            }}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                            aria-label="Zoom In"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                aria-label="Previous Image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                aria-label="Next Image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Main Image */}
                    <motion.div
                        className="relative max-w-[90vw] max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                    >
                        <img
                            src={currentImage?.image || currentImage}
                            alt={`Product image ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain transition-transform duration-200"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                transformOrigin: 'center',
                            }}
                            draggable={false}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImageZoomModal;
