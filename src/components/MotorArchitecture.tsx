import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const processData = [
  {
    title: "Manufacturing",
    items: ["Stator parts", "Rotor parts", "ESC PCB Fab"],
    x: 12.5, // % position
  },
  {
    title: "Assembly",
    items: [
      "Magnet assembly",
      "Winding",
      "Motor Assembly",
      "ESC PCB Assembly",
      "Firmware flashing",
      "Motor ESC integration (IPS Only)",
    ],
    x: 37.5,
  },
  {
    title: "Testing QC",
    items: [
      "EOL Testing",
      "Performance testing",
      "Test report preparation",
      "QC Report approval",
    ],
    x: 62.5,
  },
  {
    title: "Shipment",
    items: ["DTDC", "BLUEDART", "UPS"],
    x: 87.5,
  },
];

const GOLD = "#ffc812";
const BEZIER = [0.34, 1.56, 0.64, 1]; // Premium spring-like easing

export default function MotorArchitecture() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.15 });

  return (
    <section
      id="process"
      ref={containerRef}
      className="w-full bg-[#050505] py-16 md:py-20 overflow-hidden border-t border-white/[0.03]"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
        
        {/* ── Heading ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12 md:mb-14"
        >
          <span className="px-5 py-2 rounded-full bg-[#ffc812]/5 text-[#ffc812] text-[10px] tracking-[0.3em] font-mono uppercase mb-6 inline-block border border-[#ffc812]/15">
            Operational Workflow
          </span>
          <h2 className="text-5xl md:text-7xl text-white font-medium tracking-tighter"
              style={{ fontFamily: "Michroma, sans-serif" }}>
            Process
          </h2>
        </motion.div>

        <div className="relative min-h-[600px]">
          
          {/* ── Top Nodes Row ──────────────────────────────────────────────── */}
          <div className="absolute top-0 left-0 w-full h-[80px] z-20 pointer-events-none">
            {/* PO Received */}
            <ProcessBadge label="PO Received" active={isInView} delay={0.5} left="10%" />
            {/* PI Raised */}
            <ProcessBadge label="PI Raised"   active={isInView} delay={1.8} left="25%" />
            {/* Invoice Raised */}
            <ProcessBadge label="Invoice raised" active={isInView} delay={9.0} left="80%" />
          </div>

          {/* ── The Connecting Path (SVG) ──────────────────────────────────── */}
          <div className="absolute top-[80px] left-0 w-full h-[120px] z-10 pointer-events-none">
            <svg viewBox="0 0 1000 120" className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none">
              <defs>
                <filter id="blob-filter">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>

              {/* Subtle background track */}
              <path 
                d="M 100 40 L 950 40" 
                stroke={GOLD} strokeWidth="2" strokeOpacity="0.05" strokeLinecap="round"
              />
              
              {/* Gooey Liquid Pipes Group */}
              <g filter="url(#blob-filter)">
                {/* Main horizontal draw - Keyframed for "Stop and Go" */}
                <motion.path
                  d="M 100 40 L 950 40"
                  stroke={GOLD}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { 
                    pathLength: [0, 0.176, 0.176, 0.235, 0.235, 0.470, 0.470, 0.705, 0.705, 0.823, 0.823, 0.941, 0.941, 1.0]
                  } : { pathLength: 0 }}
                  transition={{ 
                    duration: 11, 
                    ease: "linear", 
                    delay: 1,
                    times: [0, 0.073, 0.091, 0.109, 0.218, 0.291, 0.473, 0.545, 0.691, 0.727, 0.764, 0.8, 0.927, 1.0]
                  }}
                />

                {/* Vertical Connectors (Top) */}
                {[100, 250, 800].map((x, i) => (
                  <motion.path
                    key={`top-conn-${i}`}
                    d={`M ${x} 40 L ${x} 0`}
                    stroke={GOLD}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 0.4, delay: [1.0, 1.8, 9.0][i] }}
                  />
                ))}

                {/* Vertical Connectors (Bottom to Columns) */}
                {[300, 500, 700, 900].map((x, i) => (
                  <motion.path
                    key={`bot-conn-${i}`}
                    d={`M ${x} 40 L ${x} 80`}
                    stroke={GOLD}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 0.4, delay: [2.2, 4.2, 7.0, 9.8][i] }}
                  />
                ))}
              </g>

              {/* Traveling Glowing Orb - Synchronized with stop-and-go path */}
              <motion.circle
                r="6"
                fill="#ffffff"
                initial={{ cx: 100, cy: 40, opacity: 0 }}
                animate={isInView ? { 
                  cx: [100, 250, 250, 300, 300, 500, 500, 700, 700, 800, 800, 900, 900, 950],
                  opacity: 1 
                } : { cx: 100, opacity: 0 }}
                transition={{ 
                  duration: 11, 
                  ease: "linear", 
                  delay: 1,
                  times: [0, 0.073, 0.091, 0.109, 0.218, 0.291, 0.473, 0.545, 0.691, 0.727, 0.764, 0.8, 0.927, 1.0]
                }}
                style={{ filter: `drop-shadow(0 0 12px #ffffff)` }}
              />
            </svg>
          </div>

          {/* ── Process Columns Row ───────────────────────────────────────── */}
          <div className="absolute top-[160px] left-0 w-full flex z-20">
            {/* Empty column to push the 4 main columns to the right, aligning perfectly with PO/PI on the left */}
            <div className="w-1/5 shrink-0 hidden md:block pointer-events-none" />
            
            {processData.map((col, i) => (
              <div key={col.title} className="flex flex-col w-full md:w-1/5 px-3">
                {/* Column Header Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.7, ease: BEZIER, delay: [2.3, 4.3, 7.1, 9.9][i] }}
                  className="relative group bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#ffc812]/20 rounded-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffc812]/40 to-transparent" />
                  
                  <div className="flex flex-col gap-1">
                    <motion.h4 
                      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(8px)" }}
                      transition={{ duration: 0.8, delay: [2.3, 4.3, 7.1, 9.9][i] + 0.3 }}
                      className="text-white text-[13px] font-bold tracking-widest uppercase leading-tight" 
                      style={{ fontFamily: "Michroma, sans-serif" }}
                    >
                      {col.title}
                    </motion.h4>
                  </div>
                </motion.div>

                {/* Sub Items - Sequential Reveal */}
                <div className="flex flex-col gap-3">
                  {col.items.map((item, j) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.34, 1.56, 0.64, 1], 
                        delay: [2.5, 4.5, 7.3, 10.1][i] + j * 0.12 
                      }}
                      className="group relative bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3.5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                    >
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-[#ffc812] group-hover:h-1/2 transition-all duration-300" />
                      <motion.p 
                        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                        animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(8px)" }}
                        transition={{ 
                          duration: 0.8, 
                          delay: [2.5, 4.5, 7.3, 10.1][i] + j * 0.12 + 0.2 
                        }}
                        className="text-white/50 text-[11px] font-medium tracking-wide group-hover:text-white transition-colors" 
                        style={{ fontFamily: "Lexend, sans-serif" }}
                      >
                        {item}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function ProcessBadge({ label, active, delay, left }: { label: string, active: boolean, delay: number, left: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={active ? { opacity: 1, y: 0, x: "-50%" } : { opacity: 0, y: -20, x: "-50%" }}
      transition={{ duration: 0.6, ease: BEZIER, delay }}
      className="absolute bottom-[-1px] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#ffc812]/15 rounded-lg px-6 py-3 shadow-[0_15px_35px_rgba(0,0,0,0.4)] pointer-events-auto"
      style={{ left }}
    >
      <div className="absolute inset-0 bg-[#ffc812]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <motion.span 
        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 8, filter: "blur(8px)" }}
        transition={{ duration: 0.6, delay: delay + 0.3 }}
        className="text-white text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap" 
        style={{ fontFamily: "Michroma, sans-serif" }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
