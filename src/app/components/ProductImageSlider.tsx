import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
function toFullUrl(src: string): string {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return src.startsWith('/') ? `${API_HOST}${src}` : `${API_HOST}/${src}`;
}

interface Props {
    image: string;
    images?: string[];
    alt: string;
    /** Card mode: small dots + hover arrows. Detail mode: thumbnail strip + large view */
    mode?: 'card' | 'detail';
    className?: string;
}

export default function ProductImageSlider({ image, images, alt, mode = 'card', className = '' }: Props) {
    const allImages = (images && images.length > 0) ? images : [image];
    const [current, setCurrent] = useState(0);

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
    };

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));
    };

    if (allImages.length <= 1) {
        // Single image — no slider
        if (mode === 'detail') {
            return (
                <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
                    <img
                        src={toFullUrl(allImages[0])}
                        alt={alt}
                        className="w-full h-[500px] object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'; }}
                    />
                </div>
            );
        }
        return (
            <img
                src={toFullUrl(allImages[0])}
                alt={alt}
                className={className}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'; }}
            />
        );
    }

    // ======== DETAIL MODE (Flipkart-style) ========
    if (mode === 'detail') {
        return (
            <div className="flex gap-4">
                {/* Thumbnail strip */}
                <div className="flex flex-col gap-2 w-16 overflow-y-auto max-h-[500px]">
                    {allImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${i === current ? 'border-[#6B8E23] shadow-md' : 'border-gray-200 hover:border-[#8FBC5A]'
                                }`}
                        >
                            <img
                                src={toFullUrl(img)}
                                alt={`${alt} ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'; }}
                            />
                        </button>
                    ))}
                </div>
                {/* Main image */}
                <div className={`flex-1 bg-white rounded-lg shadow-lg overflow-hidden relative group ${className}`}>
                    <img
                        src={toFullUrl(allImages[current])}
                        alt={alt}
                        className="w-full h-[500px] object-cover transition-opacity duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'; }}
                    />
                    {/* Arrows */}
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition">
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition">
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    {/* Counter */}
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {current + 1} / {allImages.length}
                    </span>
                </div>
            </div>
        );
    }

    // ======== CARD MODE ========
    return (
        <div className="relative group overflow-hidden">
            <img
                src={toFullUrl(allImages[current])}
                alt={alt}
                className={`transition-opacity duration-300 ${className}`}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'; }}
            />
            {/* Arrows (visible on hover) */}
            <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition z-10">
                <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition z-10">
                <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCurrent(i); }}
                        className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-[#6B8E23]' : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
