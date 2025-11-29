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
                <TransformWrapper>
                    <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                        <img
                            src={images[index].image}
                            alt={productName}
                            className="w-full h-full object-contain"
                        />
                    </TransformComponent>
                </TransformWrapper>

                {/* Lightbox Trigger */}
                <button
                    onClick={() => setOpen(true)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                    <Maximize2 className="w-5 h-5 text-slate-700" />
                </button>
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
