/**
 * @fileoverview Lazy loading video component for performance optimization
 * @module components/ui/lazy-video
 *
 * Uses IntersectionObserver to:
 * - Defer video loading until visible
 * - Play video only when in viewport
 * - Pause when scrolled out of view
 */

"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

interface LazyVideoProps {
  /** Video source URL */
  src: string;
  /** Poster image to show before video loads */
  poster?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to loop the video */
  loop?: boolean;
  /** Whether the video should be muted */
  muted?: boolean;
  /** Plays inline on mobile devices */
  playsInline?: boolean;
}

/**
 * Lazy loading video component that only loads and plays when visible.
 * Significantly improves initial page load performance.
 */
export function LazyVideo({
  src,
  poster,
  className = "",
  loop = true,
  muted = true,
  playsInline = true,
}: LazyVideoProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the video when it becomes visible
            if (!isLoaded) {
              video.src = src;
              video.load();
              setIsLoaded(true);
            }
            // Play when visible
            video.play().catch(() => {
              // Autoplay may be blocked by browser, that's okay
            });
          } else {
            // Pause when not visible to save resources
            video.pause();
          }
        });
      },
      {
        // Start loading slightly before the video is visible
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [src, isLoaded]);

  return (
    <video
      ref={videoRef}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload="none"
      poster={poster}
      className={className}
      aria-hidden="true"
    >
      {/* Source is set dynamically via JavaScript */}
    </video>
  );
}
