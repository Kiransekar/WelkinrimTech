import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ─── Haversine distance (km) ─────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function fmtKm(km: number) {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

// ─── Welkinrim location ───────────────────────────────────────────────────────
const WR = { lat: 12.8365, lng: 79.9212 };

// ─── Neighbour companies (verified Oragadam Industrial Corridor) ──────────────
const COMPANIES = [
  { name: "Indospace",      sector: "Industrial Park",      lat: 12.8377241, lng: 79.91005,   km: 1.3 },
  { name: "Danfoss",        sector: "Power Electronics",    lat: 12.8417965, lng: 79.9164545, km: 2.5 },
  { name: "Royal Enfield",  sector: "Mobility OEM",         lat: 12.8459775, lng: 79.915967,  km: 2.7 },
  { name: "Nokia",          sector: "Telecom / 5G",         lat: 12.8506846, lng: 79.9182688, km: 3.6 },
  { name: "Renault Nissan", sector: "Vehicle Manufacturer", lat: 12.8438592, lng: 79.9215379, km: 3.9 },
  { name: "Apollo Tyres",   sector: "Auto Components",      lat: 12.8467016, lng: 79.9267561, km: 5.5 },
  { name: "Daimler India",  sector: "Commercial Vehicles",  lat: 12.8470985, lng: 79.9286826, km: 6.5 },
];

// ─── Custom SVG pin HTML ──────────────────────────────────────────────────────
function pinSvg(big: boolean) {
  const w = big ? 38 : 26, h = big ? 50 : 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <filter id="sh${big ? "b" : "s"}" x="-40%" y="-20%" width="180%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
    <path d="M${w/2} ${h-2} C${w/2} ${h-2} 2 ${h*0.55} 2 ${w*0.45}
             a${w/2-2} ${w/2-2} 0 1 1 ${w-4} 0
             C${w-2} ${w*0.55} ${w/2} ${h-2} ${w/2} ${h-2}Z"
          fill="#FFCC00" filter="url(#sh${big ? "b" : "s"})"/>
    <circle cx="${w/2}" cy="${w*0.45}" r="${big ? 8 : 5}" fill="#111" opacity="0.9"/>
  </svg>`;
}

// ─── Map style: white background + yellow roads (no API key) ─────────────────
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    },
  },
  layers: [
    // ── Background ──
    { id: "background", type: "background", paint: { "background-color": "#ffffff" } },

    // ── Water ──
    { id: "water-fill", type: "fill", source: "osm", "source-layer": "water",
      paint: { "fill-color": "#d4e9f5", "fill-antialias": true } },

    // ── Land cover ──
    { id: "landcover-grass", type: "fill", source: "osm", "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["grass", "scrub", "crop"]]],
      paint: { "fill-color": "#f3f5ef" } },
    { id: "landcover-wood", type: "fill", source: "osm", "source-layer": "landcover",
      filter: ["==", ["get", "class"], "wood"],
      paint: { "fill-color": "#eaf0e3" } },

    // ── Land use ──
    { id: "landuse-res", type: "fill", source: "osm", "source-layer": "landuse",
      filter: ["in", ["get", "class"], ["literal", ["residential", "suburb"]]],
      paint: { "fill-color": "#f9f9f9" } },
    { id: "landuse-industrial", type: "fill", source: "osm", "source-layer": "landuse",
      filter: ["==", ["get", "class"], "industrial"],
      paint: { "fill-color": "#f4f0ea" } },
    { id: "landuse-park", type: "fill", source: "osm", "source-layer": "landuse",
      filter: ["in", ["get", "class"], ["literal", ["park", "pitch", "playground"]]],
      paint: { "fill-color": "#ecf4e5" } },

    // ── Buildings ──
    { id: "building", type: "fill", source: "osm", "source-layer": "building",
      minzoom: 13,
      paint: { "fill-color": "#f0f0f0", "fill-outline-color": "#e5e5e5" } },

    // ── Roads — outline (slightly darker yellow) ──
    { id: "road-motorway-case", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "motorway"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#d4a800",
               "line-width": ["interpolate", ["linear"], ["zoom"], 8, 3, 12, 6, 16, 10] } },
    { id: "road-trunk-case", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "trunk"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#d4a800",
               "line-width": ["interpolate", ["linear"], ["zoom"], 8, 2, 12, 4, 16, 8] } },
    { id: "road-primary-case", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "primary"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#d4a800",
               "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1.5, 12, 3, 16, 6] } },

    // ── Roads — fill ──
    { id: "road-motorway", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "motorway"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#FFCC00",
               "line-width": ["interpolate", ["linear"], ["zoom"], 8, 2, 12, 4, 16, 7] } },
    { id: "road-trunk", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "trunk"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#FFCC00",
               "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1.5, 12, 3, 16, 6] } },
    { id: "road-primary", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "primary"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#FFCC00",
               "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 12, 2.5, 16, 5] } },
    { id: "road-secondary", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#FFD633",
               "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 12, 1.5, 16, 3] } },
    { id: "road-minor", type: "line", source: "osm", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "residential", "service"]]],
      minzoom: 12,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#FFE066",
               "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.4, 16, 1.5] } },

    // ── Place labels ──
    { id: "place-town", type: "symbol", source: "osm", "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["city", "town", "village", "suburb"]]],
      layout: {
        "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 14, 13],
        "text-anchor": "center",
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#444444",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5,
      },
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LocationMap() {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markers     = useRef<Record<string, maplibregl.Marker>>({});
  const [active, setActive]   = useState<string | null>(null);
  const [webGlError, setWebGlError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapRef.current,
        style: MAP_STYLE,
        center: [WR.lng, WR.lat],
        zoom: 13,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      setWebGlError(true);
      return;
    }
    map.on("error", () => setWebGlError(true));

    mapInstance.current = map;

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // ── Welkinrim marker (big) ──
      const selfEl = document.createElement("div");
      selfEl.innerHTML = pinSvg(true);
      selfEl.style.cursor = "pointer";

      new maplibregl.Marker({ element: selfEl, anchor: "bottom" })
        .setLngLat([WR.lng, WR.lat])
        .setPopup(
          new maplibregl.Popup({ closeButton: false, offset: 30, className: "wr-popup" })
            .setHTML(`
              <div style="font-family:Michroma,sans-serif;background:#0d1b2a;border:1px solid #FFCC00;
                          padding:10px 14px;color:#fff;min-width:160px;border-radius:2px">
                <div style="color:#FFCC00;font-size:10px;letter-spacing:0.2em;margin-bottom:4px">OUR FACILITY</div>
                <div style="font-weight:bold;font-size:13px">Welkinrim Technologies</div>
                <div style="font-size:10px;color:#888;margin-top:2px">Oragadam, Chennai</div>
              </div>`)
        )
        .addTo(map);

      // ── Company markers ──
      COMPANIES.forEach(co => {
        const el = document.createElement("div");
        el.innerHTML = pinSvg(false);
        el.style.cursor = "pointer";

        const m = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([co.lng, co.lat])
          .setPopup(
            new maplibregl.Popup({ closeButton: false, offset: 22, className: "wr-popup" })
              .setHTML(`
                <div style="font-family:Michroma,sans-serif;background:#0d1b2a;border:1px solid #FFCC00;
                            padding:10px 14px;color:#fff;min-width:160px;border-radius:2px">
                  <div style="color:#FFCC00;font-size:10px;letter-spacing:0.2em;margin-bottom:4px">
                    ${co.sector.toUpperCase()}
                  </div>
                  <div style="font-weight:bold;font-size:13px">${co.name}</div>
                  <div style="font-size:10px;color:#aaa;margin-top:3px">
                    📍 ${fmtKm(co.km)} from Welkinrim
                  </div>
                </div>`)
          )
          .addTo(map);

        markers.current[co.name] = m;
      });
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const flyTo = (co: (typeof COMPANIES)[0]) => {
    const map = mapInstance.current;
    const m   = markers.current[co.name];
    if (!map || !m) return;
    setActive(co.name);
    map.flyTo({ center: [co.lng, co.lat], zoom: 13, duration: 900, essential: true });
    setTimeout(() => m.togglePopup(), 950);
  };

  const reset = () => {
    setActive(null);
    mapInstance.current?.flyTo({ center: [WR.lng, WR.lat], zoom: 13, duration: 900 });
    Object.values(markers.current).forEach(m => {
      if (m.getPopup()?.isOpen()) m.togglePopup();
    });
  };

  return (
    <section id="about" className="py-8 lg:py-6 bg-[#f8f8f8] scroll-mt-[72px] flex flex-col justify-center h-auto lg:h-[calc(100vh-72px)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full h-full flex flex-col">
        {/* Header */}
        <div className="mb-4 lg:mb-4 shrink-0 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#FFCC00]" />
              <span className="text-[#808080] text-xs tracking-[0.3em] uppercase"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                Strategic Location
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight"
                style={{ fontFamily: "Michroma, sans-serif" }}>
              At the Heart of<br /><span className="text-[#FFCC00]">Industry Giants</span>
            </h2>
          </div>
          <p className="text-[#808080] text-sm max-w-xs leading-relaxed"
             style={{ fontFamily: "Inter, sans-serif" }}>
            Our facility sits in the Oragadam Industrial Corridor — surrounded by global
            automotive and technology leaders within a 20 km radius.
          </p>
        </div>

        {/* Map block */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-3 gap-0 rounded-sm overflow-hidden shadow-2xl border border-gray-200 h-[600px] lg:h-full">

          {/* ── Map pane ── */}
          <div className="lg:col-span-2 relative min-h-[300px] lg:min-h-0 h-full">
            <div ref={mapRef} className="w-full h-full" />
            {/* WebGL fallback */}
            {webGlError && (
              <div className="absolute inset-0 bg-[#0d1b2a] flex flex-col items-center justify-center gap-4">
                <div className="text-[#FFCC00] text-5xl font-black" style={{ fontFamily: "Michroma, sans-serif" }}>WR</div>
                <p className="text-white/60 text-xs text-center max-w-xs" style={{ fontFamily: "Michroma, sans-serif" }}>
                  Welkinrim Technologies<br />
                  <span className="text-white/30">Oragadam Industrial Corridor, Chennai</span>
                </p>
                <a
                  href="https://maps.app.goo.gl/Sd8XkUyzC64aq9pd7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 px-6 py-2 border border-[#FFCC00] text-[#FFCC00] text-[9px] tracking-widest uppercase hover:bg-[#FFCC00] hover:text-black transition-colors"
                  style={{ fontFamily: "Michroma, sans-serif" }}
                >
                  View on Google Maps ↗
                </a>
              </div>
            )}

            {/* Bottom label overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-5 pt-8 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(13,27,42,0.92) 0%, transparent 100%)" }}
            >
              <p className="text-[#FFCC00] text-xl md:text-2xl font-black tracking-[0.5em] uppercase"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                ORAGADAM
              </p>
              <p className="text-white/50 text-xs tracking-[0.3em] uppercase mt-0.5"
                 style={{ fontFamily: "Michroma, sans-serif" }}>India</p>
              <p className="text-white/30 text-[10px] tracking-widest mt-0.5"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                12.8365° N &nbsp;/&nbsp; 79.9212° E
              </p>
            </div>

            {/* Reset */}
            {active && (
              <button
                onClick={reset}
                className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-[#FFCC00] text-black text-[10px] tracking-widest uppercase font-bold shadow hover:bg-[#e6b800] transition-colors"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                ← Reset View
              </button>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="bg-[#0d1b2a] flex flex-col overflow-y-auto h-full">

            {/* Our facility header */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#FFCC00] relative">
                  <span className="absolute inset-0 rounded-full bg-[#FFCC00] animate-ping opacity-60" />
                </div>
                <span className="text-[#FFCC00] text-[10px] tracking-[0.3em] uppercase"
                      style={{ fontFamily: "Michroma, sans-serif" }}>
                  Our Facility
                </span>
              </div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>
                Welkinrim Technologies
              </p>
              <p className="text-white/40 text-[10px] mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                Oragadam, Chennai, Tamil Nadu
              </p>
            </div>

            {/* Company list */}
            <div className="flex flex-col divide-y divide-white/5 flex-1">
              {COMPANIES.map(co => (
                <button
                  key={co.name}
                  onClick={() => flyTo(co)}
                  className={`text-left px-5 py-3.5 transition-all duration-200 group border-l-2 ${
                    active === co.name
                      ? "bg-[#FFCC00]/10 border-[#FFCC00]"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                        active === co.name ? "bg-[#FFCC00]" : "bg-white/20 group-hover:bg-[#FFCC00]/60"
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate transition-colors ${
                          active === co.name ? "text-[#FFCC00]" : "text-white/80 group-hover:text-white"
                        }`} style={{ fontFamily: "Michroma, sans-serif" }}>
                          {co.name}
                        </p>
                        <p className="text-[10px] text-white/30 truncate mt-0.5"
                           style={{ fontFamily: "Inter, sans-serif" }}>
                          {co.sector}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold flex-shrink-0 transition-colors ${
                      active === co.name ? "text-[#FFCC00]" : "text-white/40 group-hover:text-[#FFCC00]/80"
                    }`} style={{ fontFamily: "Michroma, sans-serif" }}>
                      {fmtKm(co.km)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/5 mt-auto">
              <a
                href="https://maps.app.goo.gl/Sd8XkUyzC64aq9pd7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] text-[#FFCC00] hover:text-white transition-colors uppercase tracking-widest"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                Open in Google Maps
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Override MapLibre popup chrome */}
      <style>{`
        .wr-popup .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .wr-popup .maplibregl-popup-tip { display: none !important; }
        .maplibregl-ctrl-attrib {
          background: rgba(255,255,255,0.85) !important;
          font-size: 9px !important;
        }
        .maplibregl-ctrl-zoom-in,
        .maplibregl-ctrl-zoom-out {
          border-color: #FFCC00 !important;
        }
        .maplibregl-ctrl-zoom-in:hover,
        .maplibregl-ctrl-zoom-out:hover {
          background-color: #FFCC00 !important;
        }
        .maplibregl-canvas { background: #fff !important; }
      `}</style>
    </section>
  );
}
