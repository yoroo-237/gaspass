import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video as VideoIcon } from 'react-bootstrap-icons';
import './MediaCaroussel.css';

interface MediaItem {
  url: string;
  type: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!media.length || !isAutoplay) return;
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % media.length);
    }, 3400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [media, isAutoplay]);

  if (!media.length) return null;

  const handleManual = useCallback((idx: number) => {
    setCurrent(idx);
    setIsAutoplay(false);
    setTimeout(() => setIsAutoplay(true), 5000);
  }, []);

  const handlePrevious = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrent(c => (c - 1 + media.length) % media.length);
    setIsAutoplay(false);
    setTimeout(() => setIsAutoplay(true), 5000);
  }, [media.length]);

  const handleNext = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrent(c => (c + 1) % media.length);
    setIsAutoplay(false);
    setTimeout(() => setIsAutoplay(true), 5000);
  }, [media.length]);

  const m = media[current];
  return (
    <div className="carousel-box">
      <div className="carousel-media-box">
        {m.type.startsWith('image') ? (
          m.url ? (
            <img
              src={m.url}
              alt=""
              className="carousel-img"
              loading="lazy"
            />
          ) : (
            <ImageIcon size={64} color="#bbb" />
          )
        ) : (
          m.url ? (
            <video
              src={m.url}
              controls
              className="carousel-img"
              preload="metadata"
            />
          ) : (
            <VideoIcon size={64} color="#bbb" />
          )
        )}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="carousel-nav prev"
              type="button"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="carousel-nav next"
              type="button"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        {media.length > 1 && (
          <div className="carousel-index">
            {current + 1}/{media.length}
          </div>
        )}
      </div>
      {media.length > 1 && (
        <div className="carousel-dots">
          {media.map((_, i) =>
            <span
              key={i}
              title={`Voir le média ${i + 1}`}
              onClick={() => handleManual(i)}
              className={
                'carousel-dot' + (current === i ? ' active' : '')
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;