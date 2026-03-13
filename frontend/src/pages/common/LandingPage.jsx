import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  QrCode,
  UserCheck,
  Users,
  ClipboardList,
  FileText,
  ListChecks,
  CalendarCheck,
  Award,
  GraduationCap,
  Building2,
  CheckCircle2,
  Trophy,
  Calendar,
  Rocket,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import heroImg from '../../assets/hero-illustration.png';

/* ═══════════════════ ANIMATION VARIANTS ═══════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ═══════════════════════ DATA ═══════════════════════ */

const features = [
  { icon: ShieldCheck, title: 'Student Verification', description: 'Aadhaar and college ID verification ensures only real students participate.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: LayoutDashboard, title: 'Smart Hackathon Management', description: 'Manage teams, submissions, evaluations and results from one dashboard.', color: 'bg-blue-50 text-royal' },
  { icon: QrCode, title: 'QR Based Event Operations', description: 'QR codes for gate entry, workspace allocation and food distribution.', color: 'bg-violet-50 text-violet-600' },
];

const steps = [
  { icon: UserCheck,    label: 'Student Verification' },
  { icon: Users,        label: 'Team Formation' },
  { icon: ClipboardList,label: 'Hackathon Registration' },
  { icon: FileText,     label: 'PPT Submission' },
  { icon: ListChecks,   label: 'Shortlisting' },
  { icon: CalendarCheck,label: 'Offline Event Management' },
  { icon: Award,        label: 'Certificate Generation' },
];

const userTypes = [
  { icon: GraduationCap, title: 'For Students', description: 'Find hackathons, build teams, and grow your portfolio.', features: ['Discover hackathons', 'Join teams', 'Submit projects', 'Receive certificates'], accent: 'border-royal', iconBg: 'bg-royal/5 text-royal', buttonClass: 'bg-royal text-white hover:bg-royal-light', buttonText: 'Get Started as Student' },
  { icon: Building2, title: 'For Organizers', description: 'Create, manage, and scale your hackathons effortlessly.', features: ['Create hackathons', 'Manage participants', 'Evaluate submissions', 'Generate certificates'], accent: 'border-dark', iconBg: 'bg-dark/5 text-dark', buttonClass: 'bg-dark text-white hover:bg-gray-800', buttonText: 'Get Started as Organizer' },
];

const hackathons = [
  { name: 'CodeStorm 2026', organizer: 'IIT Bombay', prize: '₹5,00,000', deadline: 'March 25, 2026', tag: 'Open', tagColor: 'bg-emerald-50 text-emerald-700' },
  { name: 'InnoVerse Hack', organizer: 'BITS Pilani', prize: '₹3,00,000', deadline: 'April 10, 2026', tag: 'Closing Soon', tagColor: 'bg-amber-50 text-amber-700' },
  { name: 'HackIndia National', organizer: 'NASSCOM', prize: '₹10,00,000', deadline: 'May 1, 2026', tag: 'Featured', tagColor: 'bg-royal/5 text-royal' },
];

/* ═══════════════════════ HERO ═══════════════════════ */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-royal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-royal-light/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — slides in from left */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
            <motion.div variants={fadeLeft} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal/5 border border-royal/10">
              <Sparkles size={14} className="text-royal" />
              <span className="text-xs font-semibold text-royal tracking-wide uppercase">All-in-one Hackathon Platform</span>
            </motion.div>

            <motion.h1 variants={fadeLeft} className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-dark leading-[1.1] tracking-tight">
              Manage Hackathons Seamlessly — <span className="text-royal">From Registration to Certificates</span>
            </motion.h1>

            <motion.p variants={fadeLeft} className="text-lg text-gray-600 leading-relaxed max-w-xl">
              A unified platform for student verification, team formation, submissions, QR based entry, meal tracking and automated certificate generation.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <a href="#hackathons" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal-light transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Explore Hackathons <ArrowRight size={16} />
              </a>
              <a href="#cta" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-royal border-2 border-royal/20 rounded-xl hover:border-royal hover:bg-royal/5 transition-all duration-200">
                Organize a Hackathon
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
              <div className="text-center"><p className="text-2xl font-bold text-dark">50+</p><p className="text-xs text-gray-500">Hackathons Hosted</p></div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center"><p className="text-2xl font-bold text-dark">10K+</p><p className="text-xs text-gray-500">Students Registered</p></div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center"><p className="text-2xl font-bold text-dark">100+</p><p className="text-xs text-gray-500">Colleges</p></div>
            </motion.div>
          </motion.div>

          {/* Right — slides in from right + scale */}
          <motion.div initial={{ opacity: 0, x: 100, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }} className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-royal/10 to-royal-light/10 rounded-3xl blur-2xl scale-95" />
              <img src={heroImg} alt="Students collaborating at a hackathon" className="relative w-full h-auto rounded-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ FEATURES ═══════════════════ */

function Features() {
  return (
    <section id="features" className="bg-light-gray py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-royal uppercase tracking-widest mb-3">Why HackFlow?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
            Everything You Need in <span className="text-royal">One Platform</span>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Streamline every aspect of hackathon management with powerful tools built for organizers and participants alike.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={i === 0 ? fadeLeft : i === 2 ? fadeRight : fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="bg-white rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(30,58,138,0.1)] transition-shadow duration-300 group"
            >
              <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }} className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-6`}>
                <feature.icon size={22} />
              </motion.div>
              <h3 className="text-lg font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════ HOW IT WORKS ═══════════════════ */

function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress (0-1) across 500vh to active step index (0-6)
  const activeStepFloat = useTransform(scrollYProgress, [0.1, 0.9], [0, 6]);

  return (
    <section ref={containerRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex items-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-semibold text-royal uppercase tracking-widest mb-3">Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">How It <span className="text-royal">Works</span></h2>
            <p className="mt-4 text-gray-600 leading-relaxed">A streamlined 7-step process from verification to certification.</p>
          </motion.div>

          <div className="flex flex-nowrap justify-center items-start gap-2 pt-4">
            {steps.map((step, i) => (
              <StepItem key={step.label} step={step} index={i} total={steps.length} activeStepFloat={activeStepFloat} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="max-w-lg mx-auto mt-12">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-royal to-blue-500 rounded-full"
                style={{ width: useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']) }}
              />
            </div>
            <motion.p className="text-center text-xs text-gray-400 mt-3 font-medium">
              Scroll to explore each step
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Individual step that reacts to scroll position */
function StepItem({ step, index, total, activeStepFloat }) {
  const isActive = useTransform(activeStepFloat, (v) => Math.round(v) === index);
  const scale = useTransform(activeStepFloat, (v) => {
    const dist = Math.abs(v - index);
    if (dist < 0.5) return 1.25;
    if (dist < 1) return 1 + 0.25 * (1 - dist);
    return 1;
  });
  const opacity = useTransform(activeStepFloat, (v) => {
    const dist = Math.abs(v - index);
    return dist < 1 ? 1 : 0.5;
  });

  // Connector fill
  const connectorWidth = useTransform(activeStepFloat, (v) => {
    if (v >= index + 1) return '100%';
    if (v > index) return `${(v - index) * 100}%`;
    return '0%';
  });

  return (
    <div className="flex items-start">
      <motion.div
        style={{ scale, opacity }}
        className="flex flex-col items-center w-28 sm:w-32"
      >
        <div className="relative">
          <motion.div
            style={{
              backgroundColor: useTransform(isActive, (a) => a ? '#1E3A8A' : 'rgba(30,58,138,0.05)'),
              borderColor: useTransform(isActive, (a) => a ? '#1E3A8A' : 'rgba(30,58,138,0.2)'),
              boxShadow: useTransform(isActive, (a) => a ? '0 8px 30px rgba(30,58,138,0.35)' : '0 0 0 transparent'),
            }}
            className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200"
          >
            <motion.div
              style={{ color: useTransform(isActive, (a) => a ? '#FFFFFF' : '#1E3A8A') }}
            >
              <step.icon size={22} />
            </motion.div>
          </motion.div>
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-royal text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
            {index + 1}
          </span>
        </div>
        <motion.p
          style={{
            color: useTransform(isActive, (a) => a ? '#1E3A8A' : '#111111'),
            fontWeight: useTransform(isActive, (a) => a ? 800 : 600),
          }}
          className="mt-4 text-xs text-center leading-snug"
        >
          {step.label}
        </motion.p>
      </motion.div>

      {/* Connector with animated fill */}
      {index < total - 1 && (
        <div className="hidden sm:flex items-center mt-7">
          <div className="relative w-8 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-royal to-blue-500 rounded-full"
              style={{ width: connectorWidth }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ USER TYPES ═══════════════════ */

function UserTypes() {
  return (
    <section id="user-types" className="bg-light-gray py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-royal uppercase tracking-widest mb-3">Who It's For</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">Built for <span className="text-royal">Everyone</span></h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Whether you're a student looking for opportunities or an organizer managing events — HackFlow has you covered.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {userTypes.map((type, i) => (
            <motion.div
              key={type.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={i === 0 ? fadeLeft : fadeRight}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className={`bg-white rounded-2xl p-8 border-t-4 ${type.accent} shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(30,58,138,0.1)] transition-shadow duration-300`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${type.iconBg} mb-5`}>
                <type.icon size={22} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{type.title}</h3>
              <p className="text-sm text-gray-600 mb-6">{type.description}</p>
              <ul className="space-y-3 mb-8">
                {type.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`w-full py-3 rounded-xl text-sm font-semibold ${type.buttonClass} transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer`}>
                {type.buttonText}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ FEATURED HACKATHONS ═══════════════ */

function FeaturedHackathons() {
  return (
    <section id="hackathons" className="bg-white py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-royal uppercase tracking-widest mb-3">Explore</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">Featured <span className="text-royal">Hackathons</span></h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Discover trending hackathons and register before the deadline.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hackathons.map((hack, i) => (
            <motion.div
              key={hack.name}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(30,58,138,0.1)] transition-shadow duration-300 group"
            >
              <div className="h-1.5 bg-gradient-to-r from-royal to-royal-light" />
              <div className="p-7">
                <span className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full ${hack.tagColor} mb-4`}>{hack.tag}</span>
                <h3 className="text-lg font-bold text-dark mb-1">{hack.name}</h3>
                <p className="text-sm text-gray-500 mb-5">by {hack.organizer}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Trophy size={16} className="text-amber-500" />
                    <span>Prize Pool: <span className="font-semibold text-dark">{hack.prize}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Calendar size={16} className="text-royal" />
                    <span>Deadline: <span className="font-semibold text-dark">{hack.deadline}</span></span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-royal border-2 border-royal/20 hover:bg-royal hover:text-white hover:border-royal transition-all duration-200 cursor-pointer group-hover:border-royal">
                  Register Now <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════ CTA ═══════════════════════ */

function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-royal py-20 lg:py-24">
      <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }} className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
      <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }} className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={stagger} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={scaleUp} className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-8">
          <Rocket size={26} className="text-white" />
        </motion.div>

        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Run Your Next Hackathon the <span className="text-blue-200">Smart Way</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-lg text-blue-100/80 max-w-2xl mx-auto mb-10">
          Join thousands of organizers who trust HackFlow to deliver seamless hackathon experiences.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
          <motion.a whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} href="#" className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-royal bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
            Create Hackathon <ArrowRight size={16} />
          </motion.a>
          <motion.a whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} href="#hackathons" className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/60 transition-all duration-200">
            Explore Hackathons
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════ LANDING PAGE ═══════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <UserTypes />
      <FeaturedHackathons />
      <CTA />
      <Footer />
    </div>
  );
}