import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
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
} from "lucide-react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States", dial: "+1", price: "₦3500" },
  { flag: "🇬🇧", name: "United Kingdom", dial: "+44", price: "₦2020" },
  { flag: "🇳🇬", name: "Nigeria", dial: "+234", price: "₦2800" },
  { flag: "🇩🇪", name: "Germany", dial: "+49", price: "₦4050" },
  { flag: "🇮🇳", name: "India", dial: "+91", price: "₦1990" },
  { flag: "🇧🇷", name: "Brazil", dial: "+55", price: "₦3210" },
  { flag: "🇯🇵", name: "Japan", dial: "+81", price: "₦2520" },
  { flag: "🇿🇦", name: "South Africa", dial: "+27", price: "₦1330" },
];

const LEDGER = [
  { flag: "🇺🇸", country: "United States", number: "+1 202 •••• 91" },
  { flag: "🇬🇧", country: "United Kingdom", number: "+44 7700 •••• 12" },
  { flag: "🇳🇬", country: "Nigeria", number: "+234 803 •••• 44" },
  { flag: "🇮🇳", country: "India", number: "+91 98100 ••••5" },
  { flag: "🇩🇪", country: "Germany", number: "+49 152 •••• 03" },
  { flag: "🇧🇷", country: "Brazil", number: "+55 11 9•••• 82" },
  { flag: "🇯🇵", country: "Japan", number: "+81 90 •••• 67" },
  { flag: "🇿🇦", country: "South Africa", number: "+27 71 •••• 29" },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a country",
    body: "Browse 150+ countries by coverage, delivery speed and price. Stock updates in real time.",
    icon: Globe2,
  },
  {
    n: "02",
    title: "Get a number instantly",
    body: "Numbers are issued in seconds, no paperwork. Use it for one verification or keep it on lease.",
    icon: PhoneCall,
  },
  {
    n: "03",
    title: "Receive the code",
    body: "Codes land in your dashboard or via API, usually in under ten seconds, with delivery receipts.",
    icon: KeyRound,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Sub-10s delivery",
    body: "Codes are routed over redundant carrier links, so verification rarely waits.",
  },
  {
    icon: Shield,
    title: "Carrier-verified lines",
    body: "Every number is sourced from licensed carriers, not spoofed or recycled ranges.",
  },
  {
    icon: Globe2,
    title: "150+ countries",
    body: "From major markets to long-tail regions, with live stock so you never buy dead numbers.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Numbers are never reused across two active verifications on our side.",
  },
  {
    icon: Clock,
    title: "24/7 delivery desk",
    body: "A human reviews stuck deliveries around the clock, not just business hours.",
  },
];

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function DigitSlot({ target, delay }) {
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
    <motion.span
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex h-11 w-8 items-center justify-center rounded-md border border-[#C9A24B]/35 bg-[#1C1917] font-mono text-lg text-[#F0CB6E] shadow-inner md:h-12 md:w-9 md:text-xl"
    >
      {display}
    </motion.span>
  );
}

function OtpReveal({ code = "574192", interval = 4200 }) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className="flex gap-1.5" key={cycle}>
      {code.split("").map((d, i) => (
        <DigitSlot key={i} target={d} delay={i * 0.05} />
      ))}
    </div>
  );
}

function LedgerTicker() {
  const items = [...LEDGER, ...LEDGER];
  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-[#C9A24B]/25 bg-[#131110]">
      <motion.div
        className="flex flex-col"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{it.flag}</span>
              <div>
                <p className="text-sm font-medium text-[#F5EFE0]">
                  {it.country}
                </p>
                <p className="font-mono text-xs text-[#9B948A]">
                  {it.number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LedgerCode />
              <CheckCircle2 className="h-4 w-4 text-[#6FCF97]" />
            </div>
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#131110] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#131110] to-transparent" />
    </div>
  );
}

function LedgerCode() {
  const [code] = useState(() =>
    String(Math.floor(100000 + Math.random() * 900000))
  );
  return (
    <span className="font-mono text-sm tracking-widest text-[#F0CB6E]">
      {code}
    </span>
  );
}

function TiltHeroCard() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [8, -8]);
  const rotateY = useTransform(x, [-80, 80], [-8, 8]);

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
    <div style={{ perspective: 1200 }} className="relative mx-auto w-full max-w-md">
      {/* stacked back cards for depth */}
      <div className="absolute inset-0 -rotate-6 translate-x-3 translate-y-4 rounded-2xl border border-[#C9A24B]/15 bg-[#131110]" />
      <div className="absolute inset-0 rotate-3 translate-x-6 translate-y-8 rounded-2xl border border-[#C9A24B]/10 bg-[#131110] opacity-70" />

      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl border border-[#C9A24B]/35 p-6 shadow-2xl md:p-7"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C9A24B]/14 via-[#C9A24B]/5 to-transparent" />
        <div className="absolute inset-0 rounded-2xl border border-[#C9A24B]/35" />
        <div
          className="rounded-2xl bg-[#131110] p-5 md:p-6"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* SIM chip */}
              <div
                className="h-7 w-9 rounded-[4px]"
                style={{
                  background:
                    "linear-gradient(135deg, #F0CB6E, #C9A24B 55%, #7A6530)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
                }}
              />
              <span className="font-display text-sm tracking-wide text-[#F5EFE0]">
                Wave Verify
              </span>
            </div>
            <Radio className="h-4 w-4 animate-pulse text-[#6FCF97]" />
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B948A]">
              Live number
            </p>
            <p className="mt-1 font-mono text-lg text-[#F5EFE0] md:text-xl">
              🇬🇧 +44 7700 •••• 12
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9B948A]">
              Incoming code
            </p>
            <div className="mt-2">
              <OtpReveal />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#6FCF97]/30 bg-[#6FCF97]/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-[#6FCF97]" />
            <span className="text-xs text-[#6FCF97]">
              Delivered in 4.2s
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CountryCard({ c, index }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(700px) rotateX(${py * -7}deg) rotateY(${px * 7}deg) translateZ(6px)`,
    });
  }
  function onLeave() {
    setStyle({ transform: "perspective(700px) rotateX(0) rotateY(0)" });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      className="group relative rounded-xl border border-[#C9A24B]/22 bg-[#131110] p-5 transition-[border-color,box-shadow] duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{c.flag}</span>
        <span className="rounded-full border border-[#6FCF97]/35 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#6FCF97]">
          Live
        </span>
      </div>
      <p className="mt-4 font-display text-lg text-[#F5EFE0]">
        {c.name}
      </p>
      <p className="font-mono text-xs text-[#9B948A]">
        {c.dial}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[#F0CB6E]">
          {c.price}
        </span>
        <ChevronRight className="h-4 w-4 text-[#C9A24B] transition-transform group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

const HomePage = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0A0908] text-[#F5EFE0] font-sans relative overflow-x-hidden">
      {/* Golden Dim Background Net/Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Main golden glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,75,0.06)_0%,_transparent_70%)]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,162,75,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,162,75,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Diagonal lines pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                rgba(201,162,75,0.4) 0px,
                rgba(201,162,75,0.4) 1px,
                transparent 1px,
                transparent 20px
              ),
              repeating-linear-gradient(
                -45deg,
                rgba(201,162,75,0.4) 0px,
                rgba(201,162,75,0.4) 1px,
                transparent 1px,
                transparent 20px
              )
            `,
          }}
        />

        {/* Subtle golden dots pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(rgba(201,162,75,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating golden orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C9A24B]/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9A24B]/5 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-[#C9A24B]/5 blur-3xl animate-pulse delay-2000" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* -------------------------------------------------- Nav */}
      <header className="sticky top-0 z-50 border-b border-[#C9A24B]/25 bg-[#0A0908]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-8 rounded-[3px]"
              style={{
                background:
                  "linear-gradient(135deg, #F0CB6E, #C9A24B 55%, #7A6530)",
              }}
            />
            <span className="font-display text-lg tracking-wide">Wave Verify</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[#9B948A] md:flex">
            <a href="#countries" className="transition-colors hover:text-[#F0CB6E]">
              Numbers
            </a>
            <a href="#how" className="transition-colors hover:text-[#F0CB6E]">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-[#F0CB6E]">
              Platform
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#F0CB6E]">
              Pricing
            </a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link to='/login'>
              <button className="text-sm text-[#9B948A] hover:text-white transition-colors">
                Sign in
              </button>
            </Link>
            <Link to='/signup'>
              <button className="rounded-lg bg-[#C9A24B] px-4 py-2 text-sm font-medium text-[#0A0908] transition-transform hover:-translate-y-0.5">
                Get a number
              </button>
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setNavOpen((o) => !o)}>
            {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#C9A24B]/25 md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-4 text-sm text-[#9B948A]">
                <a href="#countries">Numbers</a>
                <a href="#how">How it works</a>
                <a href="#features">Platform</a>
                <a href="#pricing">Pricing</a>
                <Link to='/signup'>
                  <button className="mt-2 w-full rounded-lg bg-[#C9A24B] px-4 py-2 text-center font-medium text-[#0A0908]">
                    Get a number
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* -------------------------------------------------- Hero */}
      <section className="relative z-10 overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[#C9A24B]/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A24B]/35 px-3 py-1 text-xs text-[#F0CB6E]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#6FCF97]" />
              150+ countries · live stock
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl leading-[1.1] md:text-6xl"
            >
              Numbers the world{" "}
              <span className="text-[#F0CB6E]">answers to.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-md text-base leading-relaxed text-[#9B948A] md:text-lg"
            >
              Rent a real, carrier-verified phone number from almost any
              country and receive OTP codes in seconds. Built for teams who
              verify accounts at scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link to="/signup">
                <button className="flex items-center gap-2 rounded-lg bg-[#C9A24B] px-6 py-3 text-sm font-medium text-[#0A0908] transition-transform hover:-translate-y-0.5">
                  Get your first number
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/5 pt-6"
            >
              <div>
                <p className="font-display text-2xl text-[#F0CB6E]">
                  99.9%
                </p>
                <p className="text-xs text-[#9B948A]">
                  Delivery rate
                </p>
              </div>
              <div>
                <p className="font-display text-2xl text-[#F0CB6E]">
                  &lt;10s
                </p>
                <p className="text-xs text-[#9B948A]">
                  Avg. delivery
                </p>
              </div>
              <div>
                <p className="font-display text-2xl text-[#F0CB6E]">
                  150+
                </p>
                <p className="text-xs text-[#9B948A]">
                  Countries
                </p>
              </div>
            </motion.div>
          </div>

          <TiltHeroCard />
        </div>
      </section>

      {/* -------------------------------------------------- Ledger */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B]">
              The ledger
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Verifications, as they happen.
            </h2>
            <p className="mt-3 text-[#9B948A]">
              A live feed of numbers being issued and codes being delivered
              across our network right now.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <LedgerTicker />
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------- How it works */}
      <section id="how" className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B]">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Three steps, no waiting room.
            </h2>
          </Reveal>

          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-[#C9A24B]/25 md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="relative">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A24B]/40 bg-[#131110] font-display text-lg text-[#F0CB6E]">
                  {s.n}
                </div>
                <s.icon className="mt-5 h-5 w-5 text-[#C9A24B]" />
                <h3 className="mt-3 font-display text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9B948A]">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Countries */}
      <section id="countries" className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B]">
                Coverage
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                Popular right now.
              </h2>
            </div>
            <Link
              to="/signup"
              className="flex items-center gap-1 text-sm text-[#F0CB6E]"
            >
              View all 150+ countries <ChevronRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {COUNTRIES.map((c, i) => (
              <CountryCard key={c.name} c={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Features */}
      <section id="features" className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A24B]">
              Platform
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Built like infrastructure, not a trick.
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 0.08}
                className="rounded-xl border border-[#C9A24B]/22 bg-[#131110] p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A24B]/12">
                  <f.icon className="h-5 w-5 text-[#F0CB6E]" />
                </div>
                <h3 className="mt-4 font-display text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9B948A]">
                  {f.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- CTA */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#C9A24B]/30 bg-[#131110] px-8 py-14 text-center md:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#C9A24B]/25 blur-3xl" />
          <h2 className="relative font-display text-3xl md:text-5xl">
            Ready to verify anything, anywhere?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[#9B948A]">
            Start with a free sandbox number, no card required. Scale up
            when you're ready to ship.
          </p>

          <Link to='/signup'>
            <button className="relative mt-8 inline-flex items-center gap-2 rounded-lg bg-[#C9A24B] px-7 py-3 text-sm font-medium text-[#0A0908] transition-transform hover:-translate-y-0.5">
              Create free account
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </Reveal>
      </section>

      {/* -------------------------------------------------- Footer */}
      <footer className="relative z-10 border-t border-[#C9A24B]/15 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-8 rounded-[3px]"
              style={{
                background:
                  "linear-gradient(135deg, #F0CB6E, #C9A24B 55%, #7A6530)",
              }}
            />
            <span className="font-display text-base">Wave Verify</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-[#9B948A]">
            <a href="#" className="cursor-pointer hover:text-[#F0CB6E]">Numbers</a>
            <Link to="/terms" className="cursor-pointer hover:text-[#F0CB6E]">terms and conditions</Link>
            <Link to="/privacy" className="cursor-pointer hover:text-[#F0CB6E]">privacy</Link>
            <a href="#" className="cursor-pointer hover:text-[#F0CB6E]">Status</a>
            <a href="#" className="cursor-pointer hover:text-[#F0CB6E]">Support</a>
          </nav>
          <p className="text-xs text-[#9B948A]">
            © {new Date().getFullYear()} Wave Verify. All numbers rented, not owned.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;