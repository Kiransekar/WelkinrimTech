export type PerfRow = {
  throttle: string;
  voltage:  string;
  power:    string;
  thrust:   string;
  current:  string;
  speed?:   string;
  efficiency?: string;
};

export type Product = {
  id: string;
  series: "haemng" | "maelard" | "esc" | "fc" | "ips" | "other";
  seriesLabel: string;
  model: string;
  name: string;
  tag: string;
  application: string;
  keySpecs: { label: string; value: string }[];
  allSpecs: { label: string; value: string }[];
  perf?: PerfRow[];
  /** Optional per-product photo URL (set via admin console) */
  thumbnailUrl?: string | null;
  /** Optional per-product wireframe URL override (set via admin console) */
  wireframeUrl?: string | null;
};

export const SERIES_CFG = {
  haemng:  { label: "Haemng Series", useSvgLogo: true, logoSrc: "haemng.svg", accent: "#ffc812", textOnAccent: "#000" },
  maelard: { label: "Maelard Series", useSvgLogo: true, logoSrc: "Maelard.svg", accent: "#ffc812", textOnAccent: "#000" },
  esc:     { label: "Electronic Speed Controllers", accent: "#ffc812", textOnAccent: "#000" },
  fc:      { label: "Flight Controller",            accent: "#ffc812", textOnAccent: "#000" },
  ips:     { label: "Integrated Power Systems",     accent: "#ffc812", textOnAccent: "#000" },
  other:   { label: "Other Systems & Custom Solutions", accent: "#ffc812", textOnAccent: "#000" },
} as const;

export const PRODUCTS: Product[] = [
  {
    id: "haemng-xamqa8ak3",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 2121 II", name: "HAEMNG 2121 II", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "380"  }, { "label": "Peak Thrust", "value": "350 g"  }, { "label": "Voltage", "value": "6S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "380"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "6S"
      },
      {
            "label": "Peak Current",
            "value": "10 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "350 g"
      },
      {
            "label": "Peak Thrust",
            "value": "1,200 g"
      },
      {
            "label": "Recommended Propeller",
            "value": "13 x 4.4 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ46x20 mm"
      },
      {
            "label": "Weight",
            "value": "86 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"24.94 V", power:"9.93 W", thrust:"151 g", current:"0.40 A", speed:"2,493 RPM", efficiency:"15.21 g/W" },
      { throttle:"35%", voltage:"24.92 V", power:"14.45 W", thrust:"206 g", current:"0.58 A", speed:"2,819 RPM", efficiency:"14.25 g/W" },
      { throttle:"40%", voltage:"24.90 V", power:"17.43 W", thrust:"243 g", current:"0.70 A", speed:"3,109 RPM", efficiency:"13.94 g/W" },
      { throttle:"45%", voltage:"24.88 V", power:"23.64 W", thrust:"293 g", current:"0.95 A", speed:"3,393 RPM", efficiency:"12.40 g/W" },
      { throttle:"50%", voltage:"24.85 V", power:"32.06 W", thrust:"362 g", current:"1.29 A", speed:"3,705 RPM", efficiency:"11.29 g/W" },
      { throttle:"55%", voltage:"24.81 V", power:"36.47 W", thrust:"405 g", current:"1.47 A", speed:"3,991 RPM", efficiency:"11.10 g/W" },
      { throttle:"60%", voltage:"24.76 V", power:"45.31 W", thrust:"498 g", current:"1.83 A", speed:"4,293 RPM", efficiency:"10.99 g/W" },
      { throttle:"65%", voltage:"24.67 V", power:"55.51 W", thrust:"565 g", current:"2.25 A", speed:"4,593 RPM", efficiency:"10.18 g/W" },
      { throttle:"70%", voltage:"24.61 V", power:"63.99 W", thrust:"631 g", current:"2.60 A", speed:"4,903 RPM", efficiency:"9.86 g/W" },
      { throttle:"75%", voltage:"24.56 V", power:"75.89 W", thrust:"708 g", current:"3.09 A", speed:"5,154 RPM", efficiency:"9.33 g/W" },
      { throttle:"80%", voltage:"24.51 V", power:"90.93 W", thrust:"781 g", current:"3.71 A", speed:"5,440 RPM", efficiency:"8.59 g/W" },
      { throttle:"90%", voltage:"24.36 V", power:"129.60 W", thrust:"1,003 g", current:"5.32 A", speed:"6,064 RPM", efficiency:"7.74 g/W" },
      { throttle:"100%", voltage:"24.18 V", power:"203.60 W", thrust:"1,204 g", current:"8.42 A", speed:"6,624 RPM", efficiency:"5.91 g/W" },
    ],
  },
  {
    id: "haemng-p7ofe6dco",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 4143 II", name: "HAEMNG 4143 II", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "100"  }, { "label": "Peak Thrust", "value": "5 kg"  }, { "label": "Voltage", "value": "12S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "100"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "12S"
      },
      {
            "label": "Peak Current",
            "value": "50 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "5 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "11.7 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "28 x 9.2 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ99x33 mm"
      },
      {
            "label": "Weight",
            "value": "560 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"50.02 V", power:"184.22 W", thrust:"1.68 kg", current:"3.68 A", speed:"1,775 RPM", efficiency:"9.11 g/W" },
      { throttle:"35%", voltage:"49.88 V", power:"259.17 W", thrust:"2.30 kg", current:"5.19 A", speed:"2,045 RPM", efficiency:"8.87 g/W" },
      { throttle:"40%", voltage:"49.71 V", power:"344.04 W", thrust:"2.98 kg", current:"6.92 A", speed:"2,295 RPM", efficiency:"8.66 g/W" },
      { throttle:"45%", voltage:"49.60 V", power:"433.35 W", thrust:"3.62 kg", current:"8.73 A", speed:"2,573 RPM", efficiency:"8.35 g/W" },
      { throttle:"50%", voltage:"49.38 V", power:"535.27 W", thrust:"4.38 kg", current:"10.84 A", speed:"2,721 RPM", efficiency:"8.18 g/W" },
      { throttle:"55%", voltage:"49.22 V", power:"650.68 W", thrust:"5.12 kg", current:"13.22 A", speed:"2,925 RPM", efficiency:"7.86 g/W" },
      { throttle:"60%", voltage:"48.98 V", power:"778.29 W", thrust:"5.88 kg", current:"15.89 A", speed:"3,114 RPM", efficiency:"7.55 g/W" },
      { throttle:"65%", voltage:"48.77 V", power:"931.99 W", thrust:"6.70 kg", current:"19.11 A", speed:"3,312 RPM", efficiency:"7.18 g/W" },
      { throttle:"70%", voltage:"48.47 V", power:"1,087.18 W", thrust:"7.40 kg", current:"22.43 A", speed:"3,483 RPM", efficiency:"6.80 g/W" },
      { throttle:"75%", voltage:"48.15 V", power:"1,307.75 W", thrust:"8.38 kg", current:"27.16 A", speed:"3,698 RPM", efficiency:"6.40 g/W" },
      { throttle:"80%", voltage:"47.81 V", power:"1,455.81 W", thrust:"9.02 kg", current:"30.45 A", speed:"3,828 RPM", efficiency:"6.19 g/W" },
      { throttle:"90%", voltage:"47.45 V", power:"1,908.43 W", thrust:"10.74 kg", current:"40.22 A", speed:"4,167 RPM", efficiency:"5.62 g/W" },
      { throttle:"100%", voltage:"46.23 V", power:"2,249.55 W", thrust:"11.76 kg", current:"48.66 A", speed:"4,353 RPM", efficiency:"5.22 g/W" },
    ],
  },
  {
    id: "haemng-kwksy3thl",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 4143 II", name: "HAEMNG 4143 II", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "100"  }, { "label": "Peak Thrust", "value": "5.5 kg"  }, { "label": "Voltage", "value": "12S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "100"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "12S"
      },
      {
            "label": "Peak Current",
            "value": "50 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "5.5 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "12 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "30 x 10.5 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ99x33 mm"
      },
      {
            "label": "Weight",
            "value": "560 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"49.53 V", power:"164.44 W", thrust:"1.84 kg", current:"3.32 A", speed:"1,772 RPM", efficiency:"11.19 g/W" },
      { throttle:"35%", voltage:"49.40 V", power:"245.52 W", thrust:"2.52 kg", current:"4.97 A", speed:"2,041 RPM", efficiency:"10.26 g/W" },
      { throttle:"40%", voltage:"49.30 V", power:"314.04 W", thrust:"3.10 kg", current:"6.37 A", speed:"2,269 RPM", efficiency:"9.87 g/W" },
      { throttle:"45%", voltage:"49.18 V", power:"406.23 W", thrust:"3.70 kg", current:"8.26 A", speed:"2,478 RPM", efficiency:"9.11 g/W" },
      { throttle:"50%", voltage:"49.01 V", power:"517.55 W", thrust:"4.48 kg", current:"10.56 A", speed:"2,718 RPM", efficiency:"8.66 g/W" },
      { throttle:"55%", voltage:"48.81 V", power:"646.24 W", thrust:"5.38 kg", current:"13.24 A", speed:"2,931 RPM", efficiency:"8.33 g/W" },
      { throttle:"60%", voltage:"48.57 V", power:"754.78 W", thrust:"5.92 kg", current:"15.54 A", speed:"3,107 RPM", efficiency:"7.84 g/W" },
      { throttle:"65%", voltage:"48.32 V", power:"900.20 W", thrust:"6.68 kg", current:"18.63 A", speed:"3,300 RPM", efficiency:"7.42 g/W" },
      { throttle:"70%", voltage:"48.09 V", power:"1,076.74 W", thrust:"7.50 kg", current:"22.39 A", speed:"3,490 RPM", efficiency:"6.97 g/W" },
      { throttle:"75%", voltage:"47.76 V", power:"1,249.40 W", thrust:"8.42 kg", current:"26.16 A", speed:"3,656 RPM", efficiency:"6.74 g/W" },
      { throttle:"80%", voltage:"47.39 V", power:"1,414.12 W", thrust:"9.24 kg", current:"29.84 A", speed:"3,812 RPM", efficiency:"6.53 g/W" },
      { throttle:"90%", voltage:"46.89 V", power:"1,818.86 W", thrust:"10.64 kg", current:"38.79 A", speed:"4,117 RPM", efficiency:"5.85 g/W" },
      { throttle:"100%", voltage:"46.28 V", power:"2,221.44 W", thrust:"12.04 kg", current:"48.00 A", speed:"4,366 RPM", efficiency:"5.42 g/W" },
    ],
  },
  {
    id: "haemng-6k4icwbgs",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 8005", name: "HAEMNG 8005", tag: "HAEMNG", application: "UAV / eVTOL",
    thumbnailUrl: "/assets/products/haemng_8005.png",
    keySpecs: [ { "label": "KV Rating", "value": "230"  }, { "label": "Peak Thrust", "value": "1,500 g"  }, { "label": "Voltage", "value": "6S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "230"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "6S"
      },
      {
            "label": "Peak Current",
            "value": "25 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "1,500 g"
      },
      {
            "label": "Peak Thrust",
            "value": "3,700 g"
      },
      {
            "label": "Recommended Propeller",
            "value": "24 x 7.2 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ81x21.5 mm"
      },
      {
            "label": "Weight",
            "value": "245 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"24.67 V", power:"46.13 W", thrust:"762 g", current:"1.87 A", speed:"1,503 RPM", efficiency:"16.52 g/W" },
      { throttle:"35%", voltage:"24.57 V", power:"62.16 W", thrust:"938 g", current:"2.53 A", speed:"1,643 RPM", efficiency:"15.09 g/W" },
      { throttle:"40%", voltage:"24.52 V", power:"78.71 W", thrust:"1,042 g", current:"3.21 A", speed:"1,778 RPM", efficiency:"13.24 g/W" },
      { throttle:"45%", voltage:"24.44 V", power:"95.56 W", thrust:"1,223 g", current:"3.91 A", speed:"1,915 RPM", efficiency:"12.80 g/W" },
      { throttle:"50%", voltage:"24.31 V", power:"109.64 W", thrust:"1,429 g", current:"4.51 A", speed:"2,062 RPM", efficiency:"13.03 g/W" },
      { throttle:"55%", voltage:"24.21 V", power:"138.00 W", thrust:"1,618 g", current:"5.70 A", speed:"2,186 RPM", efficiency:"11.72 g/W" },
      { throttle:"60%", voltage:"24.10 V", power:"166.05 W", thrust:"1,800 g", current:"6.89 A", speed:"2,313 RPM", efficiency:"10.84 g/W" },
      { throttle:"65%", voltage:"23.98 V", power:"189.20 W", thrust:"1,962 g", current:"7.89 A", speed:"2,452 RPM", efficiency:"10.37 g/W" },
      { throttle:"70%", voltage:"23.83 V", power:"231.39 W", thrust:"2,268 g", current:"9.71 A", speed:"2,603 RPM", efficiency:"9.80 g/W" },
      { throttle:"75%", voltage:"23.73 V", power:"270.52 W", thrust:"2,473 g", current:"11.40 A", speed:"2,723 RPM", efficiency:"9.14 g/W" },
      { throttle:"80%", voltage:"23.60 V", power:"318.60 W", thrust:"2,753 g", current:"13.50 A", speed:"2,859 RPM", efficiency:"8.64 g/W" },
      { throttle:"90%", voltage:"23.28 V", power:"430.68 W", thrust:"3,345 g", current:"18.50 A", speed:"3,146 RPM", efficiency:"7.77 g/W" },
      { throttle:"100%", voltage:"22.99 V", power:"542.56 W", thrust:"3,693 g", current:"23.60 A", speed:"3,321 RPM", efficiency:"6.81 g/W" },
    ],
  },
  {
    id: "haemng-79588b9hf",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 7010", name: "HAEMNG 7010", tag: "HAEMNG", application: "UAV / eVTOL",
    thumbnailUrl: "/assets/products/haemng_7010.png",
    keySpecs: [ { "label": "KV Rating", "value": "150" }, { "label": "Peak Thrust", "value": "13 kg" }, { "label": "Voltage", "value": "12S" } ],
    allSpecs: [
      { "label": "KV Rating",               "value": "150" },
      { "label": "Rated Voltage (LiPo)",    "value": "12S" },
      { "label": "Peak Current",            "value": "55 A" },
      { "label": "Recommended Thrust",      "value": "4.5 – 6 kg" },
      { "label": "Peak Thrust",             "value": "13 kg" },
      { "label": "Recommended Propeller",   "value": "24 x 8 inch" },
      { "label": "Dimension",               "value": "Φ70x33.50 mm" },
      { "label": "Weight",                  "value": "468 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.3 V", power:"76 W",     thrust:"1.7 kg",  current:"3.6 A",  speed:"2,258 RPM", efficiency:"10.2 g/W" },
      { throttle:"35%",  voltage:"47.3 V", power:"124 W",    thrust:"2.4 kg",  current:"5.0 A",  speed:"2,532 RPM", efficiency:"10.1 g/W" },
      { throttle:"40%",  voltage:"47.3 V", power:"173 W",    thrust:"3.0 kg",  current:"6.7 A",  speed:"2,812 RPM", efficiency:"9.6 g/W" },
      { throttle:"45%",  voltage:"47.2 V", power:"429 W",    thrust:"3.8 kg",  current:"9.0 A",  speed:"3,119 RPM", efficiency:"8.9 g/W" },
      { throttle:"50%",  voltage:"47.2 V", power:"557 W",    thrust:"4.8 kg",  current:"11.8 A", speed:"3,410 RPM", efficiency:"8.7 g/W" },
      { throttle:"55%",  voltage:"47.1 V", power:"701 W",    thrust:"5.6 kg",  current:"14.8 A", speed:"3,686 RPM", efficiency:"8.0 g/W" },
      { throttle:"60%",  voltage:"47.0 V", power:"851 W",    thrust:"6.2 kg",  current:"18.0 A", speed:"3,917 RPM", efficiency:"7.2 g/W" },
      { throttle:"65%",  voltage:"46.9 V", power:"965 W",    thrust:"6.8 kg",  current:"20.5 A", speed:"4,160 RPM", efficiency:"7.1 g/W" },
      { throttle:"70%",  voltage:"46.9 V", power:"1,159 W",  thrust:"7.9 kg",  current:"24.7 A", speed:"4,363 RPM", efficiency:"6.8 g/W" },
      { throttle:"75%",  voltage:"46.8 V", power:"1,370 W",  thrust:"9.0 kg",  current:"29.2 A", speed:"4,566 RPM", efficiency:"6.5 g/W" },
      { throttle:"80%",  voltage:"46.7 V", power:"1,596 W",  thrust:"9.8 kg",  current:"34.1 A", speed:"4,803 RPM", efficiency:"6.1 g/W" },
      { throttle:"90%",  voltage:"46.5 V", power:"2,069 W",  thrust:"10.9 kg", current:"44.4 A", speed:"5,223 RPM", efficiency:"5.3 g/W" },
      { throttle:"100%", voltage:"46.3 V", power:"2,491 W",  thrust:"12.9 kg", current:"53.8 A", speed:"5,544 RPM", efficiency:"5.2 g/W" },
    ],
  },
  {
    id: "haemng-ixtod385i",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 1536", name: "HAEMNG 1536", tag: "HAEMNG", application: "UAV / eVTOL",
    thumbnailUrl: "/assets/products/haemng_1536.png",
    keySpecs: [ { "label": "KV Rating", "value": "80" }, { "label": "Peak Thrust", "value": "44 kg" }, { "label": "Voltage", "value": "24S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "80" },
      { "label": "Rated Voltage (LiPo)",  "value": "24S" },
      { "label": "Peak Current",          "value": "105 A" },
      { "label": "Recommended Thrust",    "value": "14 – 19 kg" },
      { "label": "Peak Thrust",           "value": "44 kg" },
      { "label": "Recommended Propeller", "value": "40 x 13.1 inch" },
      { "label": "Dimension",             "value": "Φ145x60 mm" },
      { "label": "Weight",                "value": "1,854 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.42 V", power:"711.85 W",   thrust:"7.22 kg",  current:"7.16 A",   speed:"1,626 RPM", efficiency:"10.14 g/W" },
      { throttle:"35%",  voltage:"99.36 V", power:"1,000.56 W", thrust:"9.28 kg",  current:"10.07 A",  speed:"1,834 RPM", efficiency:"9.27 g/W" },
      { throttle:"40%",  voltage:"99.28 V", power:"1,350.21 W", thrust:"10.97 kg", current:"13.60 A",  speed:"2,061 RPM", efficiency:"8.12 g/W" },
      { throttle:"45%",  voltage:"99.19 V", power:"1,828.07 W", thrust:"14.08 kg", current:"18.43 A",  speed:"2,289 RPM", efficiency:"7.70 g/W" },
      { throttle:"50%",  voltage:"99.11 V", power:"2,312.24 W", thrust:"16.28 kg", current:"23.33 A",  speed:"2,480 RPM", efficiency:"7.04 g/W" },
      { throttle:"55%",  voltage:"98.98 V", power:"2,851.61 W", thrust:"18.90 kg", current:"28.81 A",  speed:"2,671 RPM", efficiency:"6.63 g/W" },
      { throttle:"60%",  voltage:"98.86 V", power:"3,326.64 W", thrust:"21.08 kg", current:"33.65 A",  speed:"2,813 RPM", efficiency:"6.34 g/W" },
      { throttle:"65%",  voltage:"98.75 V", power:"3,970.74 W", thrust:"23.32 kg", current:"40.21 A",  speed:"3,019 RPM", efficiency:"5.87 g/W" },
      { throttle:"70%",  voltage:"98.57 V", power:"4,622.93 W", thrust:"26.18 kg", current:"46.90 A",  speed:"3,127 RPM", efficiency:"5.66 g/W" },
      { throttle:"75%",  voltage:"98.79 V", power:"5,314.90 W", thrust:"28.72 kg", current:"53.80 A",  speed:"3,324 RPM", efficiency:"5.40 g/W" },
      { throttle:"80%",  voltage:"98.49 V", power:"6,392.00 W", thrust:"32.50 kg", current:"64.90 A",  speed:"3,480 RPM", efficiency:"5.08 g/W" },
      { throttle:"90%",  voltage:"98.05 V", power:"8,275.42 W", thrust:"38.22 kg", current:"84.40 A",  speed:"3,814 RPM", efficiency:"4.62 g/W" },
      { throttle:"100%", voltage:"97.87 V", power:"10,227.42 W",thrust:"43.60 kg", current:"104.50 A", speed:"4,020 RPM", efficiency:"4.26 g/W" },
    ],
  },
  {
    id: "haemng-3lcfswn25",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 1550", name: "HAEMNG 1550", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "50" }, { "label": "Peak Thrust", "value": "46 kg" }, { "label": "Voltage", "value": "24S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "50" },
      { "label": "Rated Voltage (LiPo)",  "value": "24S" },
      { "label": "Peak Current",          "value": "90 A" },
      { "label": "Recommended Thrust",    "value": "15 – 20 kg" },
      { "label": "Peak Thrust",           "value": "46.06 kg" },
      { "label": "Recommended Propeller", "value": "48 x 17.5 inch" },
      { "label": "Dimension",             "value": "Φ145x54 mm" },
      { "label": "Weight",                "value": "2,250 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.39 V", power:"520.80 W",   thrust:"6.92 kg",  current:"5.24 A",   speed:"1,206 RPM", efficiency:"13.29 g/W" },
      { throttle:"35%",  voltage:"99.35 V", power:"767.98 W",   thrust:"9.68 kg",  current:"7.73 A",   speed:"1,305 RPM", efficiency:"12.60 g/W" },
      { throttle:"40%",  voltage:"99.30 V", power:"1,008.89 W", thrust:"12.34 kg", current:"10.16 A",  speed:"1,513 RPM", efficiency:"12.23 g/W" },
      { throttle:"45%",  voltage:"99.24 V", power:"1,319.89 W", thrust:"14.10 kg", current:"13.30 A",  speed:"1,659 RPM", efficiency:"10.68 g/W" },
      { throttle:"50%",  voltage:"99.17 V", power:"1,622.42 W", thrust:"16.74 kg", current:"16.36 A",  speed:"1,781 RPM", efficiency:"10.32 g/W" },
      { throttle:"55%",  voltage:"99.07 V", power:"2,037.87 W", thrust:"20.64 kg", current:"20.57 A",  speed:"1,950 RPM", efficiency:"10.13 g/W" },
      { throttle:"60%",  voltage:"98.96 V", power:"2,635.30 W", thrust:"22.40 kg", current:"26.63 A",  speed:"2,083 RPM", efficiency:"8.50 g/W" },
      { throttle:"65%",  voltage:"98.87 V", power:"3,197.46 W", thrust:"23.94 kg", current:"32.34 A",  speed:"2,215 RPM", efficiency:"7.49 g/W" },
      { throttle:"70%",  voltage:"98.77 V", power:"3,713.75 W", thrust:"27.16 kg", current:"37.60 A",  speed:"2,324 RPM", efficiency:"7.31 g/W" },
      { throttle:"75%",  voltage:"98.64 V", power:"4,251.38 W", thrust:"30.38 kg", current:"43.10 A",  speed:"2,434 RPM", efficiency:"7.15 g/W" },
      { throttle:"80%",  voltage:"98.51 V", power:"5,092.97 W", thrust:"34.26 kg", current:"51.70 A",  speed:"2,563 RPM", efficiency:"6.73 g/W" },
      { throttle:"90%",  voltage:"98.14 V", power:"6,722.59 W", thrust:"41.56 kg", current:"68.50 A",  speed:"2,784 RPM", efficiency:"6.18 g/W" },
      { throttle:"100%", voltage:"98.02 V", power:"8,743.38 W", thrust:"46.06 kg", current:"89.20 A",  speed:"3,004 RPM", efficiency:"5.27 g/W" },
    ],
  },
  {
    id: "maelard-a4w2jf3t2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1026", name: "MAELARD 1026", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_1026.png",
    keySpecs: [ { "label": "KV Rating", "value": "100" }, { "label": "Peak Thrust", "value": "35 kg" }, { "label": "Voltage", "value": "14S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "100" },
      { "label": "Rated Voltage (LiPo)",  "value": "14S" },
      { "label": "Peak Current",          "value": "179 A" },
      { "label": "Recommended Thrust",    "value": "14 – 18 kg" },
      { "label": "Peak Thrust",           "value": "35 kg" },
      { "label": "Recommended Propeller", "value": "32 x 10.5 inch" },
      { "label": "Dimension",             "value": "Φ105x39 mm" },
      { "label": "Weight",                "value": "850 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"57.17 V", power:"818.10 W",   thrust:"7.24 kg",  current:"14.31 A",  speed:"2,440 RPM", efficiency:"8.85 g/W" },
      { throttle:"35%",  voltage:"57.05 V", power:"1,195.20 W", thrust:"9.46 kg",  current:"20.95 A",  speed:"2,796 RPM", efficiency:"7.92 g/W" },
      { throttle:"40%",  voltage:"56.90 V", power:"1,607.43 W", thrust:"11.60 kg", current:"28.25 A",  speed:"3,071 RPM", efficiency:"7.22 g/W" },
      { throttle:"45%",  voltage:"56.76 V", power:"2,168.80 W", thrust:"14.16 kg", current:"38.21 A",  speed:"3,371 RPM", efficiency:"6.53 g/W" },
      { throttle:"50%",  voltage:"56.59 V", power:"2,625.78 W", thrust:"15.98 kg", current:"46.40 A",  speed:"3,584 RPM", efficiency:"6.09 g/W" },
      { throttle:"55%",  voltage:"56.35 V", power:"3,200.68 W", thrust:"18.76 kg", current:"56.80 A",  speed:"3,790 RPM", efficiency:"5.86 g/W" },
      { throttle:"60%",  voltage:"56.15 V", power:"3,842.34 W", thrust:"20.40 kg", current:"68.43 A",  speed:"3,963 RPM", efficiency:"5.31 g/W" },
      { throttle:"65%",  voltage:"56.10 V", power:"4,409.46 W", thrust:"22.78 kg", current:"78.60 A",  speed:"4,181 RPM", efficiency:"5.17 g/W" },
      { throttle:"70%",  voltage:"55.74 V", power:"5,284.15 W", thrust:"24.94 kg", current:"94.80 A",  speed:"4,354 RPM", efficiency:"4.72 g/W" },
      { throttle:"75%",  voltage:"55.59 V", power:"6,009.28 W", thrust:"28.14 kg", current:"108.10 A", speed:"4,662 RPM", efficiency:"4.68 g/W" },
      { throttle:"80%",  voltage:"55.38 V", power:"6,939.11 W", thrust:"29.80 kg", current:"125.30 A", speed:"4,594 RPM", efficiency:"4.29 g/W" },
      { throttle:"90%",  voltage:"54.59 V", power:"8,903.63 W", thrust:"33.96 kg", current:"163.10 A", speed:"5,147 RPM", efficiency:"3.81 g/W" },
      { throttle:"100%", voltage:"50.72 V", power:"9,048.45 W", thrust:"34.13 kg", current:"178.40 A", speed:"5,153 RPM", efficiency:"3.77 g/W" },
    ],
  },
  {
    id: "maelard-vnu49pfqo",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1026", name: "MAELARD 1026", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_1026.png",
    keySpecs: [ { "label": "KV Rating", "value": "100" }, { "label": "Peak Thrust", "value": "31 kg" }, { "label": "Voltage", "value": "12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "100" },
      { "label": "Rated Voltage (LiPo)",  "value": "12S" },
      { "label": "Peak Current",          "value": "179 A" },
      { "label": "Recommended Thrust",    "value": "13 – 17 kg" },
      { "label": "Peak Thrust",           "value": "31 kg" },
      { "label": "Recommended Propeller", "value": "36 x 19 inch" },
      { "label": "Dimension",             "value": "Φ105x39 mm" },
      { "label": "Weight",                "value": "850 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.23 V", power:"656.50 W",   thrust:"7.44 kg",  current:"13.90 A",  speed:"2,048 RPM", efficiency:"11.33 g/W" },
      { throttle:"35%",  voltage:"47.12 V", power:"921.20 W",   thrust:"9.24 kg",  current:"19.55 A",  speed:"2,298 RPM", efficiency:"10.03 g/W" },
      { throttle:"40%",  voltage:"47.02 V", power:"1,177.38 W", thrust:"10.88 kg", current:"25.04 A",  speed:"2,490 RPM", efficiency:"9.24 g/W" },
      { throttle:"45%",  voltage:"46.92 V", power:"1,580.73 W", thrust:"13.02 kg", current:"33.69 A",  speed:"2,742 RPM", efficiency:"8.24 g/W" },
      { throttle:"50%",  voltage:"46.76 V", power:"1,977.95 W", thrust:"15.10 kg", current:"42.30 A",  speed:"2,966 RPM", efficiency:"7.63 g/W" },
      { throttle:"55%",  voltage:"46.59 V", power:"2,473.93 W", thrust:"17.16 kg", current:"53.10 A",  speed:"3,144 RPM", efficiency:"6.94 g/W" },
      { throttle:"60%",  voltage:"46.41 V", power:"2,928.47 W", thrust:"18.72 kg", current:"63.10 A",  speed:"3,250 RPM", efficiency:"6.39 g/W" },
      { throttle:"65%",  voltage:"46.25 V", power:"3,473.38 W", thrust:"20.82 kg", current:"75.10 A",  speed:"3,423 RPM", efficiency:"5.99 g/W" },
      { throttle:"70%",  voltage:"46.03 V", power:"4,055.24 W", thrust:"23.06 kg", current:"88.10 A",  speed:"3,619 RPM", efficiency:"5.69 g/W" },
      { throttle:"75%",  voltage:"45.82 V", power:"4,524.73 W", thrust:"23.84 kg", current:"98.75 A",  speed:"3,654 RPM", efficiency:"5.27 g/W" },
      { throttle:"80%",  voltage:"45.60 V", power:"5,193.84 W", thrust:"25.80 kg", current:"113.90 A", speed:"3,748 RPM", efficiency:"4.97 g/W" },
      { throttle:"90%",  voltage:"44.73 V", power:"7,027.08 W", thrust:"30.20 kg", current:"157.10 A", speed:"3,896 RPM", efficiency:"4.30 g/W" },
      { throttle:"100%", voltage:"42.81 V", power:"7,628.74 W", thrust:"30.44 kg", current:"178.20 A", speed:"3,983 RPM", efficiency:"3.99 g/W" },
    ],
  },
  {
    id: "maelard-wkapubmc7",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1240", name: "MAELARD 1240", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_1240.png",
    keySpecs: [ { "label": "KV Rating", "value": "60" }, { "label": "Peak Thrust", "value": "43 kg" }, { "label": "Voltage", "value": "12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "60" },
      { "label": "Rated Voltage (LiPo)",  "value": "12S" },
      { "label": "Peak Current",          "value": "145 A" },
      { "label": "Recommended Thrust",    "value": "14 – 19 kg" },
      { "label": "Peak Thrust",           "value": "43 kg" },
      { "label": "Recommended Propeller", "value": "48 x 17.5 inch" },
      { "label": "Dimension",             "value": "Φ120x43 mm" },
      {
            "label": "Weight",
            "value": "1,280 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"58.12 V", power:"559.99 W", thrust:"7.02 kg", current:"9.64 A", speed:"1,222 RPM", efficiency:"12.54 g/W" },
      { throttle:"35%", voltage:"57.85 V", power:"775.19 W", thrust:"9.02 kg", current:"13.40 A", speed:"1,374 RPM", efficiency:"11.64 g/W" },
      { throttle:"40%", voltage:"57.38 V", power:"972.59 W", thrust:"10.40 kg", current:"16.95 A", speed:"1,483 RPM", efficiency:"10.69 g/W" },
      { throttle:"45%", voltage:"57.10 V", power:"1,241.35 W", thrust:"12.45 kg", current:"21.74 A", speed:"1,610 RPM", efficiency:"10.03 g/W" },
      { throttle:"50%", voltage:"56.72 V", power:"1,546.75 W", thrust:"14.63 kg", current:"27.27 A", speed:"1,735 RPM", efficiency:"9.46 g/W" },
      { throttle:"55%", voltage:"56.28 V", power:"1,936.59 W", thrust:"16.62 kg", current:"34.41 A", speed:"1,857 RPM", efficiency:"8.58 g/W" },
      { throttle:"60%", voltage:"55.89 V", power:"2,325.02 W", thrust:"18.56 kg", current:"41.60 A", speed:"1,971 RPM", efficiency:"7.98 g/W" },
      { throttle:"65%", voltage:"55.16 V", power:"2,734.28 W", thrust:"20.88 kg", current:"49.57 A", speed:"2,009 RPM", efficiency:"7.64 g/W" },
      { throttle:"70%", voltage:"54.64 V", power:"3,117.21 W", thrust:"22.42 kg", current:"57.05 A", speed:"2,151 RPM", efficiency:"7.19 g/W" },
      { throttle:"75%", voltage:"54.30 V", power:"3,555.56 W", thrust:"24.05 kg", current:"65.48 A", speed:"2,223 RPM", efficiency:"6.76 g/W" },
      { throttle:"80%", voltage:"55.02 V", power:"4,410.40 W", thrust:"26.90 kg", current:"80.16 A", speed:"2,357 RPM", efficiency:"6.10 g/W" },
      { throttle:"90%", voltage:"53.77 V", power:"5,484.54 W", thrust:"30.72 kg", current:"102.00 A", speed:"2,508 RPM", efficiency:"5.60 g/W" },
      { throttle:"100%", voltage:"53.12 V", power:"6,618.75 W", thrust:"33.91 kg", current:"124.60 A", speed:"2,641 RPM", efficiency:"5.12 g/W" },
    ],
  },
  {
    id: "ips-k992ry3bg",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "HAEMNG 7010 & F60 12S ESC", name: "HAEMNG 7010 & F60 12S ESC", tag: "IPS", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "150"  }, { "label": "Peak Thrust", "value": "5 kg"  }, { "label": "Voltage", "value": "12S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "150"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "12S"
      },
      {
            "label": "Peak Current",
            "value": "110 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "5 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "14.5 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "23 x 8.8 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ122x70x65.5 mm"
      },
      {
            "label": "Weight (with wires)",
            "value": "660 g"
      }
],
  },
  {
    id: "maelard-4irvoyh8l",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "MAELARD 1026 & E150 12S ESC", name: "MAELARD 1026 & E150 12S ESC", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "100"  }, { "label": "Peak Thrust", "value": "12 kg"  }, { "label": "Voltage", "value": "14S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "100"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "14S"
      },
      {
            "label": "Peak Current",
            "value": "150 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "12 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "24 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "36 x 19 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ110x105x86.1 mm"
      },
      {
            "label": "Weight (with wires)",
            "value": "1,482 g"
      }
],
  },
  {
    id: "maelard-svex1f94t",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "MAELARD 1026 & F120 14S ESC", name: "MAELARD 1026 & F120 14S ESC", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "100"  }, { "label": "Peak Thrust", "value": "6 kg"  }, { "label": "Voltage", "value": "14S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "100"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "14S"
      },
      {
            "label": "Peak Current",
            "value": "70 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "6 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "18 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "36 x 19 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ140x105x119.6 mm"
      },
      {
            "label": "Weight",
            "value": "1,318 g"
      }
],
  },
  {
    id: "maelard-bvszvpczv",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "MAELARD 1240 & E260 14S ESC", name: "MAELARD 1240 & E260 14S ESC", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "60"  }, { "label": "Peak Thrust", "value": "26 kg"  }, { "label": "Voltage", "value": "14S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "60"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "14S"
      },
      {
            "label": "Peak Current",
            "value": "150 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "26 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "50 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "48 x 17.5 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ225x120x158 mm"
      },
      {
            "label": "Weight",
            "value": "4,165 g"
      }
],
  },
  {
    id: "maelard-sz6lpwgd0",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "MAELARD 1536 & EH200 24S ESC", name: "MAELARD 1536 & EH200 24S ESC", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "80"  }, { "label": "Peak Thrust", "value": "24 kg"  }, { "label": "Voltage", "value": "24S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "80"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "24S"
      },
      {
            "label": "Peak Current",
            "value": "190 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "24 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "55 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "40 x 13.1 inch"
      },
      {
            "label": "Dimension",
            "value": "Φ225x155x210 mm"
      },
      {
            "label": "Weight",
            "value": "5,670 g"
      }
],
  },
  {
    id: "esc-6z5af7bk8",
    series: "esc", seriesLabel: "ESCs",
    model: "E40 V2 12S", name: "E40 V2 12S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "40 A"  }, { "label": "Battery", "value": "12S"  }, { "label": "Weight", "value": "57 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "60.2 x 31.0 x 16.0 mm"
      },
      {
            "label": "Power Line",
            "value": "16 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "40 A"
      },
      {
            "label": "Current Limiting",
            "value": "48 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "No"
      },
      {
            "label": "Weight (with wires)",
            "value": "57 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "12S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "No"
      },
      {
            "label": "Protection Grade",
            "value": "IPX4"
      },
      {
            "label": "Motor Line",
            "value": "16 AWG"
      }
],
  },
  {
    id: "esc-eepf86ho2",
    series: "esc", seriesLabel: "ESCs",
    model: "E60 12S", name: "E60 12S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "60 A"  }, { "label": "Battery", "value": "12S"  }, { "label": "Weight", "value": "108 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "70.2 x 31.0 x 16.0 mm"
      },
      {
            "label": "Power Line",
            "value": "14 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "60 A"
      },
      {
            "label": "Current Limiting",
            "value": "72 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "No"
      },
      {
            "label": "Weight (with wires)",
            "value": "108 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "12S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "No"
      },
      {
            "label": "Protection Grade",
            "value": "IPX4"
      },
      {
            "label": "Motor Line",
            "value": "14 AWG"
      }
],
  },
  {
    id: "esc-bxxdn0bgg",
    series: "esc", seriesLabel: "ESCs",
    model: "E120 12S", name: "E120 12S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "120 A"  }, { "label": "Battery", "value": "12S"  }, { "label": "Weight", "value": "215 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "81.8 x 41.2 x 23.2 mm"
      },
      {
            "label": "Power Line",
            "value": "12 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "120 A"
      },
      {
            "label": "Current Limiting",
            "value": "120 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "Yes"
      },
      {
            "label": "Weight (with wires)",
            "value": "215 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "12S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "Yes"
      },
      {
            "label": "Protection Grade",
            "value": "IP67"
      },
      {
            "label": "Motor Line",
            "value": "12 AWG"
      }
],
  },
  {
    id: "esc-zxyrl48rr",
    series: "esc", seriesLabel: "ESCs",
    model: "EH200 24S", name: "EH200 24S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "200 A"  }, { "label": "Battery", "value": "24S"  }, { "label": "Weight", "value": "725 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "5V / 200mA output"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "160.7 x 72 x 46 mm"
      },
      {
            "label": "Power Line",
            "value": "8 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "200 A"
      },
      {
            "label": "Current Limiting",
            "value": "200 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "Yes"
      },
      {
            "label": "Weight (with wires)",
            "value": "725 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "24S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "Yes"
      },
      {
            "label": "Protection Grade",
            "value": "IPX4"
      },
      {
            "label": "Motor Line",
            "value": "8 AWG"
      }
],
  },
  {
    id: "esc-locti9bx7",
    series: "esc", seriesLabel: "ESCs",
    model: "E260 14S", name: "E260 14S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "260 A"  }, { "label": "Battery", "value": "14S"  }, { "label": "Weight", "value": "537 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "5V / 200mA output"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "130.0 x 65.3 x 43.0 mm"
      },
      {
            "label": "Power Line",
            "value": "8 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "260 A"
      },
      {
            "label": "Current Limiting",
            "value": "260 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "Yes"
      },
      {
            "label": "Weight (with wires)",
            "value": "537 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "14S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "Yes"
      },
      {
            "label": "Protection Grade",
            "value": "IPX4"
      },
      {
            "label": "Motor Line",
            "value": "8 AWG"
      }
],
  },
  {
    id: "esc-8q6gbe0z3",
    series: "esc", seriesLabel: "ESCs",
    model: "E150 14S", name: "E150 14S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "150 A"  }, { "label": "Battery", "value": "14S"  }, { "label": "Weight", "value": "357 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "98.0 x 50.0 x 33.9 mm"
      },
      {
            "label": "Power Line",
            "value": "10 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "150 A"
      },
      {
            "label": "Current Limiting",
            "value": "150 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "Yes"
      },
      {
            "label": "Weight (with wires)",
            "value": "357 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "14S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "Yes"
      },
      {
            "label": "Protection Grade",
            "value": "IP67"
      },
      {
            "label": "Motor Line",
            "value": "12 AWG"
      }
],
  },
  {
    id: "esc-z8owr938a",
    series: "esc", seriesLabel: "ESCs",
    model: "E200 14S", name: "E200 14S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "200 A"  }, { "label": "Battery", "value": "14S"  }, { "label": "Weight", "value": "320 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "117.5 x 56.3 x 42.8 mm"
      },
      {
            "label": "Power Line",
            "value": "8 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "200 A"
      },
      {
            "label": "Current Limiting",
            "value": "200 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "Yes"
      },
      {
            "label": "Weight (without lines)",
            "value": "320 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "14S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "Yes"
      },
      {
            "label": "Protection Grade",
            "value": "IP67"
      },
      {
            "label": "Motor Line",
            "value": "8 AWG"
      }
],
  },
  {
    id: "esc-njzr7o9zc",
    series: "esc", seriesLabel: "ESCs",
    model: "F120A 12S", name: "F120A 12S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "150 A"  }, { "label": "Battery", "value": "12S – 14S"  }, { "label": "Weight", "value": "248 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "123.5 x 58.6 x 30.25 mm"
      },
      {
            "label": "Power Line",
            "value": "10 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "150 A"
      },
      {
            "label": "Current Limiting",
            "value": "150 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "No"
      },
      {
            "label": "Weight (without lines)",
            "value": "248 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "12S – 14S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "Yes"
      },
      {
            "label": "Protection Grade",
            "value": "IP67"
      },
      {
            "label": "Motor Line",
            "value": "12 AWG"
      }
],
  },
  {
    id: "esc-fkfwura91",
    series: "esc", seriesLabel: "ESCs",
    model: "F30 6S", name: "F30 6S", tag: "ESC", application: "UAV / Multi-Rotor",
    keySpecs: [ { "label": "Continuous", "value": "30 A"  }, { "label": "Battery", "value": "6S"  }, { "label": "Weight", "value": "65 g"  }
],
    allSpecs: [
      {
            "label": "BEC",
            "value": "No"
      },
      {
            "label": "PWM Input Signal Voltage",
            "value": "3.3V / 5V (compatible)"
      },
      {
            "label": "Throttle Loss Protection",
            "value": "Yes"
      },
      {
            "label": "Phase Short Circuit Protection",
            "value": "Yes"
      },
      {
            "label": "Size (L x W x H)",
            "value": "95 x 30 x 19.5 mm"
      },
      {
            "label": "Power Line",
            "value": "16 AWG"
      },
      {
            "label": "Continuous Current",
            "value": "30 A"
      },
      {
            "label": "Current Limiting",
            "value": "35 A"
      },
      {
            "label": "Throttle Pulse Width",
            "value": "1050 us – 1940 us"
      },
      {
            "label": "Voltage Protection",
            "value": "Yes"
      },
      {
            "label": "Temperature Protection",
            "value": "Yes"
      },
      {
            "label": "Speed Signal Output",
            "value": "No"
      },
      {
            "label": "Weight (without wires)",
            "value": "65 g"
      },
      {
            "label": "Working Environmental Temperature",
            "value": "-20 to 65 C"
      },
      {
            "label": "Recommended Battery",
            "value": "6S"
      },
      {
            "label": "Compatible Signal Frequency",
            "value": "50–500 Hz"
      },
      {
            "label": "Stall Protection",
            "value": "Yes"
      },
      {
            "label": "Error Signal Output",
            "value": "No"
      },
      {
            "label": "Protection Grade",
            "value": "IPX4"
      },
      {
            "label": "Motor Line",
            "value": "16 AWG"
      }
],
  },
  {
    id: "fc-ubt9raiib",
    series: "fc", seriesLabel: "Flight Controller",
    model: "Auto Pilot", name: "Auto Pilot", tag: "FC", application: "Multi-Mission",
    keySpecs: [ { "label": "Core", "value": "Triple IMU"  }, { "label": "PWM", "value": "8+6"  }, { "label": "Weight", "value": "155 g"  }
],
    allSpecs: [
      {
            "label": "Operating Voltage",
            "value": "4.5 – 5.5 V"
      },
      {
            "label": "Operating Temperature",
            "value": "-20 to 70 C"
      },
      {
            "label": "Size",
            "value": "95.1 x 62 x 23 mm"
      },
      {
            "label": "Weight",
            "value": "155 g"
      },
      {
            "label": "PWM Output",
            "value": "8 PWM + 6 AUX (PWM/GPIO)"
      },
      {
            "label": "RC IN",
            "value": "PPM / SBUS"
      },
      {
            "label": "USB",
            "value": "Type C"
      },
      {
            "label": "Power Monitor",
            "value": "2 (Analog / CAN)"
      },
      {
            "label": "Power Input",
            "value": "8 pin ClickMate Molex"
      },
      {
            "label": "Output Connector",
            "value": "J30J – 51 Pin MIL Std connector"
      },
      {
            "label": "Software Support",
            "value": "Mission Planner / Q Ground Control"
      },
      {
            "label": "Sensors",
            "value": "Triple IMU, Dual Barometer, Compass"
      },
      {
            "label": "Communication",
            "value": "5 UART, 3 I2C, 2 CAN, 2 ADC"
      }
],
  },
  // ─── Haemng 8808 Variant 1: 28x9.2" 6S-12S KV160 ───
  {
    id: "haemng-8808v1",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 8808", name: "HAEMNG 8808", tag: "HAEMNG", application: "UAV / eVTOL",
    thumbnailUrl: "/assets/products/haemng_8808.png",
    keySpecs: [ { "label": "KV Rating", "value": "160" }, { "label": "Peak Thrust", "value": "5 kg" }, { "label": "Voltage", "value": "6S – 12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "160" },
      { "label": "Rated Voltage (LiPo)",  "value": "6S – 12S" },
      { "label": "Peak Current",          "value": "25 A" },
      { "label": "Recommended Thrust",    "value": "1.5 – 2 kg" },
      { "label": "Peak Thrust",           "value": "5 kg" },
      { "label": "Recommended Propeller", "value": "28 x 9.2 inch" },
      { "label": "Dimension",             "value": "Φ88x21 mm" },
      { "label": "Weight",                "value": "265 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.24 V", power:"35.56 W",  thrust:"0.68 kg", current:"1.53 A",  speed:"1,104 RPM", efficiency:"19.12 g/W" },
      { throttle:"35%",  voltage:"23.22 V", power:"51.08 W",  thrust:"0.88 kg", current:"2.20 A",  speed:"1,260 RPM", efficiency:"17.23 g/W" },
      { throttle:"40%",  voltage:"23.20 V", power:"67.05 W",  thrust:"1.08 kg", current:"2.89 A",  speed:"1,387 RPM", efficiency:"16.11 g/W" },
      { throttle:"45%",  voltage:"23.18 V", power:"88.32 W",  thrust:"1.30 kg", current:"3.81 A",  speed:"1,512 RPM", efficiency:"14.72 g/W" },
      { throttle:"50%",  voltage:"23.15 V", power:"110.89 W", thrust:"1.54 kg", current:"4.79 A",  speed:"1,632 RPM", efficiency:"13.89 g/W" },
      { throttle:"55%",  voltage:"23.11 V", power:"140.74 W", thrust:"1.80 kg", current:"6.09 A",  speed:"1,781 RPM", efficiency:"12.79 g/W" },
      { throttle:"60%",  voltage:"23.07 V", power:"165.87 W", thrust:"2.12 kg", current:"7.19 A",  speed:"1,901 RPM", efficiency:"12.78 g/W" },
      { throttle:"65%",  voltage:"22.98 V", power:"211.65 W", thrust:"2.40 kg", current:"9.21 A",  speed:"2,020 RPM", efficiency:"11.34 g/W" },
      { throttle:"70%",  voltage:"22.92 V", power:"245.47 W", thrust:"2.66 kg", current:"10.71 A", speed:"2,120 RPM", efficiency:"10.84 g/W" },
      { throttle:"75%",  voltage:"22.89 V", power:"284.29 W", thrust:"2.96 kg", current:"12.42 A", speed:"2,233 RPM", efficiency:"10.41 g/W" },
      { throttle:"80%",  voltage:"22.85 V", power:"337.95 W", thrust:"3.30 kg", current:"14.79 A", speed:"2,352 RPM", efficiency:"9.76 g/W" },
      { throttle:"90%",  voltage:"22.77 V", power:"444.02 W", thrust:"3.92 kg", current:"19.50 A", speed:"2,560 RPM", efficiency:"8.83 g/W" },
      { throttle:"100%", voltage:"22.67 V", power:"538.64 W", thrust:"4.44 kg", current:"23.76 A", speed:"2,719 RPM", efficiency:"8.24 g/W" },
    ],
  },
  // ─── Haemng 8808 Variant 2: 30x10.5" 6S-12S KV160 ───
  {
    id: "haemng-8808v2",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 8808", name: "HAEMNG 8808", tag: "HAEMNG", application: "UAV / eVTOL",
    thumbnailUrl: "/assets/products/haemng_8808.png",
    keySpecs: [ { "label": "KV Rating", "value": "160" }, { "label": "Peak Thrust", "value": "6 kg" }, { "label": "Voltage", "value": "6S – 12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "160" },
      { "label": "Rated Voltage (LiPo)",  "value": "6S – 12S" },
      { "label": "Peak Current",          "value": "30 A" },
      { "label": "Recommended Thrust",    "value": "2 – 3 kg" },
      { "label": "Peak Thrust",           "value": "6 kg" },
      { "label": "Recommended Propeller", "value": "30 x 10.5 inch" },
      { "label": "Dimension",             "value": "Φ88x21 mm" },
      { "label": "Weight",                "value": "265 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.27 V", power:"49.33 W",  thrust:"0.88 kg", current:"2.12 A",  speed:"1,069 RPM", efficiency:"17.84 g/W" },
      { throttle:"35%",  voltage:"23.25 V", power:"71.84 W",  thrust:"1.16 kg", current:"3.09 A",  speed:"1,218 RPM", efficiency:"16.15 g/W" },
      { throttle:"40%",  voltage:"23.24 V", power:"93.89 W",  thrust:"1.44 kg", current:"4.04 A",  speed:"1,329 RPM", efficiency:"15.34 g/W" },
      { throttle:"45%",  voltage:"23.21 V", power:"120.92 W", thrust:"1.78 kg", current:"5.21 A",  speed:"1,448 RPM", efficiency:"14.72 g/W" },
      { throttle:"50%",  voltage:"23.18 V", power:"149.51 W", thrust:"2.06 kg", current:"6.45 A",  speed:"1,553 RPM", efficiency:"13.78 g/W" },
      { throttle:"55%",  voltage:"23.15 V", power:"188.67 W", thrust:"2.42 kg", current:"8.15 A",  speed:"1,681 RPM", efficiency:"12.83 g/W" },
      { throttle:"60%",  voltage:"23.10 V", power:"234.00 W", thrust:"2.76 kg", current:"10.13 A", speed:"1,799 RPM", efficiency:"11.79 g/W" },
      { throttle:"65%",  voltage:"23.10 V", power:"278.12 W", thrust:"3.08 kg", current:"12.04 A", speed:"1,897 RPM", efficiency:"11.07 g/W" },
      { throttle:"70%",  voltage:"23.03 V", power:"323.11 W", thrust:"3.44 kg", current:"14.03 A", speed:"1,995 RPM", efficiency:"10.65 g/W" },
      { throttle:"75%",  voltage:"22.97 V", power:"371.42 W", thrust:"3.76 kg", current:"16.17 A", speed:"2,076 RPM", efficiency:"10.12 g/W" },
      { throttle:"80%",  voltage:"22.92 V", power:"432.50 W", thrust:"4.12 kg", current:"18.87 A", speed:"2,178 RPM", efficiency:"9.53 g/W" },
      { throttle:"90%",  voltage:"22.84 V", power:"563.23 W", thrust:"4.78 kg", current:"24.66 A", speed:"2,349 RPM", efficiency:"8.49 g/W" },
      { throttle:"100%", voltage:"22.67 V", power:"678.06 W", thrust:"5.40 kg", current:"29.91 A", speed:"2,473 RPM", efficiency:"7.96 g/W" },
    ],
  },
  // ─── Haemng 8808 Variant 3: 28x9.2" 12S KV130 ───
  {
    id: "haemng-8808v3",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 8808", name: "HAEMNG 8808", tag: "HAEMNG", application: "UAV / eVTOL",
    thumbnailUrl: "/assets/products/haemng_8808.png",
    keySpecs: [ { "label": "KV Rating", "value": "130" }, { "label": "Peak Thrust", "value": "11 kg" }, { "label": "Voltage", "value": "12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "130" },
      { "label": "Rated Voltage (LiPo)",  "value": "12S" },
      { "label": "Peak Current",          "value": "46 A" },
      { "label": "Recommended Thrust",    "value": "3.5 – 5 kg" },
      { "label": "Peak Thrust",           "value": "11 kg" },
      { "label": "Recommended Propeller", "value": "28 x 9.2 inch" },
      { "label": "Dimension",             "value": "Φ88x21 mm" },
      { "label": "Weight",                "value": "275 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.38 V", power:"135.51 W",   thrust:"1.98 kg",  current:"2.86 A",  speed:"1,729 RPM", efficiency:"14.61 g/W" },
      { throttle:"35%",  voltage:"47.31 V", power:"186.87 W",   thrust:"2.48 kg",  current:"3.95 A",  speed:"1,911 RPM", efficiency:"13.27 g/W" },
      { throttle:"40%",  voltage:"47.24 V", power:"265.49 W",   thrust:"3.14 kg",  current:"5.62 A",  speed:"2,164 RPM", efficiency:"11.83 g/W" },
      { throttle:"45%",  voltage:"47.20 V", power:"357.78 W",   thrust:"3.76 kg",  current:"7.58 A",  speed:"2,380 RPM", efficiency:"10.51 g/W" },
      { throttle:"50%",  voltage:"47.17 V", power:"454.25 W",   thrust:"4.38 kg",  current:"9.63 A",  speed:"2,564 RPM", efficiency:"9.64 g/W" },
      { throttle:"55%",  voltage:"47.16 V", power:"564.98 W",   thrust:"5.06 kg",  current:"11.98 A", speed:"2,719 RPM", efficiency:"8.96 g/W" },
      { throttle:"60%",  voltage:"47.07 V", power:"657.66 W",   thrust:"5.52 kg",  current:"13.96 A", speed:"2,895 RPM", efficiency:"8.39 g/W" },
      { throttle:"65%",  voltage:"47.06 V", power:"797.67 W",   thrust:"6.24 kg",  current:"16.95 A", speed:"3,042 RPM", efficiency:"7.82 g/W" },
      { throttle:"70%",  voltage:"46.98 V", power:"937.25 W",   thrust:"6.62 kg",  current:"19.95 A", speed:"3,202 RPM", efficiency:"7.06 g/W" },
      { throttle:"75%",  voltage:"46.91 V", power:"1,083.62 W", thrust:"7.12 kg",  current:"23.10 A", speed:"3,324 RPM", efficiency:"6.57 g/W" },
      { throttle:"80%",  voltage:"46.82 V", power:"1,250.56 W", thrust:"7.66 kg",  current:"26.71 A", speed:"3,416 RPM", efficiency:"6.13 g/W" },
      { throttle:"90%",  voltage:"47.07 V", power:"1,773.13 W", thrust:"9.20 kg",  current:"37.67 A", speed:"3,743 RPM", efficiency:"5.19 g/W" },
      { throttle:"100%", voltage:"46.91 V", power:"2,131.12 W", thrust:"10.60 kg", current:"45.43 A", speed:"3,884 RPM", efficiency:"4.97 g/W" },
    ],
  },
  // ─── Haemng 1015 ───
  {
    id: "haemng-1015",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 1015", name: "HAEMNG 1015", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "136" }, { "label": "Peak Thrust", "value": "18 kg" }, { "label": "Voltage", "value": "12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "136" },
      { "label": "Rated Voltage (LiPo)",  "value": "12S" },
      { "label": "Peak Current",          "value": "90 A" },
      { "label": "Recommended Thrust",    "value": "8 – 9 kg" },
      { "label": "Peak Thrust",           "value": "18 kg" },
      { "label": "Recommended Propeller", "value": "30 inch" },
      { "label": "Dimension",             "value": "Φ99x37.50 mm" },
      { "label": "Weight",                "value": "636 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.27 V", power:"209.88 W",   thrust:"2.48 kg",  current:"4.44 A",  speed:"1,691 RPM", efficiency:"11.82 g/W" },
      { throttle:"35%",  voltage:"47.24 V", power:"310.37 W",   thrust:"3.68 kg",  current:"6.57 A",  speed:"1,971 RPM", efficiency:"11.86 g/W" },
      { throttle:"40%",  voltage:"47.19 V", power:"456.80 W",   thrust:"4.68 kg",  current:"9.68 A",  speed:"2,253 RPM", efficiency:"10.25 g/W" },
      { throttle:"45%",  voltage:"47.11 V", power:"606.31 W",   thrust:"5.72 kg",  current:"12.87 A", speed:"2,492 RPM", efficiency:"9.43 g/W" },
      { throttle:"50%",  voltage:"47.03 V", power:"775.05 W",   thrust:"6.70 kg",  current:"16.48 A", speed:"2,698 RPM", efficiency:"8.64 g/W" },
      { throttle:"55%",  voltage:"46.94 V", power:"976.35 W",   thrust:"7.90 kg",  current:"20.80 A", speed:"2,919 RPM", efficiency:"8.09 g/W" },
      { throttle:"60%",  voltage:"46.80 V", power:"1,190.12 W", thrust:"8.94 kg",  current:"25.43 A", speed:"3,110 RPM", efficiency:"7.51 g/W" },
      { throttle:"65%",  voltage:"46.73 V", power:"1,420.12 W", thrust:"9.96 kg",  current:"30.39 A", speed:"3,278 RPM", efficiency:"7.01 g/W" },
      { throttle:"70%",  voltage:"46.50 V", power:"1,692.14 W", thrust:"11.20 kg", current:"36.39 A", speed:"3,460 RPM", efficiency:"6.62 g/W" },
      { throttle:"75%",  voltage:"46.48 V", power:"1,966.10 W", thrust:"12.32 kg", current:"42.30 A", speed:"3,625 RPM", efficiency:"6.27 g/W" },
      { throttle:"80%",  voltage:"46.36 V", power:"2,345.82 W", thrust:"13.62 kg", current:"50.60 A", speed:"3,817 RPM", efficiency:"5.81 g/W" },
      { throttle:"90%",  voltage:"46.10 V", power:"3,014.94 W", thrust:"16.20 kg", current:"65.40 A", speed:"4,069 RPM", efficiency:"5.37 g/W" },
      { throttle:"100%", voltage:"45.86 V", power:"4,086.13 W", thrust:"17.36 kg", current:"89.10 A", speed:"4,335 RPM", efficiency:"4.25 g/W" },
    ],
  },
  // ─── Maelard 4101 ───
  {
    id: "maelard-4101",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 4101", name: "MAELARD 4101", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "700" }, { "label": "Peak Thrust", "value": "2 kg" }, { "label": "Voltage", "value": "3 – 4S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "700" },
      { "label": "Rated Voltage (LiPo)",  "value": "3 – 4S" },
      { "label": "Peak Current",          "value": "21 A" },
      { "label": "Recommended Thrust",    "value": "0.55 – 0.75 kg" },
      { "label": "Peak Thrust",           "value": "2 kg" },
      { "label": "Recommended Propeller", "value": "13 x 4.4 inch" },
      { "label": "Dimension",             "value": "Φ41x30.80 mm" },
      { "label": "Weight",                "value": "99 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"14.02 V", power:"21.59 W",  thrust:"0.32 kg", current:"1.54 A",  speed:"3,380 RPM", efficiency:"14.82 g/W" },
      { throttle:"35%",  voltage:"14.01 V", power:"31.66 W",  thrust:"0.40 kg", current:"2.26 A",  speed:"3,860 RPM", efficiency:"12.63 g/W" },
      { throttle:"40%",  voltage:"14.00 V", power:"41.58 W",  thrust:"0.48 kg", current:"2.97 A",  speed:"4,233 RPM", efficiency:"11.54 g/W" },
      { throttle:"45%",  voltage:"13.99 V", power:"53.02 W",  thrust:"0.57 kg", current:"3.79 A",  speed:"4,577 RPM", efficiency:"10.75 g/W" },
      { throttle:"50%",  voltage:"13.96 V", power:"67.57 W",  thrust:"0.67 kg", current:"4.84 A",  speed:"4,966 RPM", efficiency:"9.92 g/W" },
      { throttle:"55%",  voltage:"13.93 V", power:"84.42 W",  thrust:"0.77 kg", current:"6.06 A",  speed:"5,341 RPM", efficiency:"9.12 g/W" },
      { throttle:"60%",  voltage:"13.89 V", power:"102.79 W", thrust:"0.87 kg", current:"7.40 A",  speed:"5,700 RPM", efficiency:"8.46 g/W" },
      { throttle:"65%",  voltage:"13.85 V", power:"122.16 W", thrust:"0.95 kg", current:"8.82 A",  speed:"6,006 RPM", efficiency:"7.78 g/W" },
      { throttle:"70%",  voltage:"13.79 V", power:"141.07 W", thrust:"1.08 kg", current:"10.23 A", speed:"6,280 RPM", efficiency:"7.66 g/W" },
      { throttle:"75%",  voltage:"13.74 V", power:"162.41 W", thrust:"1.16 kg", current:"11.82 A", speed:"6,617 RPM", efficiency:"7.14 g/W" },
      { throttle:"80%",  voltage:"13.71 V", power:"188.10 W", thrust:"1.31 kg", current:"13.72 A", speed:"6,861 RPM", efficiency:"6.96 g/W" },
      { throttle:"90%",  voltage:"13.62 V", power:"244.62 W", thrust:"1.31 kg", current:"17.96 A", speed:"7,474 RPM", efficiency:"5.36 g/W" },
      { throttle:"100%", voltage:"13.51 V", power:"291.82 W", thrust:"1.51 kg", current:"21.60 A", speed:"7,764 RPM", efficiency:"5.17 g/W" },
    ],
  },
  // ─── Maelard 4102 Variant 1: 15x5" ───
  {
    id: "maelard-4102v1",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 4102", name: "MAELARD 4102", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "580" }, { "label": "Peak Thrust", "value": "4 kg" }, { "label": "Voltage", "value": "6S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "580" },
      { "label": "Rated Voltage (LiPo)",  "value": "6S" },
      { "label": "Peak Current",          "value": "35 A" },
      { "label": "Recommended Thrust",    "value": "1.20 – 1.40 kg" },
      { "label": "Peak Thrust",           "value": "4 kg" },
      { "label": "Recommended Propeller", "value": "15 x 5 inch" },
      { "label": "Dimension",             "value": "Φ42x33.80 mm" },
      { "label": "Weight",                "value": "145 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.20 V", power:"54.75 W",  thrust:"0.58 kg", current:"2.36 A",  speed:"3,611 RPM", efficiency:"10.65 g/W" },
      { throttle:"35%",  voltage:"23.18 V", power:"80.20 W",  thrust:"0.71 kg", current:"3.46 A",  speed:"4,073 RPM", efficiency:"8.89 g/W" },
      { throttle:"40%",  voltage:"23.15 V", power:"104.18 W", thrust:"0.79 kg", current:"4.50 A",  speed:"4,439 RPM", efficiency:"7.61 g/W" },
      { throttle:"45%",  voltage:"23.11 V", power:"133.11 W", thrust:"1.05 kg", current:"5.76 A",  speed:"4,797 RPM", efficiency:"7.89 g/W" },
      { throttle:"50%",  voltage:"23.08 V", power:"165.02 W", thrust:"1.24 kg", current:"7.15 A",  speed:"5,153 RPM", efficiency:"7.51 g/W" },
      { throttle:"55%",  voltage:"23.04 V", power:"209.20 W", thrust:"1.42 kg", current:"9.08 A",  speed:"5,532 RPM", efficiency:"6.79 g/W" },
      { throttle:"60%",  voltage:"22.98 V", power:"253.01 W", thrust:"1.79 kg", current:"11.01 A", speed:"5,850 RPM", efficiency:"7.07 g/W" },
      { throttle:"65%",  voltage:"22.95 V", power:"298.81 W", thrust:"2.14 kg", current:"13.02 A", speed:"6,172 RPM", efficiency:"7.16 g/W" },
      { throttle:"70%",  voltage:"22.91 V", power:"352.81 W", thrust:"2.23 kg", current:"15.40 A", speed:"6,455 RPM", efficiency:"6.31 g/W" },
      { throttle:"75%",  voltage:"22.83 V", power:"411.40 W", thrust:"2.60 kg", current:"18.02 A", speed:"6,689 RPM", efficiency:"6.32 g/W" },
      { throttle:"80%",  voltage:"22.78 V", power:"461.75 W", thrust:"2.70 kg", current:"20.27 A", speed:"6,942 RPM", efficiency:"5.85 g/W" },
      { throttle:"90%",  voltage:"22.70 V", power:"590.43 W", thrust:"2.96 kg", current:"26.01 A", speed:"7,354 RPM", efficiency:"5.01 g/W" },
      { throttle:"100%", voltage:"22.79 V", power:"764.83 W", thrust:"3.41 kg", current:"33.56 A", speed:"7,980 RPM", efficiency:"4.46 g/W" },
    ],
  },
  // ─── Maelard 4102 Variant 2: 16x5.4" ───
  {
    id: "maelard-4102v2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 4102", name: "MAELARD 4102", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "580" }, { "label": "Peak Thrust", "value": "3 kg" }, { "label": "Voltage", "value": "6S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "580" },
      { "label": "Rated Voltage (LiPo)",  "value": "6S" },
      { "label": "Peak Current",          "value": "45 A" },
      { "label": "Recommended Thrust",    "value": "1.40 – 1.70 kg" },
      { "label": "Peak Thrust",           "value": "3 kg" },
      { "label": "Recommended Propeller", "value": "16 x 5.4 inch" },
      { "label": "Dimension",             "value": "Φ42x33.80 mm" },
      { "label": "Weight",                "value": "145 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.17 V", power:"66.73 W",  thrust:"0.64 kg", current:"2.88 A",  speed:"3,352 RPM", efficiency:"9.53 g/W" },
      { throttle:"35%",  voltage:"23.14 V", power:"102.97 W", thrust:"0.89 kg", current:"4.45 A",  speed:"3,874 RPM", efficiency:"8.68 g/W" },
      { throttle:"40%",  voltage:"23.09 V", power:"130.46 W", thrust:"1.04 kg", current:"5.65 A",  speed:"4,168 RPM", efficiency:"7.97 g/W" },
      { throttle:"45%",  voltage:"23.05 V", power:"167.11 W", thrust:"1.25 kg", current:"7.25 A",  speed:"4,490 RPM", efficiency:"7.48 g/W" },
      { throttle:"50%",  voltage:"23.01 V", power:"202.72 W", thrust:"1.45 kg", current:"8.81 A",  speed:"4,781 RPM", efficiency:"7.15 g/W" },
      { throttle:"55%",  voltage:"22.95 V", power:"260.48 W", thrust:"1.69 kg", current:"11.35 A", speed:"5,136 RPM", efficiency:"6.49 g/W" },
      { throttle:"60%",  voltage:"22.90 V", power:"305.03 W", thrust:"1.85 kg", current:"13.32 A", speed:"5,446 RPM", efficiency:"6.07 g/W" },
      { throttle:"65%",  voltage:"22.84 V", power:"368.18 W", thrust:"2.03 kg", current:"16.12 A", speed:"5,610 RPM", efficiency:"5.51 g/W" },
      { throttle:"70%",  voltage:"22.78 V", power:"428.26 W", thrust:"2.01 kg", current:"18.80 A", speed:"5,725 RPM", efficiency:"4.69 g/W" },
      { throttle:"75%",  voltage:"22.77 V", power:"498.44 W", thrust:"2.16 kg", current:"21.89 A", speed:"5,925 RPM", efficiency:"4.33 g/W" },
      { throttle:"80%",  voltage:"22.92 V", power:"596.38 W", thrust:"2.69 kg", current:"26.02 A", speed:"6,360 RPM", efficiency:"4.51 g/W" },
      { throttle:"90%",  voltage:"21.06 V", power:"632.43 W", thrust:"2.70 kg", current:"30.03 A", speed:"6,526 RPM", efficiency:"4.27 g/W" },
      { throttle:"100%", voltage:"21.08 V", power:"946.49 W", thrust:"2.81 kg", current:"44.90 A", speed:"6,610 RPM", efficiency:"2.97 g/W" },
    ],
  },
  // ─── Maelard 1560 Variant 1: 24S ───
  {
    id: "maelard-1560v1",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1560", name: "MAELARD 1560", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_1560.png",
    keySpecs: [ { "label": "KV Rating", "value": "36" }, { "label": "Peak Thrust", "value": "68 kg" }, { "label": "Voltage", "value": "14S – 28S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "36" },
      { "label": "Rated Voltage (LiPo)",  "value": "14S – 28S" },
      { "label": "Peak Current",          "value": "110 A" },
      { "label": "Recommended Thrust",    "value": "24 – 30 kg" },
      { "label": "Peak Thrust",           "value": "68 kg" },
      { "label": "Recommended Propeller", "value": "56 x 20 inch" },
      { "label": "Dimension",             "value": "Φ150x58.5 mm" },
      { "label": "Weight",                "value": "2,320 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.36 V",  power:"706.45 W",    thrust:"9.65 kg",  current:"7.11 A",   speed:"1,001 RPM", efficiency:"13.66 g/W" },
      { throttle:"35%",  voltage:"99.31 V",  power:"1,011.97 W",  thrust:"13.04 kg", current:"10.19 A",  speed:"1,138 RPM", efficiency:"12.89 g/W" },
      { throttle:"40%",  voltage:"99.22 V",  power:"1,377.17 W",  thrust:"17.02 kg", current:"13.88 A",  speed:"1,278 RPM", efficiency:"12.36 g/W" },
      { throttle:"45%",  voltage:"99.13 V",  power:"1,801.19 W",  thrust:"20.60 kg", current:"18.17 A",  speed:"1,391 RPM", efficiency:"11.44 g/W" },
      { throttle:"50%",  voltage:"99.04 V",  power:"2,243.26 W",  thrust:"24.04 kg", current:"22.65 A",  speed:"1,497 RPM", efficiency:"10.72 g/W" },
      { throttle:"55%",  voltage:"98.89 V",  power:"2,834.19 W",  thrust:"28.10 kg", current:"28.66 A",  speed:"1,622 RPM", efficiency:"9.91 g/W" },
      { throttle:"60%",  voltage:"98.78 V",  power:"3,400.01 W",  thrust:"32.58 kg", current:"34.42 A",  speed:"1,722 RPM", efficiency:"9.58 g/W" },
      { throttle:"65%",  voltage:"98.64 V",  power:"4,182.34 W",  thrust:"38.58 kg", current:"42.40 A",  speed:"1,853 RPM", efficiency:"9.22 g/W" },
      { throttle:"70%",  voltage:"98.49 V",  power:"4,954.05 W",  thrust:"43.24 kg", current:"50.30 A",  speed:"1,954 RPM", efficiency:"8.73 g/W" },
      { throttle:"75%",  voltage:"98.37 V",  power:"5,725.13 W",  thrust:"47.82 kg", current:"58.20 A",  speed:"2,050 RPM", efficiency:"8.35 g/W" },
      { throttle:"80%",  voltage:"98.18 V",  power:"6,528.97 W",  thrust:"52.08 kg", current:"66.50 A",  speed:"2,139 RPM", efficiency:"7.98 g/W" },
      { throttle:"90%",  voltage:"97.89 V",  power:"8,565.38 W",  thrust:"58.82 kg", current:"87.50 A",  speed:"2,350 RPM", efficiency:"6.87 g/W" },
      { throttle:"100%", voltage:"97.52 V",  power:"10,580.92 W", thrust:"67.28 kg", current:"108.50 A", speed:"2,542 RPM", efficiency:"6.36 g/W" },
    ],
  },
  // ─── Maelard 1560 Variant 2: 28S ───
  {
    id: "maelard-1560v2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1560", name: "MAELARD 1560", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_1560.png",
    keySpecs: [ { "label": "KV Rating", "value": "36" }, { "label": "Peak Thrust", "value": "73 kg" }, { "label": "Voltage", "value": "14S – 28S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "36" },
      { "label": "Rated Voltage (LiPo)",  "value": "14S – 28S" },
      { "label": "Peak Current",          "value": "130 A" },
      { "label": "Recommended Thrust",    "value": "30 – 42 kg" },
      { "label": "Peak Thrust",           "value": "73 kg" },
      { "label": "Recommended Propeller", "value": "56 x 20 inch" },
      { "label": "Dimension",             "value": "Φ150x58.5 mm" },
      { "label": "Weight",                "value": "2,320 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"117.30 V", power:"1,115.52 W",  thrust:"15.36 kg", current:"9.51 A",   speed:"1,167 RPM", efficiency:"13.77 g/W" },
      { throttle:"35%",  voltage:"117.20 V", power:"1,593.92 W",  thrust:"19.82 kg", current:"13.60 A",  speed:"1,325 RPM", efficiency:"12.43 g/W" },
      { throttle:"40%",  voltage:"117.10 V", power:"2,091.41 W",  thrust:"23.92 kg", current:"17.86 A",  speed:"1,451 RPM", efficiency:"11.44 g/W" },
      { throttle:"45%",  voltage:"117.00 V", power:"2,710.89 W",  thrust:"28.46 kg", current:"23.17 A",  speed:"1,587 RPM", efficiency:"10.50 g/W" },
      { throttle:"50%",  voltage:"116.90 V", power:"3,335.16 W",  thrust:"32.54 kg", current:"28.53 A",  speed:"1,706 RPM", efficiency:"9.76 g/W" },
      { throttle:"55%",  voltage:"116.70 V", power:"4,285.22 W",  thrust:"38.84 kg", current:"36.72 A",  speed:"1,846 RPM", efficiency:"9.06 g/W" },
      { throttle:"60%",  voltage:"116.60 V", power:"5,142.06 W",  thrust:"43.46 kg", current:"44.10 A",  speed:"1,976 RPM", efficiency:"8.45 g/W" },
      { throttle:"65%",  voltage:"116.40 V", power:"6,157.56 W",  thrust:"48.82 kg", current:"52.90 A",  speed:"2,100 RPM", efficiency:"7.93 g/W" },
      { throttle:"70%",  voltage:"116.20 V", power:"7,111.44 W",  thrust:"54.56 kg", current:"61.20 A",  speed:"2,207 RPM", efficiency:"7.67 g/W" },
      { throttle:"75%",  voltage:"116.20 V", power:"8,203.72 W",  thrust:"58.40 kg", current:"70.60 A",  speed:"2,309 RPM", efficiency:"7.12 g/W" },
      { throttle:"80%",  voltage:"115.70 V", power:"9,830.52 W",  thrust:"65.16 kg", current:"84.60 A",  speed:"2,458 RPM", efficiency:"6.63 g/W" },
      { throttle:"90%",  voltage:"113.30 V", power:"12,576.59 W", thrust:"70.52 kg", current:"108.70 A", speed:"2,712 RPM", efficiency:"5.61 g/W" },
      { throttle:"100%", voltage:"113.30 V", power:"14,298.46 W", thrust:"72.22 kg", current:"126.20 A", speed:"2,901 RPM", efficiency:"5.05 g/W" },
    ],
  },
  // ─── Maelard 1780 ───
  {
    id: "maelard-1780",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1780", name: "MAELARD 1780", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_1780.png",
    keySpecs: [ { "label": "KV Rating", "value": "48" }, { "label": "Peak Thrust", "value": "79 kg" }, { "label": "Voltage", "value": "14S – 28S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "48" },
      { "label": "Rated Voltage (LiPo)",  "value": "14S – 28S" },
      { "label": "Peak Current",          "value": "161 A" },
      { "label": "Recommended Thrust",    "value": "40 – 50 kg" },
      { "label": "Peak Thrust",           "value": "79 kg" },
      { "label": "Recommended Propeller", "value": "56 inch" },
      { "label": "Dimension",             "value": "Φ70x35.80 mm" },
      { "label": "Weight",                "value": "3,509 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.17 V", power:"1,614 W",     thrust:"18.52 kg", current:"16.28 A",  speed:"1,299 RPM", efficiency:"11.47 g/W" },
      { throttle:"35%",  voltage:"99.09 V", power:"2,182 W",     thrust:"22.96 kg", current:"22.02 A",  speed:"1,446 RPM", efficiency:"10.52 g/W" },
      { throttle:"40%",  voltage:"98.90 V", power:"2,925 W",     thrust:"26.20 kg", current:"29.58 A",  speed:"1,601 RPM", efficiency:"8.96 g/W" },
      { throttle:"45%",  voltage:"98.77 V", power:"3,688 W",     thrust:"32.50 kg", current:"37.34 A",  speed:"1,759 RPM", efficiency:"8.81 g/W" },
      { throttle:"50%",  voltage:"98.55 V", power:"4,671 W",     thrust:"39.36 kg", current:"47.40 A",  speed:"1,891 RPM", efficiency:"8.43 g/W" },
      { throttle:"55%",  voltage:"98.36 V", power:"5,823 W",     thrust:"45.64 kg", current:"59.20 A",  speed:"2,055 RPM", efficiency:"7.84 g/W" },
      { throttle:"60%",  voltage:"98.15 V", power:"7,008 W",     thrust:"52.28 kg", current:"71.40 A",  speed:"2,200 RPM", efficiency:"7.46 g/W" },
      { throttle:"65%",  voltage:"97.88 V", power:"8,241 W",     thrust:"56.98 kg", current:"84.20 A",  speed:"2,345 RPM", efficiency:"6.91 g/W" },
      { throttle:"70%",  voltage:"97.64 V", power:"9,383 W",     thrust:"63.02 kg", current:"96.10 A",  speed:"2,486 RPM", efficiency:"6.72 g/W" },
      { throttle:"75%",  voltage:"97.46 V", power:"10,555 W",    thrust:"64.22 kg", current:"108.30 A", speed:"2,647 RPM", efficiency:"6.08 g/W" },
      { throttle:"80%",  voltage:"97.59 V", power:"12,228 W",    thrust:"66.10 kg", current:"125.30 A", speed:"2,750 RPM", efficiency:"5.41 g/W" },
      { throttle:"90%",  voltage:"95.40 V", power:"13,909.32 W", thrust:"72.20 kg", current:"145.80 A", speed:"2,897 RPM", efficiency:"5.19 g/W" },
      { throttle:"100%", voltage:"93.80 V", power:"15,017.38 W", thrust:"78.40 kg", current:"160.10 A", speed:"3,056 RPM", efficiency:"5.22 g/W" },
    ],
  },
  // ─── Maelard 9007 ───
  {
    id: "maelard-9007",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 9007", name: "MAELARD 9007", tag: "MAELARD", application: "Multi-Mission",
    thumbnailUrl: "/assets/products/maelard_9007.png",
    keySpecs: [ { "label": "KV Rating", "value": "200" }, { "label": "Peak Thrust", "value": "35 kg" }, { "label": "Voltage", "value": "12S" } ],
    allSpecs: [
      { "label": "KV Rating",             "value": "200" },
      { "label": "Rated Voltage (LiPo)",  "value": "12S" },
      { "label": "Peak Current",          "value": "220 A" },
      { "label": "Recommended Thrust",    "value": "13 – 16 kg" },
      { "label": "Peak Thrust",           "value": "35 kg" },
      { "label": "Recommended Propeller", "value": "28 x 9.2 inch" },
      { "label": "Dimension",             "value": "Φ90x67 mm" },
      { "label": "Weight",                "value": "1,268 g" },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.09 V", power:"739.31 W",   thrust:"5.68 kg",  current:"15.70 A",  speed:"2,958 RPM", efficiency:"7.68 g/W" },
      { throttle:"35%",  voltage:"46.98 V", power:"982.82 W",   thrust:"7.10 kg",  current:"20.92 A",  speed:"3,271 RPM", efficiency:"7.22 g/W" },
      { throttle:"40%",  voltage:"46.83 V", power:"1,329.04 W", thrust:"8.82 kg",  current:"28.38 A",  speed:"3,642 RPM", efficiency:"6.64 g/W" },
      { throttle:"45%",  voltage:"46.70 V", power:"1,790.01 W", thrust:"11.26 kg", current:"38.33 A",  speed:"4,054 RPM", efficiency:"6.29 g/W" },
      { throttle:"50%",  voltage:"46.50 V", power:"2,269.20 W", thrust:"13.58 kg", current:"48.80 A",  speed:"4,398 RPM", efficiency:"5.98 g/W" },
      { throttle:"55%",  voltage:"46.25 V", power:"2,835.59 W", thrust:"15.86 kg", current:"61.31 A",  speed:"4,712 RPM", efficiency:"5.59 g/W" },
      { throttle:"60%",  voltage:"46.07 V", power:"3,399.97 W", thrust:"18.04 kg", current:"73.80 A",  speed:"5,015 RPM", efficiency:"5.31 g/W" },
      { throttle:"65%",  voltage:"45.78 V", power:"4,010.33 W", thrust:"21.12 kg", current:"87.60 A",  speed:"5,266 RPM", efficiency:"5.27 g/W" },
      { throttle:"70%",  voltage:"45.57 V", power:"4,570.67 W", thrust:"23.04 kg", current:"100.30 A", speed:"5,488 RPM", efficiency:"5.04 g/W" },
      { throttle:"75%",  voltage:"45.21 V", power:"5,348.34 W", thrust:"24.98 kg", current:"118.30 A", speed:"5,758 RPM", efficiency:"4.67 g/W" },
      { throttle:"80%",  voltage:"44.98 V", power:"6,171.26 W", thrust:"27.18 kg", current:"137.20 A", speed:"6,020 RPM", efficiency:"4.40 g/W" },
      { throttle:"90%",  voltage:"44.43 V", power:"7,717.49 W", thrust:"30.68 kg", current:"173.70 A", speed:"6,392 RPM", efficiency:"3.98 g/W" },
      { throttle:"100%", voltage:"43.70 V", power:"9,456.68 W", thrust:"35.24 kg", current:"216.40 A", speed:"6,760 RPM", efficiency:"3.73 g/W" },
    ],
  },
  {
    id: "portfolio-drdo-cvrde",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "High Speed generator", name: "High Speed generator", tag: "PORTFOLIO", application: "Aircraft Main Power",
    keySpecs: [{ label: "Client", value: "DRDO CVRDE" }, { label: "Type", value: "Generator" }],
    allSpecs: [{ label: "Client", value: "DRDO CVRDE" }, { label: "Application", value: "Aircraft main power generator" }]
  },
  {
    id: "portfolio-prestige",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "PMSM motor & drive", name: "PMSM motor & drive", tag: "PORTFOLIO", application: "Kitchen Appliances",
    keySpecs: [{ label: "Power", value: "1.5kW" }, { label: "Speed", value: "14000 RPM" }],
    allSpecs: [{ label: "Client", value: "Prestige" }, { label: "Application", value: "Combined kitchen appliances" }, { label: "Power", value: "1.5kW" }, { label: "Speed", value: "14000 RPM" }]
  },
  {
    id: "portfolio-lucas-tvs",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "Compact BLDC Motor drive", name: "Compact BLDC Motor drive", tag: "PORTFOLIO", application: "Air Conditioner ODU",
    keySpecs: [{ label: "Client", value: "Lucas TVS" }, { label: "Optimized for", value: "Manufacturing" }],
    allSpecs: [{ label: "Client", value: "Lucas TVS" }, { label: "Application", value: "Air conditioner outdoor units" }]
  },
  {
    id: "portfolio-tav-systems",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "PMSM Motor drive", name: "PMSM Motor drive", tag: "PORTFOLIO", application: "e-Cycle",
    keySpecs: [{ label: "Client", value: "TAV Systems" }, { label: "Type", value: "Mid drive" }],
    allSpecs: [{ label: "Client", value: "TAV Systems" }, { label: "Application", value: "Electric all terrain cycles" }]
  },
  {
    id: "portfolio-gremot",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "PMSM Motor drive", name: "PMSM Motor drive", tag: "PORTFOLIO", application: "e-Cycle",
    keySpecs: [{ label: "Voltage", value: "24-36V" }, { label: "Power", value: "250-500W" }],
    allSpecs: [{ label: "Client", value: "GREMOT" }, { label: "Voltage", value: "24-36V" }, { label: "Power", value: "250-500W" }, { label: "Application", value: "e-cycle application" }]
  },
  {
    id: "portfolio-aerostrovilos",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "100kW converter", name: "100kW converter", tag: "PORTFOLIO", application: "Turbomachinery",
    keySpecs: [{ label: "Power", value: "100kW" }, { label: "Client", value: "Aerostrovilos" }],
    allSpecs: [{ label: "Client", value: "Aerostrovilos" }, { label: "Power", value: "100kW" }, { label: "Application", value: "High speed turbomachinery" }]
  },
  {
    id: "motor-1-1kw",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "1.1kW PMSM", name: "1.1kW PMSM", tag: "MOTOR", application: "Mixer & Wet Grinder",
    keySpecs: [{ label: "Power", value: "1.1kW" }, { label: "Speed", value: "15000RPM" }],
    allSpecs: [
      { label: "Spec", value: "1.1kW PMSM" }, 
      { label: "KV Rating", value: "100 KV" },
      { label: "Rated Voltage", value: "220V AC" },
      { label: "Peak Current", value: "10A" },
      { label: "USP", value: "Multi phase motors 15000RPM @0.88Nm / 150RPM @11Nm" }, 
      { label: "Application", value: "Single appliance for mixer and wet grinder" }
    ]
  },
  {
    id: "motor-1-2kw",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "1.2kW PMSM", name: "1.2kW PMSM", tag: "MOTOR", application: "Home/Blower/Industrial",
    keySpecs: [{ label: "Power", value: "1.2kW" }, { label: "USP", value: "Single series" }],
    allSpecs: [{ label: "Spec", value: "1.2kW PMSM" }, { label: "USP", value: "Single series for multiple product category" }, { label: "Application", value: "Home Appliances/Blower/Industrial Fan" }]
  },
  {
    id: "motor-1150w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "1150W PMSM", name: "1150W PMSM", tag: "MOTOR", application: "EC Motors, AHUs",
    keySpecs: [{ label: "Power", value: "1150W" }, { label: "Integrated", value: "IoT / Drive" }],
    allSpecs: [{ label: "Spec", value: "1150W PMSM" }, { label: "USP", value: "Integrated drive electronics, IoT, industry 4.0" }, { label: "Application", value: "EC Motors, for AHUs and Exhaust" }]
  },
  {
    id: "motor-750w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "750W PMSM", name: "750W PMSM", tag: "MOTOR", application: "Home Appliances",
    keySpecs: [{ label: "Power", value: "750W" }, { label: "Speed", value: "18000RPM" }],
    allSpecs: [{ label: "Spec", value: "750W PMSM" }, { label: "USP", value: "18000RPM, 1.1Nm, Precise lower speeds" }, { label: "Application", value: "Home Appliances" }]
  },
  {
    id: "motor-200w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "200W PMSM", name: "200W PMSM", tag: "MOTOR", application: "EC Motors, AHUs",
    keySpecs: [{ label: "Power", value: "200W" }, { label: "Integrated", value: "IoT / Drive" }],
    allSpecs: [{ label: "Spec", value: "200W PMSM" }, { label: "USP", value: "Integrated drive electronics, IoT, industry 4.0" }, { label: "Application", value: "EC Motors, for AHUs and Exhaust" }]
  },
  {
    id: "motor-35w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "35W PMSM/BLDC", name: "35W PMSM/BLDC", tag: "MOTOR", application: "Domestic Ceiling Fan",
    keySpecs: [{ label: "Power", value: "35W" }, { label: "Phase", value: "1φ High voltage" }],
    allSpecs: [{ label: "Spec", value: "35W PMSM/BLDC" }, { label: "USP", value: "1φ High voltage" }, { label: "Application", value: "Domestic ceiling fan" }]
  },
  {
    id: "motor-15kw",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "72V 15kW PMSM", name: "72V 15kW PMSM", tag: "MOTOR", application: "Electric Traction",
    keySpecs: [{ label: "Voltage", value: "72V" }, { label: "Power", value: "15kW" }],
    allSpecs: [{ label: "Spec", value: "72V 15kW PMSM" }, { label: "USP", value: "Single series for multiple power 5-15kW" }, { label: "Application", value: "Electric Traction" }]
  },
  {
    id: "hvdrive-1-1kw",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "1.1kW PMSM Drive", name: "1.1kW PMSM Drive", tag: "HV DRIVE", application: "Mixer/Wet Grinder",
    keySpecs: [{ label: "Spec", value: "1.1kW PMSM" }, { label: "Type", value: "Multi Motor drive" }],
    allSpecs: [{ label: "Spec", value: "1.1kW PMSM" }, { label: "USP", value: "Multi Motor drive 2 x Motors" }, { label: "Application", value: "Single appliance for mixer and wet grinder" }]
  },
  {
    id: "hvdrive-110w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "110W PMSM Drive", name: "110W PMSM Drive", tag: "HV DRIVE", application: "Home Appliances/ODU",
    keySpecs: [{ label: "Spec", value: "110W PMSM" }, { label: "Feature", value: "400V DC / Small" }],
    allSpecs: [{ label: "Spec", value: "110W PMSM" }, { label: "USP", value: "400V DC, Smallest formfactor" }, { label: "Application", value: "Home Appliances/ Aircon ODU" }]
  },
  {
    id: "hvdrive-35w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "35W BLDC/PMSM Drive", name: "35W BLDC/PMSM Drive", tag: "HV DRIVE", application: "Ceiling Fan",
    keySpecs: [{ label: "Spec", value: "35W BLDC" }, { label: "Feature", value: "IR/RF enabled" }],
    allSpecs: [{ label: "Spec", value: "35W BLDC/PMSM" }, { label: "USP", value: "IR/RF enabled Wall regulator" }, { label: "Application", value: "Domestic Ceiling fan" }]
  },
  {
    id: "hvdrive-120w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "120W PMSM Drive", name: "120W PMSM Drive", tag: "HV DRIVE", application: "Industrial Ventilations",
    keySpecs: [{ label: "Spec", value: "120W PMSM" }, { label: "Feature", value: "IoT/Ind 4.0" }],
    allSpecs: [{ label: "Spec", value: "120W PMSM" }, { label: "USP", value: "IoT, Industry 4.0" }, { label: "Application", value: "Industrial ventilations" }]
  },
  {
    id: "hvdrive-5500w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "5500W BLDC Drive", name: "5500W BLDC Drive", tag: "HV DRIVE", application: "Irrigation/Industrial",
    keySpecs: [{ label: "Spec", value: "5500W BLDC" }, { label: "Feature", value: "Grid+Solar MPPT" }],
    allSpecs: [{ label: "Spec", value: "5500W BLDC" }, { label: "USP", value: "Grid + Solar MPPT, IoT, industry 4.0" }, { label: "Application", value: "Irrigation, industrial" }]
  },
  {
    id: "hvdrive-750w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "750W PMSM/BLDC Drive", name: "750W PMSM/BLDC Drive", tag: "HV DRIVE", application: "Domestic Appliances",
    keySpecs: [{ label: "Spec", value: "750W PMSM" }, { label: "Feature", value: "1φ HV" }],
    allSpecs: [{ label: "Spec", value: "750W PMSM/BLDC" }, { label: "USP", value: "1φ High voltage, motor intertated" }, { label: "Application", value: "domestic appliances" }]
  },
  {
    id: "lvdrive-350w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "24-48V 350W Drive", name: "24-48V 350W Drive", tag: "LV DRIVE", application: "LP e-Cycle/Kick scooter",
    keySpecs: [{ label: "Spec", value: "24-48V 350W" }, { label: "Form", value: "Single PCB flat" }],
    allSpecs: [{ label: "Spec", value: "24-48V 350W" }, { label: "USP", value: "Single PCB flat formfactor" }, { label: "Application", value: "LP e-Cycle, Kick scooter" }]
  },
  {
    id: "lvdrive-500w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "48V 500W Drive", name: "48V 500W Drive", tag: "LV DRIVE", application: "AT e-Cycle/3W",
    keySpecs: [{ label: "Spec", value: "48V 500W" }, { label: "Form", value: "Single PCB flat" }],
    allSpecs: [{ label: "Spec", value: "48V 500W" }, { label: "USP", value: "Single PCB flat formfactor" }, { label: "Application", value: "All terrain e-Cycle, 3W with gear" }]
  },
  {
    id: "lvdrive-750w-hp",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "36-48V 750W HP Drive", name: "36-48V 750W HP Drive", tag: "LV DRIVE", application: "High power Mid drive",
    keySpecs: [{ label: "Spec", value: "36-48V 750W" }, { label: "Form", value: "Custom narrow" }],
    allSpecs: [{ label: "Spec", value: "36-48V 750W" }, { label: "USP", value: "Custom design to fit in narrow space" }, { label: "Application", value: "High power Mid drive Motors" }]
  },
  {
    id: "lvdrive-750w-lp",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "36-48V 750W LP Drive", name: "36-48V 750W LP Drive", tag: "LV DRIVE", application: "Low Power Mid drive",
    keySpecs: [{ label: "Spec", value: "36-48V 750W" }, { label: "Form", value: "Custom narrow" }],
    allSpecs: [{ label: "Spec", value: "36-48V 750W" }, { label: "USP", value: "Custom design to fit in narrow space" }, { label: "Application", value: "Low Power Mid Drive Motors" }]
  },
  {
    id: "lvdrive-1500w",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "48-72V 1500W Drive", name: "48-72V 1500W Drive", tag: "LV DRIVE", application: "3W / 1T payload",
    keySpecs: [{ label: "Spec", value: "48-72 1500W" }, { label: "Form", value: "Single PCB flat" }],
    allSpecs: [{ label: "Spec", value: "48-72 1500W" }, { label: "USP", value: "Singe PCB, Flat Formfactor" }, { label: "Application", value: "3W, 800 kg-1T payload" }]
  },
  {
    id: "thruster-uw",
    series: "other", seriesLabel: "Other Systems & Custom Solutions", model: "Underwater Thruster", name: "Underwater Thruster", tag: "THRUSTER", application: "ROV/AUV",
    keySpecs: [{ label: "Rated Voltage", value: "4S (14.8V)" }, { label: "Thrust", value: "5Kgf Fwd" }],
    allSpecs: [
      { label: "Rated Voltage", value: "12-16V (3S-4S)" },
      { label: "KV Rating", value: "300 KV" },
      { label: "Configuration", value: "12N14P" },
      { label: "Winding Resistance", value: "126mΩ" },
      { label: "Winding Inductance", value: "56uH" },
      { label: "Peak Current", value: "20A" },
      { label: "Peak Power", value: "600W" },
      { label: "Thrust", value: "5Kgf Fwd & 4Kgf Rev" },
      { label: "Weight", value: "250g" },
      { label: "Dimension", value: "38 x 50 mm" },
      { label: "Dimension (Prop)", value: "~ 90-100mm" }
    ]
  }
];
