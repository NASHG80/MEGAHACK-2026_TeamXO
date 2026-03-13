import { useState, useEffect, useRef } from "react";

/* ═══════════════════ Pupil ═══════════════════ */

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "#111", forceLookX, forceLookY }: PupilProps) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const pos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  };
  const p = pos();
  return <div ref={ref} className="rounded-full" style={{ width: size, height: size, backgroundColor: pupilColor, transform: `translate(${p.x}px,${p.y}px)`, transition: "transform 0.1s ease-out" }} />;
};

/* ═══════════════════ EyeBall ═══════════════════ */

interface EyeBallProps {
  size?: number; pupilSize?: number; maxDistance?: number;
  eyeColor?: string; pupilColor?: string; isBlinking?: boolean;
  forceLookX?: number; forceLookY?: number;
}

const EyeBall = ({ size = 20, pupilSize = 7, maxDistance = 5, eyeColor = "white", pupilColor = "#111", isBlinking = false, forceLookX, forceLookY }: EyeBallProps) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const pos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  };
  const p = pos();
  return (
    <div ref={ref} className="rounded-full flex items-center justify-center"
      style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: "hidden", transition: "height 0.1s ease-out" }}>
      {!isBlinking && <div className="rounded-full" style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor, transform: `translate(${p.x}px,${p.y}px)`, transition: "transform 0.1s ease-out" }} />}
    </div>
  );
};

/* ═══════════════════ AnimatedCharactersPanel ═══════════════════ */

export interface AnimatedCharactersPanelProps {
  /** Whether the user is currently focused in a text field */
  isTyping?: boolean;
  /** Current value of the password field */
  passwordValue?: string;
  /** Whether the password is currently visible (eye icon toggled on) */
  passwordVisible?: boolean;
  /** Left panel caption */
  caption?: { title: string; subtitle: string };
}

export default function AnimatedCharactersPanel({
  isTyping = false,
  passwordValue = "",
  passwordVisible = false,
  caption = { title: "Welcome to HackFlow", subtitle: "Sign in to access your hackathons, manage teams, and track submissions." },
}: AnimatedCharactersPanelProps) {
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [lookEachOther, setLookEachOther] = useState(false);
  const [purplePeeking, setPurplePeeking] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef  = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  /* mouse */
  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  /* purple blink */
  useEffect(() => {
    const tick = (): ReturnType<typeof setTimeout> => {
      return setTimeout(() => { setPurpleBlink(true); setTimeout(() => { setPurpleBlink(false); tick(); }, 150); }, Math.random() * 4000 + 3000);
    };
    const t = tick(); return () => clearTimeout(t);
  }, []);

  /* black blink */
  useEffect(() => {
    const tick = (): ReturnType<typeof setTimeout> => {
      return setTimeout(() => { setBlackBlink(true); setTimeout(() => { setBlackBlink(false); tick(); }, 150); }, Math.random() * 4000 + 3500);
    };
    const t = tick(); return () => clearTimeout(t);
  }, []);

  /* look at each other when typing */
  useEffect(() => {
    if (isTyping) {
      setLookEachOther(true);
      const t = setTimeout(() => setLookEachOther(false), 800);
      return () => clearTimeout(t);
    } else {
      setLookEachOther(false);
    }
  }, [isTyping]);

  /* purple peeking at revealed password */
  useEffect(() => {
    if (passwordValue.length > 0 && passwordVisible) {
      const t = setTimeout(() => {
        setPurplePeeking(true);
        setTimeout(() => setPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else {
      setPurplePeeking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordValue, passwordVisible, purplePeeking]);

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 3);
    return {
      faceX:   Math.max(-15, Math.min(15,  dx / 20)),
      faceY:   Math.max(-10, Math.min(10,  dy / 30)),
      bodySkew: Math.max(-6,  Math.min(6, -dx / 120)),
    };
  };

  const pp = calcPos(purpleRef), bp = calcPos(blackRef), yp = calcPos(yellowRef), op = calcPos(orangeRef);
  const isPwdVisible = passwordValue.length > 0 && passwordVisible;
  const isPwdHidden  = passwordValue.length > 0 && !passwordVisible;

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-royal to-royal-dark flex-col items-center justify-center p-12 relative overflow-hidden">
      {/* blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Characters stage */}
      <div className="relative z-10" style={{ width: 480, height: 360 }}>

        {/* ── Purple ── */}
        <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: 60, width: 160,
            height: isTyping || isPwdHidden ? 400 : 360,
            backgroundColor: "#6C3FF5", borderRadius: "10px 10px 0 0", zIndex: 1,
            transform: isPwdVisible
              ? "skewX(0deg)"
              : isTyping || isPwdHidden
              ? `skewX(${(pp.bodySkew || 0) - 12}deg) translateX(36px)`
              : `skewX(${pp.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}>
          <div className="absolute flex gap-7 transition-all duration-700 ease-in-out"
            style={{ left: isPwdVisible ? 18 : lookEachOther ? 50 : 40 + pp.faceX, top: isPwdVisible ? 32 : lookEachOther ? 60 : 36 + pp.faceY }}>
            {[0, 1].map(i => (
              <EyeBall key={i} size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#1a1a1a" isBlinking={purpleBlink}
                forceLookX={isPwdVisible ? (purplePeeking ? 4 : -4) : lookEachOther ? 3 : undefined}
                forceLookY={isPwdVisible ? (purplePeeking ? 5 : -4) : lookEachOther ? 4 : undefined} />
            ))}
          </div>
        </div>

        {/* ── Black ── */}
        <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: 210, width: 110, height: 280,
            backgroundColor: "#2D2D2D", borderRadius: "8px 8px 0 0", zIndex: 2,
            transform: isPwdVisible
              ? "skewX(0deg)"
              : lookEachOther
              ? `skewX(${(bp.bodySkew || 0) * 1.5 + 10}deg) translateX(18px)`
              : isTyping || isPwdHidden
              ? `skewX(${(bp.bodySkew || 0) * 1.5}deg)`
              : `skewX(${bp.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}>
          <div className="absolute flex gap-5 transition-all duration-700 ease-in-out"
            style={{ left: isPwdVisible ? 9 : lookEachOther ? 30 : 22 + bp.faceX, top: isPwdVisible ? 26 : lookEachOther ? 11 : 28 + bp.faceY }}>
            {[0, 1].map(i => (
              <EyeBall key={i} size={15} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#1a1a1a" isBlinking={blackBlink}
                forceLookX={isPwdVisible ? -4 : lookEachOther ? 0 : undefined}
                forceLookY={isPwdVisible ? -4 : lookEachOther ? -4 : undefined} />
            ))}
          </div>
        </div>

        {/* ── Orange ── */}
        <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: 0, width: 210, height: 180,
            backgroundColor: "#FF9B6B", borderRadius: "105px 105px 0 0", zIndex: 3,
            transform: isPwdVisible ? "skewX(0deg)" : `skewX(${op.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}>
          <div className="absolute flex gap-7 transition-all duration-200 ease-out"
            style={{ left: isPwdVisible ? 44 : 72 + (op.faceX || 0), top: isPwdVisible ? 76 : 80 + (op.faceY || 0) }}>
            {[0, 1].map(i => (
              <Pupil key={i} size={11} maxDistance={4} pupilColor="#1a1a1a"
                forceLookX={isPwdVisible ? -5 : undefined} forceLookY={isPwdVisible ? -4 : undefined} />
            ))}
          </div>
        </div>

        {/* ── Yellow ── */}
        <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: 272, width: 130, height: 210,
            backgroundColor: "#E8D754", borderRadius: "65px 65px 0 0", zIndex: 4,
            transform: isPwdVisible ? "skewX(0deg)" : `skewX(${yp.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}>
          <div className="absolute flex gap-5 transition-all duration-200 ease-out"
            style={{ left: isPwdVisible ? 18 : 46 + (yp.faceX || 0), top: isPwdVisible ? 32 : 36 + (yp.faceY || 0) }}>
            {[0, 1].map(i => (
              <Pupil key={i} size={11} maxDistance={4} pupilColor="#1a1a1a"
                forceLookX={isPwdVisible ? -5 : undefined} forceLookY={isPwdVisible ? -4 : undefined} />
            ))}
          </div>
          {/* mouth */}
          <div className="absolute h-[3px] w-16 bg-[#1a1a1a] rounded-full transition-all duration-200 ease-out"
            style={{ left: isPwdVisible ? 8 : 34 + (yp.faceX || 0), top: isPwdVisible ? 80 : 82 + (yp.faceY || 0) }} />
        </div>
      </div>

      {/* Caption */}
      <div className="relative z-10 text-center mt-12">
        <h2 className="text-2xl font-bold text-white mb-2">{caption.title}</h2>
        <p className="text-blue-200/80 text-sm leading-relaxed max-w-xs mx-auto">{caption.subtitle}</p>
      </div>
    </div>
  );
}
