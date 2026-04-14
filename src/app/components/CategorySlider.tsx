import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Slide {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
}

interface CategorySliderProps {
  slides: Slide[];
}

export default function CategorySlider({ slides }: CategorySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Create extended slides array with duplicates for seamless looping
  const extendedSlides = [...slides, ...slides.slice(0, 1)];

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const itemWidth = containerRef.current.clientWidth; // 100% for 1 slide
    const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const itemWidth = containerRef.current.clientWidth; // 100% for 1 slide
    const targetScroll = itemWidth * currentIndex;
    containerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  }, [currentIndex]);

  return (
    <>
      <style>{`
        .slider-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative group">
        <div
          ref={containerRef}
          className="slider-container flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-0 py-4"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {extendedSlides.map((slide, idx) => (
          <div
            key={idx}
            data-slide-item
            className="snap-start flex-shrink-0 w-full relative px-0"
          >
            <Link to={slide.link} className="block group/item h-full">
              <div className="rounded-none overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-72 object-cover group-hover/item:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex flex-col items-center justify-center">
                  <h3 className="text-white text-xl font-bold mb-1 text-center px-2">{slide.title}</h3>
                {slide.subtitle && (
                  <p className="text-white text-sm mb-3 text-center px-2">
                    {slide.subtitle}
                  </p>
                )}
                <button className="bg-[#6B8E23] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#5B6F1E] transition-colors duration-200 shadow-lg text-sm">
                  Shop Now
                </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll('left')}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-xl hover:bg-gray-100 transition-all z-10 opacity-70 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6 text-[#6B8E23]" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-xl hover:bg-gray-100 transition-all z-10 opacity-70 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6 text-[#6B8E23]" />
      </button>
      </div>
    </>
  );
}
