import { useState, useEffect } from 'react';
import StudentNavbar from '../../components/StudentNavbar';
import { Monitor, Maximize, Minimize } from 'lucide-react';
import bgImage from '../../assets/workspacebg.jpeg';
import characterSprite from '../../assets/character_sprite.png';

// Hardcoded team data
const workstations = [
  { id: 1, top: '45%', left: '20%', teamName: 'npmWinIT', ps: 'AI Resume Screening Platform' },
  { id: 2, top: '45%', left: '50%', teamName: 'UniSquad', ps: 'Smart Traffic Optimization System' },
  { id: 3, top: '75%', left: '20%', teamName: 'IwillWIN', ps: 'Mental Health AI Assistant' },
  { id: 4, top: '75%', left: '50%', teamName: 'Bhai Code', ps: 'AI Study Planner' },
];

const judgeOffice = {
  top: '20%',
  left: '85%',
  link: 'https://meet.google.com/qbb-vnoj-krw',
};

export default function VirtualOffice() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Start in center (percentages)

  // Keyboard movement logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      const speed = 2; // move 2% per keypress
      
      setPosition(prev => {
        let { x, y } = prev;
        
        if (e.key === 'ArrowUp' || e.key === 'w') y = Math.max(0, y - speed);
        if (e.key === 'ArrowDown' || e.key === 's') y = Math.min(100, y + speed);
        if (e.key === 'ArrowLeft' || e.key === 'a') x = Math.max(0, x - speed);
        if (e.key === 'ArrowRight' || e.key === 'd') x = Math.min(100, x + speed);
        
        return { x, y };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle fullscreen mode (simulated via fixed positioning to fill screen)
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-light-gray font-sans overflow-hidden flex flex-col">
      <StudentNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-dark mb-2">Virtual Office</h1>
          <p className="text-gray-500 font-semibold text-sm">Hover over workstations to view team assignments</p>
        </div>

        {/* Map Container */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-100 ${
            isFullscreen 
              ? 'fixed inset-0 z-[9999] w-screen h-screen flex border-0 rounded-none' 
              : 'relative w-full max-w-5xl aspect-[16/9] rounded-2xl shadow-2xl shadow-indigo-500/10 border-4 border-white'
          }`}
        >
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 text-gray-500 hover:text-royal hover:bg-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          {/* Background Image */}
          <img 
            src={bgImage}  
            alt="Virtual Office Layout" 
            className="w-full h-full object-cover" 
          />

          {/* User-Controlled Character */}
          <div 
            className="absolute z-[15] transition-all duration-100 ease-linear pointer-events-none"
            style={{ 
              top: `${position.y}%`, 
              left: `${position.x}%`,
              transform: 'translate(-50%, -50%)',
              width: '8%',
              height: 'auto',
              aspectRatio: '1/1'
            }}
          >
            <img 
              src={characterSprite} 
              alt="Avatar" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            />
          </div>

          {/* Render Hover Zones */}
          {workstations.map((ws) => (
            <div
              key={ws.id}
              className="absolute group z-10"
              style={{
                top: ws.top,
                left: ws.left,
                width: '12%',   // approximate width of a desk area
                height: '15%',  // approximate height of a desk area
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }}
            >
              {/* Invisible trigger area (can add debug background if needed: bg-red-500/20) */}
              <div className="w-full h-full rounded-xl transition-colors group-hover:bg-royal/10 border-2 border-transparent group-hover:border-royal/30"></div>

              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 w-max max-w-xs">
                <div className="bg-white px-4 py-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 relative">
                  {/* Tooltip arrow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>
                  
                  <div className="relative z-10">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 mb-1">
                      Workstation {ws.id}
                    </p>
                    <p className="text-base font-black text-dark leading-tight mb-1">
                      {ws.teamName}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 leading-snug">
                      <span className="text-gray-400 font-bold">PS:</span> {ws.ps}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Subtle indicator dot (optional, helps show it's interactive) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-royal rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-150 transition-transform"></div>
            </div>
          ))}

          {/* Judge's Office Hover Zone */}
          <a
            href={judgeOffice.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute group z-10"
            style={{
              top: judgeOffice.top,
              left: judgeOffice.left,
              width: '15%',
              height: '18%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer'
            }}
          >
            {/* Invisible trigger area */}
            <div className="w-full h-full rounded-xl transition-colors group-hover:bg-amber-500/10 border-2 border-transparent group-hover:border-amber-500/30"></div>

            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 w-max max-w-xs">
              <div className="bg-white px-4 py-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>
                <div className="relative z-10 text-center">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 mb-1">
                    Judge's Room
                  </p>
                  <p className="text-sm font-black text-dark leading-tight mb-1">
                    Join Waiting List
                  </p>
                  <p className="text-xs font-semibold text-gray-500 leading-snug">
                    Click to open Google Meet
                  </p>
                </div>
              </div>
            </div>
            
            {/* Subtle indicator dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-150 transition-transform"></div>
          </a>
        </div>
      </main>
    </div>
  );
}
