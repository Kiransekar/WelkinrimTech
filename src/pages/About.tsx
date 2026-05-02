// src/pages/About.tsx
// About Us — Premium timeline-based page with scroll animations

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import InvestorsSection from "@/components/InvestorsSection";
import Reveal from "@/components/Reveal";

// ─── Data ────────────────────────────────────────────────────────────────────

const MILESTONES = [
  {
    year: "2018",
    title: "Genesis",
    description:
      "Welkinrim Technologies founded in Chennai as a power electronics R&D company. Started as a service-based firm solving motor drive challenges across industries.",
    highlight: "Founded in Chennai",
  },
  {
    year: "2019",
    title: "Bootstrapped & Growing",
    description:
      "Bootstrapped and growing. Worked on motor control for automotive applications, building foundational expertise in drive systems.",
    highlight: "Motor Control · Automotive",
  },
  {
    year: "2020",
    title: "First Revenue & UAV Motor",
    description:
      "Progressed to work with listed companies and generated revenue. Designed and built the first BLDC motor prototype purpose-built for aerial drone propulsion — marking the shift from general power electronics to drone-specific solutions.",
    highlight: "First Revenue · BLDC Prototype",
  },
  {
    year: "2021",
    title: "Team & R&D Scale-up",
    description:
      "Expanded team and scaled R&D. Deepened expertise in FOC algorithms, thermal management, and magnet design.",
    highlight: "R&D Scaled",
  },
  {
    year: "2022",
    title: "Product-First Pivot",
    description:
      "Pivoted from service-based to product-focused company. Developed 16 propulsion system variants covering Micro, Small, and Medium drone categories. Invested in production tooling.",
    highlight: "16 Variants Developed",
  },
  {
    year: "2023",
    title: "IITM Association & Qualification",
    description:
      "Associated with IIT Madras for testing and qualification. Received Meity MSH Grant, advancing product validation and certification.",
    highlight: "Meity MSH Grant",
  },
  {
    year: "2024",
    title: "Oragadam Facility & Scale",
    description:
      "Moved to Oragadam manufacturing facility. Delivered 960+ propulsion units. Revenue scaled. Received TN SIPCOT Grant.",
    highlight: "960+ Units · TN SIPCOT Grant",
  },
  {
    year: "2025",
    title: "Institutional Funding & Qualification",
    description:
      "Secured institutional funding from GSF, CAN, and MSH. Motors tested at 5000m altitude and qualified. Expanded client base.",
    highlight: "5000m Alt Qualified",
  },
  {
    year: "2026",
    title: "Platform & Scale",
    description:
      "Launched the Drive Calculator Suite for the global engineering community. 25+ product variants spanning aerial, marine, and robotics. Scaling towards eVTOL propulsion.",
    highlight: "25+ Products Across 4 Industries",
  },
];

const TEAM = [
  {
    name: "Dinesh Natarajan",
    role: "Founder & CEO",
    bio: "Masters in Power Electronics · 10+ yrs R&D & commercialization · Ex CTO Swadha Energies · 2017 National Entrepreneur Award",
    initials: "DN",
    expertise: "Power Electronics · Motor Drives",
    image: "assets/team/dinesh.jpg",
    linkedin: "https://www.linkedin.com/in/dinesh-natarajan-41b71bb3/",
  },
  {
    name: "Govindraj",
    role: "Co Founder & Head of Projects & Motors",
    bio: "Masters in Power Electronics · 10+ yrs R&D · Specialist in machine design and motor drives",
    initials: "GR",
    expertise: "Machine Design · Special Motors",
    image: "assets/team/govindraj.jpg",
    linkedin: "https://www.linkedin.com/in/govindaraj1290/",
  },
  {
    name: "Keerthiga Dinesh",
    role: "Co Founder & Head of Operations",
    bio: "Bachelors in Electronics · 8+ yrs hardware design · Leads operations and production workflows",
    initials: "KD",
    expertise: "Hardware Design · Operations",
    image: "assets/team/keerthiga.jpeg",
    linkedin: "https://www.linkedin.com/in/keerthiga-dinesh-36793575/",
  },
  {
    name: "Akilesh Kumar",
    role: "Motor Control Lead",
    bio: "Master's from Madras Institute of Technology (MIT) · 5+ yrs in motor control algorithms · FOC and sensorless control",
    initials: "AK",
    expertise: "FOC Algorithms · Sensorless Control",
    image: "assets/team/akilesh.jpg",
    linkedin: "https://www.linkedin.com/in/akileshkumar/",
  },
];

const EXPERTISE_AREAS = [
  { title: "Power Electronics", items: ["Motor Drives", "Power Converters", "High & Low Voltage", "Industrial / EV / Drones"] },
  { title: "Machine Design", items: ["EM & ME Design", "High Freq. Magnetics", "Thermal & FEA", "Motor Design Software"] },
  { title: "Embedded Systems", items: ["ARM Controllers", "Embedded Firmware", "Sensored & Sensorless", "RL8 Series"] },
  { title: "Motion Control", items: ["Sine & FOC Control", "Motion Algorithms", "System Simulation", "Performance Optimization"] },
];


const USP_ITEMS = [
  "Vacuum Impregnation",
  "Dual Bearing Stability",
  "Magnesium Alloy Construction",
  "Custom Arc Magnets",
  "Metal Core PCB",
  "Predictive Maintenance",
  "Anti-Corrosion Treatment",
  "Single PCB Architecture",
];

// ─── Animated counter hook ───────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [started, target, duration]);

  return { count, ref };
}

// ─── Scroll-reveal wrapper ───────────────────────────────────────────────────


// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center md:text-left">
      <p className="text-2xl md:text-4xl font-black text-[#ffc812] leading-none" style={{ fontFamily: "Michroma, sans-serif" }}>
        {count}{suffix}
      </p>
      <p className="text-[9px] text-white/40 tracking-[0.25em] uppercase mt-2" style={{ fontFamily: "Michroma, sans-serif" }}>
        {label}
      </p>
    </div>
  );
}

// ─── Timeline milestone ──────────────────────────────────────────────────────

function TimelineNode({ milestone, index }: { milestone: typeof MILESTONES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative flex ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
      {/* Card */}
      <div className={`flex-1 md:w-[calc(50%-40px)] transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 translate-y-10 ${isLeft ? "md:-translate-x-8" : "md:translate-x-8"}`
      }`} style={{ transitionDelay: "0.12s" }}>
        <div className={`relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-6 md:p-7 hover:border-[#ffc812]/30 hover:bg-white/[0.06] transition-all duration-400 group ${
          isLeft ? "md:mr-10" : "md:ml-10"
        }`}>
          {/* Year + highlight */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className="px-4 py-1.5 bg-[#ffc812] text-black text-xs font-black tracking-widest"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-8deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>{milestone.year}</span>
            </div>
            <span className="text-[8px] text-[#ffc812]/60 tracking-widest uppercase hidden md:block"
                  style={{ fontFamily: "Michroma, sans-serif" }}>
              {milestone.highlight}
            </span>
          </div>

          <h3 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-[#ffc812] transition-colors"
              style={{ fontFamily: "Michroma, sans-serif" }}>
            {milestone.title}
          </h3>
          <p className="text-xs md:text-sm text-white/50 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
            {milestone.description}
          </p>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-0 right-0 w-12 h-[1px] bg-[#ffc812]/60" />
            <div className="absolute top-0 right-0 w-[1px] h-12 bg-[#ffc812]/60" />
          </div>
        </div>
      </div>

      {/* Timeline dot + connector */}
      <div className="hidden md:flex flex-col items-center w-20 flex-shrink-0 relative">
        <div className={`w-3.5 h-3.5 rounded-full border-[2.5px] border-[#ffc812] bg-[#0a0a0a] z-10 transition-all duration-500 shadow-[0_0_12px_rgba(255,200,18,0.3)] ${
          visible ? "scale-100" : "scale-0"
        }`} style={{ transitionDelay: "0.2s" }} />
        {/* Pulse ring */}
        <div className={`absolute w-7 h-7 rounded-full border border-[#ffc812]/20 z-0 transition-all duration-700 ${
          visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`} style={{ top: 0, transitionDelay: "0.35s" }} />
      </div>

      {/* Spacer */}
      <div className="hidden md:block flex-1 md:w-[calc(50%-40px)]" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function About() {
  const [, navigate] = useLocation();

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section id="about-hero" className="relative bg-[#0a0a0a] pt-28 md:pt-32 pb-20 md:pb-32 overflow-hidden min-h-[70vh] flex items-end">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#ffc812 1px, transparent 1px), linear-gradient(90deg, #ffc812 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-black/85" />
        {/* Diagonal accent line */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] border border-[#ffc812]/[0.04] rounded-full" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] border border-[#ffc812]/[0.03] rounded-full" />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 w-full">
          {/* Accent stripe */}
          <div className="w-12 h-0.5 bg-[#ffc812] mb-6" style={{ animation: "about-stripe 0.6s cubic-bezier(0.22,1,0.36,1) both" }} />

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <button onClick={() => navigate("/")}
              className="text-[#ffc812]/60 hover:text-[#ffc812] text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1 group"
              style={{ fontFamily: "Michroma, sans-serif" }}>
              <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Home
            </button>
            <span className="text-white/20 text-[10px]">/</span>
            <span className="text-[#ffc812] text-[10px] tracking-widest uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>About</span>
          </div>

          {/* Large title */}
          <div className="mb-6">

            <p className="text-[10px] tracking-[0.4em] uppercase text-[#ffc812]/80 mb-3" style={{ fontFamily: "Michroma, sans-serif" }}>
              Indigenously Developed
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95] mb-4" style={{ fontFamily: "Michroma, sans-serif" }}>
              Tomorrow's<br />
              <span className="text-[#ffc812]">Motor & Drive</span><br />
              Technology
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-xl leading-relaxed mt-6 text-justify" style={{ fontFamily: "Lexend, sans-serif" }}>
              From a service-based power electronics startup to India's indigenous drone
              propulsion OEM — building motors and drives that defend, deliver, and explore.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pt-10 border-t border-white/[0.08] mt-10">
            <StatCard value={2018} label="Founded" />
            <StatCard value={25} label="Engineers" />
            <StatCard value={3} label="Patents Filed" />
            <StatCard value={35} suffix="+" label="Product Variants" />
            <StatCard value={1200} suffix="+" label="Drone Components" />
            <StatCard value={15000} suffix="+" label="Units to Other Industries" />
          </div>
        </div>
      </section>

      {/* ── TIMELINE ───────────────────────────────────────────────────── */}
      <section id="about-timeline" className="bg-[#060606] py-20 md:py-32 relative overflow-hidden">
        {/* Subtle diagonal pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #ffc812 0, #ffc812 1px, transparent 0, transparent 50%)`,
          backgroundSize: "28px 28px",
        }} />

        <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative">
          <Reveal>
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-4 mb-5">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#ffc812]/60" />
                <span className="text-[#808080] text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                  The Journey
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#ffc812]/60" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                Building India's<br />
                <span className="text-[#ffc812]">Propulsion</span> Future
              </h2>
            </div>
          </Reveal>

          {/* Timeline spine + cards */}
          <div className="relative">
            {/* Desktop spine */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
              <div className="w-full h-full bg-gradient-to-b from-[#ffc812]/10 via-[#ffc812]/30 to-[#ffc812]/10" />
            </div>
            {/* Mobile spine */}
            <div className="md:hidden absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#ffc812]/10 via-[#ffc812]/30 to-[#ffc812]/10" />

            <div className="space-y-12 md:space-y-16">
              {MILESTONES.map((m, i) => (
                <TimelineNode key={m.year} milestone={m} index={i} />
              ))}
            </div>

            {/* End cap */}
            <div className="hidden md:flex justify-center mt-12">
              <div className="w-6 h-6 rounded-full border-2 border-[#ffc812]/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#ffc812]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USP STRIP ──────────────────────────────────────────────────── */}
      <section id="about-usp" className="bg-[#ffc812] py-8 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-8">
          {[...USP_ITEMS, ...USP_ITEMS].map((item, i) => (
            <span key={i} className="text-[11px] font-black text-black/70 tracking-[0.3em] uppercase flex-shrink-0 flex items-center gap-4"
                  style={{ fontFamily: "Michroma, sans-serif" }}>
              {item}
              <span className="w-1.5 h-1.5 bg-black/30 rotate-45 inline-block" />
            </span>
          ))}
        </div>
      </section>

      {/* ── CORE EXPERTISE ─────────────────────────────────────────────── */}
      <section id="about-expertise" className="bg-[#050505] py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#ffc812]" />
              <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                Engineering DNA
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-12" style={{ fontFamily: "Michroma, sans-serif" }}>
              Deep Domain <span className="text-[#ffc812]">Expertise</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERTISE_AREAS.map((area, i) => (
              <Reveal key={area.title} delay={i * 100} className="h-full">
                <div className="border border-white/10 p-6 h-full hover:border-[#ffc812]/20 hover:bg-white/[0.06] transition-all duration-400 group relative overflow-hidden bg-white/[0.03] backdrop-blur-sm flex flex-col">
                  {/* Background number */}
                  <span className="absolute -right-2 -top-4 text-[80px] font-black text-white/[0.03] leading-none select-none pointer-events-none group-hover:text-[#ffc812]/[0.08] group-hover:-translate-y-2 transition-all duration-500"
                        style={{ fontFamily: "Michroma, sans-serif" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10">
                    <div className="w-8 h-0.5 bg-[#ffc812] mb-4 group-hover:w-12 transition-all duration-300" />
                    <h3 className="text-sm font-bold text-white mb-4 tracking-wide uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {area.title}
                    </h3>
                    <ul className="space-y-2.5">
                      {area.items.map(item => (
                        <li key={item} className="flex items-center gap-2.5">
                          <div className="w-1 h-1 bg-[#ffc812] flex-shrink-0" />
                          <span className="text-xs text-white/50" style={{ fontFamily: "Lexend, sans-serif" }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ───────────────────────────────────────────────────────── */}
      <section id="about-team" className="bg-[#0a0a0a] py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
          <Reveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#ffc812]/60" />
                <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                  Leadership
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#ffc812]/60" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                The <span className="text-[#ffc812]">Core</span> Team
              </h2>
              <p className="text-sm text-white/40 mt-3 max-w-lg mx-auto" style={{ fontFamily: "Lexend, sans-serif" }}>
                Passionate engineers driven by a shared mission to indigenize propulsion technology.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <Reveal key={member.name} delay={i * 80} className="h-full">
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 overflow-hidden hover:bg-white/[0.06] hover:border-[#ffc812]/20 transition-all duration-400 group h-full flex flex-col">
                  {/* Top bar */}
                  <div className="h-1 bg-gradient-to-r from-[#ffc812] to-[#ffc812]/30 group-hover:to-[#ffc812] transition-all duration-500" />

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-black flex items-center justify-center mb-5 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(255,200,18,0.15)] transition-shadow duration-300">
                      {member.image ? (
                        <img 
                          src={`${import.meta.env.BASE_URL}${member.image}`} 
                          alt={member.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <span className="text-lg font-black text-[#ffc812] relative z-10 group-hover:text-black transition-colors duration-300"
                              style={{ fontFamily: "Michroma, sans-serif" }}>
                          {member.initials}
                        </span>
                      )}
                      {/* Fill animation on hover - only for non-image members */}
                      {!member.image && (
                        <div className="absolute inset-0 bg-[#ffc812] translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {member.name}
                    </h3>
                    <p className="text-[9px] text-[#ffc812] tracking-widest uppercase mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {member.role}
                    </p>
                    <p className="text-[9px] text-white/30 tracking-wider uppercase mb-4" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {member.expertise}
                    </p>
                    <div className="h-px bg-white/10 mb-3" />
                    <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
                      {member.bio}
                    </p>
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-[9px] text-white/40 tracking-wider uppercase hover:text-[#ffc812] transition-colors"
                        style={{ fontFamily: "Michroma, sans-serif" }}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BACKED BY ──────────────────────────────────────────────────── */}
      <InvestorsSection />

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section id="about-cta" className="bg-[#0a0a0a] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #ffc812, transparent 60%)" }} />
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[120px] md:text-[200px] font-black text-white/[0.015] leading-none whitespace-nowrap" style={{ fontFamily: "Michroma, sans-serif" }}>
            WELKINRIM
          </span>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative flex flex-col md:flex-row items-center justify-between gap-10">
          <Reveal>
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#ffc812] mb-3" style={{ fontFamily: "Michroma, sans-serif" }}>
                Ready to Collaborate?
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: "Michroma, sans-serif" }}>
                Let's solve the problem<br /><span className="text-[#ffc812]">together.</span>
              </h3>
              <p className="text-sm text-white/30 mt-4 max-w-md leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
                From custom motor design to volume manufacturing — our engineering team is ready for your toughest challenges.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex flex-wrap gap-4">
              <a href="mailto:dineshnatarajan@welkinrim.com"
                className="px-8 py-3.5 bg-[#ffc812] text-black text-[10px] tracking-widest uppercase font-bold hover:bg-[#e0b212] transition-all duration-300 inline-block"
                style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-8deg)" }}>
                <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>Get In Touch</span>
              </a>
              <button onClick={() => navigate("/products")}
                className="px-8 py-3.5 border border-white/20 text-white text-[10px] tracking-widest uppercase font-medium hover:border-[#ffc812] hover:text-[#ffc812] transition-all duration-300"
                style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-8deg)" }}>
                <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>View Products</span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* Page-level animations */}
      <style>{`
        @keyframes about-stripe {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </>
  );
}
