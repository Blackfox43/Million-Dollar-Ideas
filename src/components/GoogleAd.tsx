import React, { useEffect, useState, useRef } from 'react';
import { Megaphone } from 'lucide-react';

interface GoogleAdProps {
  slot?: string; // Google AdSense Ad Slot ID
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string; // Optional custom ad label
}

export default function GoogleAd({
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  label = 'ADVERTISEMENT'
}: GoogleAdProps) {
  const metaEnv = (import.meta as any).env;
  const publisherId = metaEnv?.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2969119962603598';

  const adRef = useRef<HTMLModElement | null>(null);
  const [pushed, setPushed] = useState(false);

  // Live Google AdSense initialization with size/duplicate-check protection
  useEffect(() => {
    // Load AdSense Script if not loaded yet
    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      try {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      } catch (err) {
        console.error("AdSense script load failed:", err);
      }
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = adRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        // Ensure the slot actually has width (not hidden/0 width during layout transition)
        // and does not already have an active/finished status tag
        if (rect.width > 0) {
          clearInterval(interval);
          if (!el.hasAttribute('data-adsbygoogle-status') && !pushed) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              setPushed(true);
            } catch (e) {
              console.error("AdSense placement failed:", e);
            }
          }
        }
      }
      if (attempts > 50) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [publisherId, pushed]);

  return (
    <div className={`relative w-full my-4 ${className}`} id={`google-ad-${slot}`}>
      {/* Tiny subtle ad notice tag */}
      <div className="flex justify-between items-center px-1 mb-1 text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
        <span className="flex items-center space-x-1">
          <Megaphone className="w-2.5 h-2.5" />
          <span>{label}</span>
        </span>
      </div>

      {/* Live Google AdSense block */}
      <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-1 flex items-center justify-center min-h-[100px] overflow-hidden">
        <ins
          ref={adRef as any}
          className="adsbygoogle w-full"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
