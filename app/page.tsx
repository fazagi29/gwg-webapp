"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorLightRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Logika Parallax untuk teks
      if (containerRef.current) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
        containerRef.current.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      }

      // Logika cahaya ungu yang mengikuti kursor
      if (cursorLightRef.current) {
        // Menggunakan clientX & clientY dengan translate untuk performa yang jauh lebih baik tanpa re-render
        cursorLightRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Transisi halus selama 600ms sebelum berpindah halaman
    setTimeout(() => {
      router.push('/login');
    }, 600);
  };

  return (
    // Menggunakan fixed statis di belakang layar agar sama sekali tidak ada overflow yang tembus
    <main 
      className="fixed inset-0 w-full h-full flex justify-center items-center overflow-hidden bg-slate-950 text-slate-50 cursor-pointer z-50"
      onClick={handleEnter}
    >
      {/* Wrapper transisi, menggunakan div di dalam mencegah body membesar yang memicu scrollbar */}
      <div className={`absolute inset-0 w-full h-full flex justify-center items-center transition-all duration-700 ease-in-out ${
        isExiting ? 'opacity-0 scale-110 blur-md' : 'opacity-100 scale-100 blur-none'
      }`}>
        
        {/* Background ambient lighting persis seperti di dashboard/layout.tsx */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] mix-blend-screen pointer-events-none" />
        
        {/* Lampu ungu yang mengikuti pergerakan kursor */}
        <div 
          ref={cursorLightRef}
          className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full bg-purple-600/15 blur-[100px] mix-blend-screen pointer-events-none will-change-transform"
          style={{ transform: 'translate(-50%, -50%)' }}
        />

        <style dangerouslySetInnerHTML={{ __html: `
          .container-hero {
              text-align: center;
              z-index: 10;
              perspective: 1000px;
          }
          
          .container-inner {
              transition: transform 0.1s ease-out;
              transform-style: preserve-3d;
          }

          h1.title-gwg {
              font-family: var(--font-heading), 'Montserrat', sans-serif;
              font-size: 8rem;
              font-weight: 900;
              color: white;
              margin: 0;
              letter-spacing: 15px;
              text-transform: uppercase;
              line-height: 1;
              /* Glow dikurangi agar tidak terlalu silau */
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
              animation: float 4s ease-in-out infinite, mildGlow 3s ease-in-out infinite alternate;
          }

          p.subtitle-portal {
              font-size: 1.5rem;
              color: rgba(255, 255, 255, 0.9);
              margin-top: -10px;
              letter-spacing: 25px;
              margin-right: -25px; /* Menengahkan teks karena ada letter-spacing */
              text-transform: uppercase;
              font-weight: 300;
              opacity: 0;
              animation: fadeIn 2s forwards 0.5s, tracking-in 1.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) 0.5s both;
          }
          
          p.enter-hint {
              font-size: 0.875rem;
              color: rgba(255,255,255,0.4);
              margin-top: 50px;
              letter-spacing: 5px;
              margin-right: -5px;
              text-transform: uppercase;
              font-weight: 300;
              opacity: 0;
              animation: fadeInPulse 3s infinite 2s;
          }

          @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-15px); }
          }

          /* Animasi Glow yang lebih lembut */
          @keyframes mildGlow {
              from { text-shadow: 0 0 5px rgba(255,255,255,0.1), 0 0 10px rgba(139,92,246,0.2); }
              to { text-shadow: 0 0 15px rgba(255,255,255,0.3), 0 0 25px rgba(139,92,246,0.5); }
          }

          @keyframes fadeIn {
              to { opacity: 1; }
          }

          @keyframes fadeInPulse {
              0% { opacity: 0; }
              50% { opacity: 0.6; }
              100% { opacity: 0; }
          }

          @keyframes tracking-in {
              0% { letter-spacing: -0.5em; margin-right: 0.5em; opacity: 0; }
              40% { opacity: 0.6; }
              100% { opacity: 1; letter-spacing: 25px; margin-right: -25px; }
          }
          
          @media (max-width: 768px) {
              h1.title-gwg {
                  font-size: 5rem;
                  letter-spacing: 10px;
              }
              p.subtitle-portal {
                  font-size: 1rem;
                  letter-spacing: 15px;
                  margin-right: -15px;
                  animation: fadeIn 2s forwards 0.5s, tracking-in-mobile 1.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) 0.5s both;
              }
          }
          
          @keyframes tracking-in-mobile {
              0% { letter-spacing: -0.5em; margin-right: 0.5em; opacity: 0; }
              40% { opacity: 0.6; }
              100% { opacity: 1; letter-spacing: 15px; margin-right: -15px; }
          }
        `}} />

        <div className="container-hero">
            <div className="container-inner" ref={containerRef}>
              <h1 className="title-gwg">GWG</h1>
              <p className="subtitle-portal">Portal</p>
              <p className="enter-hint">Klik untuk Lanjut</p>
            </div>
        </div>

      </div>
    </main>
  );
}
