import { useEffect, useState } from 'react';

const scenes = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=90',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000&q=90',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=2000&q=90',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=2000&q=90',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2000&q=90',
];

export default function CinematicBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive(current => (current + 1) % scenes.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, background: '#030817' }}>

      {scenes.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: active === index ? 0.85 : 0,
            transform: active === index
              ? 'scale(1.08)'
              : 'scale(1.22)',
            transition:
              'opacity 2s ease-in-out, transform 7s ease-in-out',
            filter: 'brightness(0.65) saturate(1.2)',
          }}
        />
      ))}

      {/* Blue cinematic lighting */}
      <div className="absolute inset-0"
        style={{
          background:
            'linear-gradient(110deg, rgba(2,8,25,.85), rgba(0,35,90,.25), rgba(0,0,0,.55))',
        }}
      />

      {/* Purple and blue atmosphere */}
      <div className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 75% 35%, rgba(0,120,255,.25), transparent 55%), radial-gradient(ellipse at 15% 80%, rgba(100,0,255,.2), transparent 50%)',
        }}
      />

      {/* Cinematic bottom fade */}
      <div className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 40%, #050b19 100%)',
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          img { transition: none !important; }
        }
      `}</style>
    </div>
  );
                   }
