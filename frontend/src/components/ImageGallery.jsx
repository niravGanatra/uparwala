import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Maximize2 } from 'lucide-react';

const ImageGallery = ({ images = [], productName }) => {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center text-slate-400">
                No Image Available
            </div>
        );
    }

    // Format images for lightbox
    const slides = images.map(img => ({ src: img.image }));

    return (
        <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-slate-200 group">
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={4}
                    wheel={{ step: 0.1 }}
                    doubleClick={{ mode: "zoomIn" }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                                <img
                                    src={images[index].image}
                                    alt={productName}
                                    className="w-full h-full object-contain cursor-zoom-in"
                                />
                            </TransformComponent>

                            {/* Zoom Controls */}
                            <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => zoomIn()}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                                    title="Zoom In"
                                >
                                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => zoomOut()}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                                    title="Zoom Out"
                                >
                                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => resetTransform()}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                                    title="Reset Zoom"
                                >
                                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </TransformWrapper>

                {/* Fullscreen/Lightbox Trigger */}
                <button
                    onClick={() => setOpen(true)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
                    title="View Fullscreen"
                >
                    <Maximize2 className="w-5 h-5 text-slate-700" />
                </button>

                {/* Hint Text */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Double-click or scroll to zoom
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                        <button
                            key={img.id || i}
                            onClick={() => setIndex(i)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${index === i ? 'border-orange-600 ring-2 ring-orange-100' : 'border-transparent hover:border-slate-300'
                                }`}
                        >
                            <img
                                src={img.image}
                                alt={`${productName} ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                slides={slides}
                on={{ view: ({ index: currentIndex }) => setIndex(currentIndex) }}
            />
        </div>
    );
};

export default ImageGallery;
