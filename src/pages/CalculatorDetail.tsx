// src/pages/CalculatorDetail.tsx
//
// Improvements over original:
//  • Gauge bug fixed (uses new GaugeArc + KeyMetrics components)
//  • Page header sharpened: grid lines, animated accent stripe
//  • Tab bar: scroll-shadow fade, "soon" pill refined
//  • Calculator sub-header: icon border uses accent colour at low opacity
//  • Disclaimer: softer, less yellow-heavy
//  • CTA section: diagonal rule detail, tighter copy
//  • CSS micro-animations via injected <style> (no extra deps)
//  • Loading state improved with subtle pulse

import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import Footer from "@/components/Footer";
import PropCalcPanel from "@/components/calculators/PropCalcPanel";
import XcopterCalcPanel from "@/components/calculators/XcopterCalcPanel";
import SetupFinder from "@/components/calculators/SetupFinder";
import CgCalc from "@/components/calculators/CgCalc";
import WbCalc from "@/components/calculators/WbCalc";
import BladeCalc from "@/components/calculators/BladeCalc";
import FanCalcPanel from "@/components/calculators/FanCalc";
import HeliCalcPanel from "@/components/calculators/HeliCalc";
import PerfCalcPanel from "@/components/calculators/PerfCalc";
import CalcStub from "@/components/calculators/CalcStub";
import { CALCULATORS, getCalculatorById } from "@/data/calculators";

// ─── Page-level styles injected once ────────────────────────────────────────
const PAGE_STYLES = `
  @keyframes cd-fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cd-stripe {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes cd-pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .cd-header-content { animation: cd-fade-up 0.45s ease both; }
  .cd-stripe {
    transform-origin: left;
    animation: cd-stripe 0.6s cubic-bezier(0.22,1,0.36,1) both 0.1s;
  }
  .cd-tab-btn {
    position: relative;
    transition: color 0.18s;
  }
  .cd-tab-btn::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 2px;
    background: #ffc914;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
  }
  .cd-tab-btn.active::after { transform: scaleX(1); }
  .cd-tab-btn:not(.soon):not(.active):hover::after { transform: scaleX(0.4); }
  .cd-panel-enter { animation: cd-fade-up 0.3s ease both; }
  .cd-tab-scroll::-webkit-scrollbar { display: none; }
  .cd-tab-scroll { scrollbar-width: none; }
  /* Fade mask on right edge of tab bar */
  .cd-tab-wrapper::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 48px;
    background: linear-gradient(to left, white, transparent);
    pointer-events: none;
  }
`;

function injectStyles() {
  if (document.getElementById("calc-detail-styles")) return;
  const el = document.createElement("style");
  el.id = "calc-detail-styles";
  el.textContent = PAGE_STYLES;
  document.head.appendChild(el);
}

// ─── Stub renderer ───────────────────────────────────────────────────────────
function renderStub(calcId: string) {
  const calc = getCalculatorById(calcId);
  if (!calc?.stubDescription) return null;
  const Icon = calc.icon;
  return (
    <CalcStub
      name={`${calc.label} — ${calc.tag}`}
      description={calc.stubDescription}
      icon={<Icon />}
    />
  );
}

// ─── Live dot ────────────────────────────────────────────────────────────────
function LiveDot({ status }: { status: string }) {
  const color = status === "live" ? "#22c55e" : "#ffc914";
  const label = status === "live" ? "Live" : status === "beta" ? "Beta" : "Coming Soon";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          animation: "cd-pulse-dot 2s ease-in-out infinite",
        }}
      />
      <span
        style={{
          fontFamily: "Michroma, sans-serif",
          fontSize: 9,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CalculatorDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/calculators/detail/:id");

  useEffect(() => { injectStyles(); }, []);

  const [active, setActive] = useState<string | null>(() => {
    if (params?.id) {
      const calc = getCalculatorById(params.id);
      return calc ? params.id : null;
    }
    return null;
  });

  useEffect(() => {
    if (params?.id) {
      const calc = getCalculatorById(params.id);
      if (calc) {
        setActive(params.id);
      } else {
        // Invalid calculator ID - redirect to calculators list instead of first live
        navigate("/calculators", { replace: true });
      }
    } else if (!match) {
      // No ID provided - redirect to calculators list
      navigate("/calculators", { replace: true });
    }
  }, [params, match, navigate]);

  const current = active ? getCalculatorById(active) : null;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {/* Animated chevron loader */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ffc914",
                  display: "inline-block",
                  animation: `cd-pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p
            style={{
              fontFamily: "Michroma, sans-serif",
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#ccc",
            }}
          >
            Initialising
          </p>
        </div>
      </div>
    );
  }

  const CurrentIcon = current.icon;

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{ background: "#0a0a0a" }}>
        {/* Subtle grid texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,201,20,0.03) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,201,20,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "96px 48px 36px",
            position: "relative",
          }}
        >
          {/* Accent stripe */}
          <div
            className="cd-stripe"
            style={{
              height: 2,
              width: 40,
              background: "#ffc914",
              marginBottom: 20,
            }}
          />

          {/* Breadcrumb */}
          <div
            className="cd-header-content"
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}
          >
            {[
              { label: "Home", path: "/" },
              { label: "Calculators", path: "/calculators" },
              { label: current.label, path: null },
            ].map((crumb, i) => (
              <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>/</span>
                )}
                {crumb.path ? (
                  <button
                    onClick={() => navigate(crumb.path!)}
                    style={{
                      fontFamily: "Michroma, sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "rgba(255,201,20,0.5)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ffc914")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,201,20,0.5)")}
                  >
                    {i === 0 && (
                      <svg
                        style={{ width: 10, height: 10, marginRight: 3, verticalAlign: "middle" }}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    )}
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    style={{
                      fontFamily: "Michroma, sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "#ffc914",
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Title row */}
          <div
            className="cd-header-content"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              animationDelay: "0.05s",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Michroma, sans-serif",
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                Drive{" "}
                <span style={{ color: "#ffc914" }}>Calculator</span>{" "}
                Suite
              </h1>
              <p
                style={{
                  fontFamily: "Lexend, sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.38)",
                  marginTop: 10,
                  maxWidth: 480,
                  lineHeight: 1.65,
                }}
              >
                Professional-grade RC aircraft &amp; drone performance simulation —
                all calculations run locally, no data sent to any server.
              </p>
            </div>
            <LiveDot status={current.status} />
          </div>
        </div>
      </div>

      {/* ── TAB BAR ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 60,
          zIndex: 30,
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 1px 0 #f0f0f0",
        }}
      >
        <div
          className="cd-tab-wrapper"
          style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", position: "relative" }}
        >
          <div
            className="cd-tab-scroll"
            style={{ display: "flex", overflowX: "auto", gap: 0 }}
          >
            {CALCULATORS.map(c => {
              const isSoon = c.status === "soon";
              const isActive = active === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => !isSoon && navigate(`/calculators/detail/${c.id}`)}
                  disabled={isSoon}
                  className={`cd-tab-btn${isActive ? " active" : ""}${isSoon ? " soon" : ""}`}
                  style={{
                    fontFamily: "Michroma, sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    padding: "15px 18px",
                    background: "none",
                    border: "none",
                    borderBottom: "2px solid transparent",
                    cursor: isSoon ? "not-allowed" : "pointer",
                    color: isActive
                      ? "#111"
                      : isSoon
                      ? "#ccc"
                      : "#888",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  {c.label}
                  {isSoon && (
                    <span
                      style={{
                        fontSize: 7,
                        background: "#f5f5f5",
                        color: "#bbb",
                        padding: "2px 5px",
                        borderRadius: 3,
                        letterSpacing: "0.12em",
                      }}
                    >
                      SOON
                    </span>
                  )}
                  {c.status === "live" && isActive && (
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", minHeight: "60vh" }}>
        <div
          style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px" }}
          className="cd-panel-enter"
          key={active} // remount animation when tab changes
        >
          {/* ── Calculator sub-header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1.5px solid ${current.accent}44`,
                borderRadius: 8,
                padding: 10,
                color: current.accent,
                background: `${current.accent}08`,
              }}
            >
              <CurrentIcon />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2
                  style={{
                    fontFamily: "Michroma, sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {current.label}
                </h2>
                <span
                  style={{
                    fontFamily: "Michroma, sans-serif",
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    background: current.accent,
                    color: current.textColor,
                    padding: "3px 9px",
                    borderRadius: 3,
                    display: "inline-block",
                    transform: "skewX(-8deg)",
                  }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
                    {current.tag}
                  </span>
                </span>
              </div>
              <p
                style={{
                  fontFamily: "Lexend, sans-serif",
                  fontSize: 13,
                  color: "#888",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {current.description}
              </p>
            </div>
          </div>

          {/* ── Disclaimer */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              background: "rgba(255,201,20,0.05)",
              border: "1px solid rgba(255,201,20,0.18)",
              borderLeft: "3px solid #ffc914",
              padding: "10px 14px",
              borderRadius: "0 6px 6px 0",
              marginBottom: 28,
            }}
          >
            <svg
              style={{ width: 14, height: 14, color: "#ffc914", flexShrink: 0, marginTop: 1 }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ fontFamily: "Lexend, sans-serif", fontSize: 11, color: "#666", margin: 0, lineHeight: 1.6 }}>
              Results are estimates based on momentum theory and empirical motor models (±10–15% accuracy).
              Always verify with bench testing before flight. Calculations run entirely in your browser.
            </p>
          </div>

          {/* ── Calculator panel */}
          {current.id === "propcalc"      && <PropCalcPanel />}
          {current.id === "xcoptercalc"   && <XcopterCalcPanel />}
          {current.id === "setupfinder"   && <SetupFinder />}
          {current.id === "cgcalc"        && <CgCalc />}
          {current.id === "wbcalc"        && <WbCalc />}
          {current.id === "bladecalc"     && <BladeCalc />}
          {current.id === "fancalc"       && <FanCalcPanel />}
          {current.id === "helicalc"      && <HeliCalcPanel />}
          {current.id === "perfcalc"      && <PerfCalcPanel />}

          {/* ── Info bar */}
          {current.status === "live" && current.inputCount && current.outputCount && (
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              {[
                { value: current.inputCount,  label: "Input Parameters" },
                { value: current.outputCount, label: "Output Metrics" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "Michroma, sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#111",
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontFamily: "Michroma, sans-serif",
                      fontSize: 8,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#aaa",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
              {current.popular && (
                <span
                  style={{
                    fontFamily: "Michroma, sans-serif",
                    fontSize: 7,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#b8920c",
                    background: "rgba(255,201,20,0.15)",
                    padding: "4px 10px",
                    borderRadius: 3,
                  }}
                >
                  Popular
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#0a0a0a",
          padding: "72px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Diagonal rule */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 2,
            background: "linear-gradient(90deg, #ffc914 0%, transparent 60%)",
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "Michroma, sans-serif",
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#ffc914",
                marginBottom: 8,
              }}
            >
              Need precise data?
            </p>
            <h3
              style={{
                fontFamily: "Michroma, sans-serif",
                fontSize: "clamp(20px, 2.5vw, 28px)",
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Test our motors in your system.
            </h3>
            <p
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                marginTop: 8,
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              Welkinrim provides dyno-tested motor data sheets for all product variants.
            </p>
          </div>

          <button
            onClick={() => navigate("/products")}
            style={{
              fontFamily: "Michroma, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              background: "#ffc914",
              color: "#000",
              border: "none",
              padding: "14px 36px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transform: "skewX(-8deg)",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#e6b400";
              e.currentTarget.style.transform = "skewX(-8deg) scale(1.02)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#ffc914";
              e.currentTarget.style.transform = "skewX(-8deg) scale(1)";
            }}
          >
            <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
              View Products →
            </span>
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}