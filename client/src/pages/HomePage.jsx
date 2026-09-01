import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Shield,
  Zap,
  Globe2,
  Clock,
  Lock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  PhoneCall,
  KeyRound,
  Radio,
  Plus,
  Star,
  Quote,
  Sparkles,
  Award,
  Users,
  Network,
  Cloud,
  Database,
  Smartphone,
  Minus,
} from "lucide-react";
import { Link } from "react-router-dom";
import imageObject from "../utils/image";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States", dial: "+1", price: "₦3500", region: "Americas", code: "US", confidence: 98 },
  { flag: "🇬🇧", name: "United Kingdom", dial: "+44", price: "₦2020", region: "Europe", code: "GB", confidence: 97 },
  { flag: "🇳🇬", name: "Nigeria", dial: "+234", price: "₦2800", region: "Africa", code: "NG", confidence: 99 },
  { flag: "🇩🇪", name: "Germany", dial: "+49", price: "₦4050", region: "Europe", code: "DE", confidence: 96 },
  { flag: "🇮🇳", name: "India", dial: "+91", price: "₦1990", region: "Asia", code: "IN", confidence: 98 },
  { flag: "🇧🇷", name: "Brazil", dial: "+55", price: "₦3210", region: "Americas", code: "BR", confidence: 95 },
  { flag: "🇯🇵", name: "Japan", dial: "+81", price: "₦2520", region: "Asia", code: "JP", confidence: 97 },
  { flag: "🇿🇦", name: "South Africa", dial: "+27", price: "₦1330", region: "Africa", code: "ZA", confidence: 96 },
  { flag: "🇫🇷", name: "France", dial: "+33", price: "₦3800", region: "Europe", code: "FR", confidence: 94 },
  { flag: "🇨🇦", name: "Canada", dial: "+1", price: "₦3600", region: "Americas", code: "CA", confidence: 95 },
  { flag: "🇦🇺", name: "Australia", dial: "+61", price: "₦4200", region: "Asia", code: "AU", confidence: 93 },
  { flag: "🇰🇪", name: "Kenya", dial: "+254", price: "₦1950", region: "Africa", code: "KE", confidence: 97 },
];

const REGIONS = ["All", "Africa", "Europe", "Americas", "Asia"];

const LEDGER = [
  { flag: "🇺🇸", country: "United States", number: "+1 202 •••• 91", time: "2s ago", carrier: "AT&T" },
  { flag: "🇬🇧", country: "United Kingdom", number: "+44 7700 •••• 12", time: "5s ago", carrier: "Vodafone" },
  { flag: "🇳🇬", country: "Nigeria", number: "+234 803 •••• 44", time: "1s ago", carrier: "MTN" },
  { flag: "🇮🇳", country: "India", number: "+91 98100 ••••5", time: "8s ago", carrier: "Airtel" },
  { flag: "🇩🇪", country: "Germany", number: "+49 152 •••• 03", time: "3s ago", carrier: "Deutsche Telekom" },
  { flag: "🇧🇷", country: "Brazil", number: "+55 11 9•••• 82", time: "6s ago", carrier: "Claro" },
  { flag: "🇯🇵", country: "Japan", number: "+81 90 •••• 67", time: "4s ago", carrier: "NTT Docomo" },
  { flag: "🇿🇦", country: "South Africa", number: "+27 71 •••• 29", time: "7s ago", carrier: "Vodacom" },
  { flag: "🇫🇷", country: "France", number: "+33 6•••• 45", time: "9s ago", carrier: "Orange" },
  { flag: "🇨🇦", country: "Canada", number: "+1 647 •••• 23", time: "11s ago", carrier: "Rogers" },
  { flag: "🇦🇺", country: "Australia", number: "+61 4•••• 78", time: "13s ago", carrier: "Telstra" },
  { flag: "🇰🇪", country: "Kenya", number: "+254 7•••• 56", time: "15s ago", carrier: "Safaricom" },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a country",
    body: "Browse 150+ countries by coverage, delivery speed and price. Stock updates in real time.",
    icon: Globe2,
    detail: "Live inventory across 6 continents",
  },
  {
    n: "02",
    title: "Get a number instantly",
    body: "Numbers are issued in seconds, no paperwork. Use it for one verification or keep it on lease.",
    icon: PhoneCall,
    detail: "Average issue time: 3.2 seconds",
  },
  {
    n: "03",
    title: "Receive the code",
    body: "Codes land in your dashboard instantly, usually in under ten seconds, with delivery receipts.",
    icon: KeyRound,
    detail: "99.9% delivery success rate",
  },
  {
    n: "04",
    title: "Verify & continue",
    body: "Use the code instantly. Numbers are released back to the pool after use.",
    icon: CheckCircle2,
    detail: "Seamless verification flow",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Sub-10s delivery",
    body: "Codes are routed over redundant carrier links, so verification rarely waits.",
    metric: "4.2s average",
    color: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    icon: Shield,
    title: "Carrier-verified lines",
    body: "Every number is sourced from licensed carriers, not spoofed or recycled ranges.",
    metric: "100% verified",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: Globe2,
    title: "150+ countries",
    body: "From major markets to long-tail regions, with live stock so you never buy dead numbers.",
    metric: "6 continents",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Numbers are never reused across two active verifications on our side.",
    metric: "Zero reuse",
    color: "from-pink-500/20 to-pink-500/5",
  },
  {
    icon: Clock,
    title: "24/7 delivery desk",
    body: "A human reviews stuck deliveries around the clock, not just business hours.",
    metric: "24/7 support",
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    icon: Award,
    title: "Trusted globally",
    body: "Used by teams across 150+ countries for reliable OTP verification.",
    metric: "4.2M+ issued",
    color: "from-purple-500/20 to-purple-500/5",
  },
];

const STATS = [
  { target: 4200000, label: "Numbers issued", format: (n) => (n / 1000000).toFixed(1) + "M+" },
  { target: 150, label: "Countries covered", format: (n) => Math.round(n) + "+" },
  { target: 99.9, label: "Delivery rate", format: (n) => n.toFixed(1) + "%" },
  { target: 4.2, label: "Avg. delivery (s)", format: (n) => n.toFixed(1) + "s" },
];

const TESTIMONIALS = [
  {
    quote:
      "We switched our onboarding flow over in an afternoon. Delivery times dropped and support tickets about missing codes basically disappeared.",
    name: "Emeka O.",
    role: "Founder, Kestrel Pay",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvuGrhsm3CrHq7jQM7Xz35arAmit1kGULZj-Aa2WhsOQ&s=10",
  },
  {
    quote:
      "The service is exactly what we needed — predictable, reliable, and we shipped a working integration quickly.",
    name: "Daniella R.",
    role: "Backend lead, Nimbus",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWnl4i0tynHjqzvejcNOXxEaByysStVgAlAvBe4HDv7Q&s=10",
  },
  {
    quote:
      "Coverage in markets our old provider barely touched. That alone paid for the switch inside the first month.",
    name: "Priya M.",
    role: "Growth, Lumen Labs",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAN0xAM41rWk_jFp5AjN9Y8x-NpucLRr60sdqK8oPFrA&s=10",
  },
  {
    quote: "Their delivery desk caught a routing issue on a Sunday night before we even noticed it ourselves.",
    name: "Tomiwa A.",
    role: "CTO, Anchorpoint",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjPFEukcpbsOe9IVZr57HqcDIme0wFDlYnFXt4ZQtDag&s=10",
  },
];

const FAQS = [
  {
    q: "How fast do codes actually arrive?",
    a: "Most codes are delivered in under ten seconds. We route over redundant carrier links per country and show live delivery stats on your dashboard. Average delivery time is 4.2 seconds globally.",
  },
  {
    q: "Are these real numbers or VOIP lines?",
    a: "They're real, carrier-verified lines sourced directly from licensed telecom partners in each country — not spoofed ranges or recycled VOIP numbers. Each number comes with carrier-grade reliability.",
  },
  {
    q: "Can I use one number for more than one verification?",
    a: "You can rent a number short-term for a single use or keep it on lease for repeated verifications, depending on the plan and country. Short-term rentals start from ₦1,330 per number.",
  },
  {
    q: "What happens if a code doesn't arrive?",
    a: "Our delivery desk monitors stuck deliveries around the clock. Failed deliveries are automatically retried on an alternate route or refunded. We maintain a 99.9% success rate.",
  },
  {
    q: "What countries do you cover?",
    a: "We cover 150+ countries across Africa, Europe, Asia, Americas, and Oceania. New countries are added weekly based on customer demand and carrier partnerships.",
  },
];

const USE_CASES = [
  {
    icon: Users,
    title: "User Verification",
    desc: "Verify new users during signup flow",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Lock,
    title: "2FA Authentication",
    desc: "Add an extra layer of security",
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    icon: Smartphone,
    title: "App Testing",
    desc: "Test SMS flows in your applications",
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    icon: Network,
    title: "Market Research",
    desc: "Access markets globally",
    color: "bg-orange-500/20 text-orange-400",
  },
  {
    icon: Database,
    title: "Data Enrichment",
    desc: "Enrich user profiles with verified numbers",
    color: "bg-pink-500/20 text-pink-400",
  },
  {
    icon: Cloud,
    title: "Migration Support",
    desc: "Transition users to new platforms",
    color: "bg-indigo-500/20 text-indigo-400",
  },
];

const COMPARISON = [
  { feature: "Carrier-verified numbers", us: true, them: false },
  { feature: "Sub-10s delivery", us: true, them: false },
  { feature: "150+ countries", us: true, them: true },
  { feature: "24/7 support", us: true, them: false },
  { feature: "Privacy-first", us: true, them: false },
  { feature: "Volume pricing", us: true, them: false },
  { feature: "Real-time stock updates", us: true, them: false },
  { feature: "No hidden fees", us: true, them: false },
];

/* ------------------------------------------------------------------ */
/*  Optimized Small building blocks                                    */
/* ------------------------------------------------------------------ */

// Memoized DigitSlot to prevent unnecessary re-renders
const DigitSlot = React.memo(({ target, delay }) => {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      if (n > 9) {
        setDisplay(target);
        clearInterval(id);
        return;
      }
      setDisplay(String(Math.floor(Math.random() * 10)));
    }, 55);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span className="flex h-11 w-8 items-center justify-center rounded-md border border-[#C9A24B]/35 bg-[#1C1917] font-mono text-lg text-[#F0CB6E] shadow-inner md:h-12 md:w-9 md:text-xl">
      {display}
    </span>
  );
});

// Optimized OtpReveal with will-change for better performance
const OtpReveal = React.memo(({ code = "574192", interval = 4200 }) => {
  const [cycle, setCycle] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  const digits = useMemo(() => code.split(""), [code, cycle]);

  return (
    <div className="flex gap-1.5 will-change-transform" key={cycle}>
      {digits.map((d, i) => (
        <DigitSlot key={i} target={d} delay={i * 0.05} />
      ))}
    </div>
  );
});

// Optimized LedgerTicker with reduced animation complexity
const LedgerTicker = React.memo(() => {
  const items = [...LEDGER, ...LEDGER];
  return (
    <div className="relative h-[400px] overflow-hidden rounded-2xl border border-[#C9A24B]/25 bg-[#131110] shadow-xl will-change-transform">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-[#C9A24B]/15 bg-[#131110]/80 px-6 py-3 backdrop-blur-sm">
        <span className="text-xs font-medium uppercase tracking-widest text-[#9B948A]">Live Activity Feed</span>
        <span className="flex items-center gap-2 text-xs text-[#6FCF97]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6FCF97] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6FCF97]"></span>
          </span>
          {LEDGER.length} active numbers
        </span>
      </div>
      <div className="mt-12 flex flex-col animate-scroll will-change-transform">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-3.5 hover:bg-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xl">{it.flag}</span>
              <div>
                <p className="text-sm font-medium text-[#F5EFE0]">{it.country}</p>
                <p className="font-mono text-xs text-[#9B948A]">{it.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#9B948A]">{it.time}</span>
              <span className="rounded-full bg-[#C9A24B]/15 px-2 py-0.5 text-[10px] text-[#F0CB6E]">
                {it.carrier}
              </span>
              <div className="flex items-center gap-2">
                <LedgerCode />
                <CheckCircle2 className="h-4 w-4 text-[#6FCF97]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-12 h-12 bg-gradient-to-b from-[#131110] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#131110] to-transparent" />
    </div>
  );
});

const LedgerCode = React.memo(() => {
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  return <span className="font-mono text-sm tracking-widest text-[#F0CB6E]">{code}</span>;
});

// Optimized Magnetic with reduced spring complexity
const Magnetic = React.memo(({ children, className = "" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 15 });
  const springY = useSpring(y, { stiffness: 100, damping: 15 });

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.2);
    y.set((e.clientY - r.top - r.height / 2) * 0.2);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
});

// Optimized TiltHeroCard with reduced motion complexity
const TiltHeroCard = React.memo(() => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-60, 60], [5, -5]);
  const rotateY = useTransform(x, [-60, 60], [-5, 5]);

  function onMove(e) {
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div style={{ perspective: 1000 }} className="relative mx-auto w-full max-w-md will-change-transform">
      <div className="absolute inset-0 -rotate-6 translate-x-3 translate-y-4 rounded-2xl border border-[#C9A24B]/15 bg-[#131110]" />
      <div className="absolute inset-0 rotate-3 translate-x-6 translate-y-8 rounded-2xl border border-[#C9A24B]/10 bg-[#131110] opacity-70" />

      <FloatBadge className="-left-8 top-6 hidden md:block" delay={0.2}>
        <span className="flex items-center gap-1.5 text-[#F0CB6E]">
          <Shield className="h-3.5 w-3.5" /> Carrier verified
        </span>
      </FloatBadge>
      <FloatBadge className="-right-6 bottom-10 hidden md:block" duration={5} delay={0.6}>
        <span className="flex items-center gap-1.5 text-[#6FCF97]">
          <Zap className="h-3.5 w-3.5" /> &lt;10s delivery
        </span>
      </FloatBadge>

      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl border border-[#C9A24B]/35 p-6 shadow-2xl md:p-7 will-change-transform"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C9A24B]/14 via-[#C9A24B]/5 to-transparent" />
        <div className="absolute inset-0 rounded-2xl border border-[#C9A24B]/35" />
        <div className="rounded-2xl bg-[#131110] p-5 md:p-6" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-9 rounded-[4px]"
                style={{ background: "linear-gradient(135deg, #F0CB6E, #C9A24B 55%, #7A6530)" }}
              />
              <span className="font-display text-sm tracking-wide text-[#F5EFE0]">Wave Verify</span>
            </div>
            <Radio className="h-4 w-4 animate-pulse text-[#6FCF97]" />
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B948A]">Live number</p>
            <p className="mt-1 font-mono text-lg text-[#F5EFE0] md:text-xl">🇬🇧 +44 7700 •••• 12</p>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B948A]">Incoming code</p>
            <div className="mt-2">
              <OtpReveal />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#6FCF97]/30 bg-[#6FCF97]/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-[#6FCF97]" />
            <span className="text-xs text-[#6FCF97]">Delivered in 4.2s</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

const FloatBadge = React.memo(({ children, className = "", duration = 4, delay = 0 }) => {
  return (
    <div
      className={`absolute rounded-full border border-[#C9A24B]/35 bg-[#131110]/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm animate-float ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      {children}
    </div>
  );
});

const CountryCard = React.memo(({ c, index }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(700px) rotateX(${py * -5}deg) rotateY(${px * 5}deg)`,
    });
  }
  function onLeave() {
    setStyle({ transform: "perspective(700px) rotateX(0) rotateY(0)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className="group relative rounded-xl border border-[#C9A24B]/22 bg-[#131110] p-5 transition-[border-color,box-shadow] duration-300 hover:border-[#C9A24B]/60 hover:shadow-[0_20px_40px_-15px_rgba(201,162,75,0.3)] will-change-transform"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{c.flag}</span>
        <span className="rounded-full border border-[#6FCF97]/35 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#6FCF97]">
          Live
        </span>
      </div>
      <p className="mt-4 text-base text-[#F5EFE0] header-font" style={{ fontSize: '18px', lineHeight: '22px' }}>{c.name}</p>
      <p className="font-mono text-xs text-[#9B948A]">{c.dial}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-[#9B948A]">Carrier: {c.carrier || "Multiple"}</span>
        <span className="text-xs text-[#6FCF97]">● {c.confidence || 95}%</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[#F0CB6E]">{c.price}</span>
        <ChevronRight className="h-4 w-4 text-[#C9A24B] transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
});

// Optimized Reveal with Intersection Observer
const Reveal = React.memo(({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px", amount: 0.1 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [inView, delay, isVisible]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
});

// Optimized AnimatedCounter with reduced updates
const AnimatedCounter = React.memo(({ target, format, duration = 1600 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    
    function step(ts) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    }
    
    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [inView, target, duration]);

  return <span ref={ref} className="will-change-transform">{format(value)}</span>;
});

// Redesigned FAQ Item with modern look and responsive typography
const FaqItem = React.memo(({ q, a, isOpen, onClick }) => {
  return (
    <motion.div 
      className="border-b border-[#C9A24B]/10 last:border-b-0 hover:bg-[#C9A24B]/5 transition-colors duration-200"
      initial={false}
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 text-left group"
      >
        <span className=" text-[#F5EFE0] text-sm sm:text-base md:text-lg lg:text-xl leading-snug sm:leading-normal flex-1 pr-2">
          {q}
        </span>
        <span className={`shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-[#C9A24B]/30 bg-[#C9A24B]/10 text-[#C9A24B] transition-all duration-300 group-hover:border-[#C9A24B] group-hover:bg-[#C9A24B]/20 ${isOpen ? 'rotate-45 border-[#C9A24B] bg-[#C9A24B]/20' : ''}`}>
          <Plus className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 transition-transform duration-300 ${isOpen ? 'rotate-0' : ''}`} />
        </span>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
              <div className="w-12 h-0.5 sm:w-16 md:w-20 bg-gradient-to-r from-[#C9A24B] to-transparent mb-3 sm:mb-4"></div>
              <p className="text-[#9B948A] text-xs sm:text-sm md:text-base leading-relaxed sm:leading-relaxed md:leading-relaxed body-font">
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const GlassCard = React.memo(({ children, className = "" }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#C9A24B]/20 bg-[#131110]/80 backdrop-blur-sm ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A24B]/5 via-transparent to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const HomePage = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [region, setRegion] = useState("All");
  const [faqOpen, setFaqOpen] = useState(0);

  const filteredCountries = useMemo(() => {
    return region === "All" ? COUNTRIES : COUNTRIES.filter((c) => c.region === region);
  }, [region]);

  // Memoize particles to prevent re-renders
  const particles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0A0908] font-sans text-[#F5EFE0]">
      {/* Optimized Background with fewer layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,75,0.06)_0%,_transparent_70%)]" />
        
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,162,75,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,162,75,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(rgba(201,162,75,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Reduced animated orbs with transform3d for GPU acceleration */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#C9A24B]/5 blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-[#C9A24B]/5 blur-3xl animate-orb-2" />
        <div className="absolute left-1/2 top-2/3 h-64 w-64 rounded-full bg-[#C9A24B]/5 blur-3xl animate-orb-3" />
        
        {/* Reduced floating particles with CSS animations */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute h-1 w-1 rounded-full bg-[#C9A24B] animate-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400&display=swap');
        
        /* Header font - Space Grotesk 700 */
        .header-font {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 72px;
          line-height: 72px;
        }
        
        /* Body font - Inter 400 */
        .body-font {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 400;
          font-size: 18px;
          line-height: 29px;
        }
        
        /* Responsive header sizes */
        .header-font-mobile {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 36px;
          line-height: 40px;
        }
        
        @media (min-width: 768px) {
          .header-font-mobile {
            font-size: 72px;
            line-height: 72px;
          }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #F0CB6E, #C9A24B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Optimized CSS animations with GPU acceleration */
        @keyframes float {
          0%, 100% { transform: translateY(0) translateZ(0); }
          50% { transform: translateY(-10px) translateZ(0); }
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
          will-change: transform;
        }
        
        @keyframes orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -30px) scale(1.1); }
        }
        
        @keyframes orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 30px) scale(1.05); }
        }
        
        @keyframes orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.15); }
        }
        
        .animate-orb-1 {
          animation: orb-1 20s ease-in-out infinite;
          will-change: transform;
        }
        
        .animate-orb-2 {
          animation: orb-2 25s ease-in-out infinite 2s;
          will-change: transform;
        }
        
        .animate-orb-3 {
          animation: orb-3 18s ease-in-out infinite 4s;
          will-change: transform;
        }
        
        @keyframes particle-float {
          0% { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
          50% { transform: translateY(-80px) translateX(20px) scale(1); opacity: 0.3; }
          100% { transform: translateY(-160px) translateX(-10px) scale(0); opacity: 0; }
        }
        
        .animate-particle {
          animation: particle-float ease-in-out infinite;
          will-change: transform, opacity;
        }
        
        @keyframes scroll {
          0% { transform: translateY(0) translateZ(0); }
          100% { transform: translateY(-50%) translateZ(0); }
        }
        
        .animate-scroll {
          animation: scroll 25s linear infinite;
          will-change: transform;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

   {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#C9A24B]/25 bg-[#0A0908]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
             <img 
               src={imageObject.Logo2} 
               alt="Wave Verify Logo" 
               className="w-[100px] h-[50px] border border-[#C9A24B]/25 rounded-lg drop-shadow-[0_0_8px_rgba(201,162,75,0.3)] brightness-110 contrast-125" 
             />
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[#9B948A] md:flex body-font" style={{ fontSize: '16px' }}>
            <a href="#countries" className="transition-colors hover:text-[#F0CB6E]">Numbers</a>
            <a href="#how" className="transition-colors hover:text-[#F0CB6E]">How it works</a>
            <a href="#features" className="transition-colors hover:text-[#F0CB6E]">Platform</a>
            <a href="#faq" className="transition-colors hover:text-[#F0CB6E]">FAQ</a>
          </nav>

          <div className="hidden items-center gap-4 md:flex body-font" style={{ fontSize: '16px' }}>
            <Link to="/login">
              <button className="text-sm text-[#9B948A] transition-colors hover:text-white">Sign in</button>
            </Link>
            <Magnetic>
              <Link to="/signup">
                <button className="rounded-lg bg-[#C9A24B] px-4 py-2 text-sm font-medium text-[#0A0908] transition-transform hover:scale-105">
                  Get a number
                </button>
              </Link>
            </Magnetic>
          </div>

          <button className="text-white md:hidden" onClick={() => setNavOpen((o) => !o)}>
            {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[#C9A24B]/25 md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-4 text-sm text-[#9B948A] body-font">
                <a href="#countries">Numbers</a>
                <a href="#how">How it works</a>
                <a href="#features">Platform</a>
                <a href="#faq">FAQ</a>
                <Link to="/signup">
                  <button className="mt-2 w-full rounded-lg bg-[#C9A24B] px-4 py-2 text-center font-medium text-[#0A0908]">
                    Get a number
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="relative z-10 overflow-hidden px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[#C9A24B]/20 blur-3xl" />
        
        <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A24B]/35 px-4 py-1.5 text-xs text-[#F0CB6E] body-font" style={{ fontSize: '14px' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6FCF97] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6FCF97]"></span>
              </span>
              150+ countries · 99.9% delivery · live stock
            </div>

            <h1 className="header-font-mobile leading-[1.1]">
              Numbers the world <br />
              <span className="gradient-text">answers to.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-[#9B948A] md:text-lg body-font">
              Rent real, carrier-verified phone numbers from almost any country and receive OTP codes in seconds. 
              Built for teams who verify accounts at scale.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link to="/signup">
                  <button className="flex items-center gap-2 rounded-lg bg-[#C9A24B] px-8 py-3.5 text-sm font-medium text-[#0A0908] transition-transform hover:scale-105 body-font">
                    Get your first number
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </Magnetic>
              <a
                href="#features"
                className="rounded-lg border border-[#C9A24B]/35 px-6 py-3.5 text-sm font-medium text-[#F5EFE0] transition-all hover:border-[#C9A24B] hover:bg-[#C9A24B]/10 body-font"
              >
                Explore platform
              </a>
            </div>

            <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/5 pt-8">
              <div>
                <p className="header-font text-3xl text-[#F0CB6E]" style={{ fontSize: '30px', lineHeight: '36px' }}>99.9%</p>
                <p className="text-xs text-[#9B948A] body-font">Delivery rate</p>
              </div>
              <div>
                <p className="header-font text-3xl text-[#F0CB6E]" style={{ fontSize: '30px', lineHeight: '36px' }}>&lt;10s</p>
                <p className="text-xs text-[#9B948A] body-font">Avg. delivery</p>
              </div>
              <div>
                <p className="header-font text-3xl text-[#F0CB6E]" style={{ fontSize: '30px', lineHeight: '36px' }}>150+</p>
                <p className="text-xs text-[#9B948A] body-font">Countries</p>
              </div>
            </div>
          </div>

          <TiltHeroCard />
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Platform metrics</p>
            <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">Numbers that speak volumes</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="text-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-[#C9A24B]/5 blur-xl" />
                  <p className="relative header-font text-4xl text-[#F0CB6E] md:text-5xl" style={{ fontSize: '40px', lineHeight: '48px' }}>
                    <AnimatedCounter target={s.target} format={s.format} />
                  </p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-widest text-[#9B948A] body-font">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Live activity</p>
            <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">Verifications, as they happen.</h2>
            <p className="mt-3 text-[#9B948A] body-font">
              A live feed of numbers being issued and codes delivered across our network right now.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <LedgerTicker />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">How it works</p>
            <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">Four steps, no waiting room.</h2>
          </Reveal>

          <div className="relative grid gap-12 md:grid-cols-4 md:gap-8">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-[#C9A24B]/25 md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08} className="relative group">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A24B]/40 bg-[#131110] header-font text-xl text-[#F0CB6E] shadow-lg transition-all group-hover:border-[#C9A24B] group-hover:shadow-[0_0_30px_rgba(201,162,75,0.3)]">
                  {s.n}
                </div>
                <s.icon className="mt-5 h-5 w-5 text-[#C9A24B]" />
                <h3 className="mt-3 header-font text-xl group-hover:text-[#F0CB6E] transition-colors" style={{ fontSize: '24px', lineHeight: '28px' }}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9B948A] body-font">{s.body}</p>
                <p className="mt-3 text-xs text-[#C9A24B]/70 body-font">{s.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 px-6 py-16 md:py-24 bg-[#131110]/50">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Use cases</p>
            <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">Built for every verification need</h2>
            <p className="mt-3 text-[#9B948A] body-font">From startups to enterprises, our platform adapts to your scale</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {USE_CASES.map((uc, i) => (
              <Reveal key={uc.title} delay={i * 0.04}>
                <div className="flex flex-col items-center rounded-xl border border-[#C9A24B]/20 bg-[#131110] p-6 text-center transition-all hover:border-[#C9A24B]/60 hover:shadow-[0_10px_30px_-10px_rgba(201,162,75,0.3)] hover:scale-105 hover:-translate-y-1">
                  <div className={`rounded-full p-3 ${uc.color}`}>
                    <uc.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 header-font text-sm" style={{ fontSize: '16px', lineHeight: '20px' }}>{uc.title}</h3>
                  <p className="mt-1 text-xs text-[#9B948A] body-font">{uc.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Why choose us</p>
            <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">The smarter choice</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <GlassCard className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#C9A24B]/20">
                      <th className="py-4 text-left text-sm text-[#9B948A] body-font">Feature</th>
                      <th className="py-4 text-center text-sm text-[#F0CB6E] header-font" style={{ fontSize: '16px' }}>Wave Verify</th>
                      <th className="py-4 text-center text-sm text-[#9B948A] body-font">Other providers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((item, i) => (
                      <tr key={item.feature} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-sm text-[#F5EFE0] body-font">{item.feature}</td>
                        <td className="py-4 text-center">
                          {item.us ? (
                            <CheckCircle2 className="inline h-5 w-5 text-[#6FCF97]" />
                          ) : (
                            <span className="text-[#9B948A]">—</span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          {item.them ? (
                            <CheckCircle2 className="inline h-5 w-5 text-[#9B948A]" />
                          ) : (
                            <span className="text-[#9B948A]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-20 md:py-28 bg-[#131110]/50">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Platform</p>
            <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">Built like infrastructure, not a trick.</h2>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06}>
                <div className="group relative rounded-xl border border-[#C9A24B]/22 bg-[#131110] p-6 transition-all hover:border-[#C9A24B]/60 hover:shadow-[0_20px_40px_-15px_rgba(201,162,75,0.2)] hover:scale-[1.02] hover:-translate-y-1">
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${f.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#C9A24B]/12 transition-colors group-hover:bg-[#C9A24B]/20">
                      <f.icon className="h-6 w-6 text-[#F0CB6E]" />
                    </div>
                    <h3 className="mt-4 header-font text-lg" style={{ fontSize: '20px', lineHeight: '24px' }}>{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#9B948A] body-font">{f.body}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs font-medium text-[#F0CB6E] header-font" style={{ fontSize: '14px' }}>{f.metric}</span>
                      <span className="h-1 w-1 rounded-full bg-[#C9A24B]/30" />
                      <span className="text-xs text-[#9B948A] body-font">● Available</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Countries - Reduced font sizes */}
      <section id="countries" className="relative z-10 px-6 py-20 md:py-28 bg-[#131110]/50">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Global coverage</p>
              <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl" style={{ fontSize: '32px', lineHeight: '38px' }}>Popular numbers, ready now.</h2>
              <p className="mt-2 text-sm text-[#9B948A] body-font" style={{ fontSize: '14px' }}>Real-time availability across 150+ countries</p>
            </div>
            <Link to="/signup" className="flex items-center gap-1 text-sm text-[#F0CB6E] hover:text-[#F0CB6E]/80 body-font" style={{ fontSize: '14px' }}>
              View all countries <ChevronRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal className="mb-8 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors body-font ${
                  region === r
                    ? "border-[#C9A24B] bg-[#C9A24B] text-[#0A0908]"
                    : "border-[#C9A24B]/25 text-[#9B948A] hover:border-[#C9A24B]/60"
                }`}
                style={{ fontSize: '13px' }}
              >
                {r}
              </button>
            ))}
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {filteredCountries.map((c, i) => (
                <CountryCard key={c.name} c={c} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20 md:py-28">
        <Reveal className="mx-auto mb-14 max-w-xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">Testimonials</p>
          <h2 className="mt-3 header-font-mobile text-3xl md:text-4xl">Loved by teams shipping fast.</h2>
        </Reveal>
        <div className="grid gap-6 px-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <GlassCard className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <img 
                    src={t.avatar} 
                    alt={t.name} 
                    className="h-12 w-12 rounded-full border-2 border-[#C9A24B]/30"
                    loading="lazy"
                  />
                  <div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-[#F0CB6E] text-[#F0CB6E]" />
                      ))}
                    </div>
                  </div>
                </div>
                <Quote className="mt-4 h-5 w-5 text-[#C9A24B]/60" />
                <p className="mt-2 text-sm leading-relaxed text-[#F5EFE0]/90 body-font">{t.quote}</p>
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-sm font-medium text-[#F5EFE0] header-font" style={{ fontSize: '16px' }}>{t.name}</p>
                  <p className="text-xs text-[#9B948A] body-font">{t.role}</p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ - Redesigned with responsive typography */}
      <section id="faq" className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 md:py-28 bg-[#131110]/50">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-8 sm:mb-10 md:mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B] body-font">FAQ</p>
            <h2 className="mt-3 header-font-mobile text-2xl sm:text-3xl md:text-4xl" style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: '1.2' }}>
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#9B948A] body-font max-w-2xl mx-auto">
              Everything you need to know about getting started with Wave Verify
            </p>
          </Reveal>
          
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[#C9A24B]/15 bg-[#131110]/90 backdrop-blur-sm shadow-2xl shadow-[#C9A24B]/5 overflow-hidden">
              {/* Decorative header */}
              <div className="hidden sm:flex items-center gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-[#C9A24B]/10 bg-[#C9A24B]/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs text-[#9B948A]/60 ml-2 font-mono">faq@waveverify</span>
                <span className="ml-auto text-[10px] text-[#9B948A]/40 font-mono">~/questions</span>
              </div>
              
              {/* FAQ Items */}
              {FAQS.map((f, i) => (
                <FaqItem
                  key={f.q}
                  q={f.q}
                  a={f.a}
                  isOpen={faqOpen === i}
                  onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
                />
              ))}
            </div>
          </Reveal>
          
          {/* Bottom CTA */}
          <Reveal delay={0.2}>
            <div className="mt-6 sm:mt-8 md:mt-10 text-center">
              <p className="text-xs sm:text-sm text-[#9B948A] body-font">
                Still have questions? <a href="#" className="text-[#F0CB6E] hover:text-[#F0CB6E]/80 transition-colors underline-offset-2 hover:underline">Contact our support team</a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 md:py-28">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#C9A24B]/30 bg-gradient-to-br from-[#131110] to-[#1C1712] px-8 py-16 text-center md:py-24">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#C9A24B]/25 blur-3xl" />
            <div className="relative">
              <h2 className="header-font-mobile text-4xl md:text-6xl">Ready to verify anything, anywhere?</h2>
              <p className="relative mx-auto mt-4 max-w-md text-[#9B948A] body-font">
                Get started with a real carrier-verified number in seconds.
              </p>
              <Magnetic className="relative mt-8">
                <Link to="/signup">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-[#C9A24B] px-8 py-3.5 text-sm font-medium text-[#0A0908] transition-transform hover:scale-105 body-font">
                    Get your number now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </Magnetic>
              <p className="mt-4 text-xs text-[#9B948A] body-font">No hidden fees. Pay only for what you use.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#C9A24B]/15 bg-[#131110] px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-8 rounded-[3px]"
                style={{ background: "linear-gradient(135deg, #F0CB6E, #C9A24B 55%, #7A6530)" }}
              />
              <span className="header-font text-base" style={{ fontSize: '18px', lineHeight: '22px' }}>Wave Verify</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-[#9B948A] body-font">
              Real, carrier-verified numbers for OTP delivery across 150+ countries.
            </p>
            <div className="mt-4 flex gap-3">
              <div className="h-8 w-8 rounded-full border border-[#C9A24B]/20 flex items-center justify-center hover:border-[#C9A24B] transition-colors">
                <span className="text-xs">TW</span>
              </div>
              <div className="h-8 w-8 rounded-full border border-[#C9A24B]/20 flex items-center justify-center hover:border-[#C9A24B] transition-colors">
                <span className="text-xs">GH</span>
              </div>
              <div className="h-8 w-8 rounded-full border border-[#C9A24B]/20 flex items-center justify-center hover:border-[#C9A24B] transition-colors">
                <span className="text-xs">IN</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#9B948A] body-font">Product</p>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-[#9B948A] body-font">
              <a href="#countries" className="hover:text-[#F0CB6E] transition-colors">Numbers</a>
              <a href="#features" className="hover:text-[#F0CB6E] transition-colors">Platform</a>
              <a href="#how" className="hover:text-[#F0CB6E] transition-colors">How it works</a>
            </nav>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#9B948A] body-font">Company</p>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-[#9B948A] body-font">
              <a href="#" className="hover:text-[#F0CB6E] transition-colors">About</a>
              <a href="#faq" className="hover:text-[#F0CB6E] transition-colors">FAQ</a>
              <a href="#" className="hover:text-[#F0CB6E] transition-colors">Support</a>
            </nav>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#9B948A] body-font">Legal</p>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-[#9B948A] body-font">
              <Link to="/terms" className="hover:text-[#F0CB6E] transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-[#F0CB6E] transition-colors">Privacy Policy</Link>
            </nav>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/5 pt-6 text-xs text-[#9B948A] body-font">
          © {new Date().getFullYear()} Wave Verify. All numbers rented, not owned.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;