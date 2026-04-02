import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA – straight from the Welkinrim catalogue
═══════════════════════════════════════════════════════════════════════════ */

type Product = {
  id: string;
  series: "haemng" | "maelard" | "esc" | "fc" | "ips";
  seriesLabel: string;
  model: string;
  name: string;
  tag: string;
  application: string;
  img?: string;
  keySpecs: { label: string; value: string }[];
  allSpecs: { label: string; value: string }[];
  perf?: { throttle: string; voltage: string; power: string; thrust: string; current: string }[];
};

const PRODUCTS: Product[] = [
  /* ─── HAEMNG SERIES ──────────────────────────────────────────────────── */
  {
    id: "h-2121",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 2121 II", name: "2121 II", tag: "Compact UAV", application: "UAV / Surveillance",
    keySpecs: [
      { label: "KV Rating",   value: "380 KV"     },
      { label: "Peak Thrust", value: "1,200 g"    },
      { label: "Voltage",     value: "6S LiPo"    },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "380 KV"       },
      { label: "Rated Voltage",          value: "6S LiPo"      },
      { label: "Peak Current",           value: "10 A"         },
      { label: "Recommended Thrust",     value: "350 g"        },
      { label: "Peak Thrust",            value: "1,200 g"      },
      { label: "Recommended Propeller",  value: "13×4.4 inch"  },
      { label: "Dimension",              value: "Ø 46×20 mm"   },
      { label: "Weight",                 value: "86 g"         },
      { label: "ESC Compatibility",      value: "F30, 6S"      },
    ],
    perf: [
      { throttle:"30%",  voltage:"24.94 V", power:"151 W",  thrust:"2,493 g", current:"15.21 A" },
      { throttle:"50%",  voltage:"24.81 V", power:"362 W",  thrust:"3,705 g", current:"14.45 A" },
      { throttle:"70%",  voltage:"24.61 V", power:"631 W",  thrust:"4,903 g", current:"10.18 A" },
      { throttle:"100%", voltage:"24.18 V", power:"1,204 W",thrust:"6,624 g", current:"7.74 A"  },
    ],
  },
  {
    id: "h-4143-v1",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 4143 II V1", name: "4143 II V1", tag: "Heavy Lift", application: "UAV / Cargo",
    keySpecs: [
      { label: "KV Rating",   value: "100 KV"     },
      { label: "Peak Thrust", value: "16 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "100 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "56 A"         },
      { label: "Recommended Thrust",     value: "3.5–5.5 kg"   },
      { label: "Peak Thrust",            value: "16 kg"        },
      { label: "Recommended Propeller",  value: "28×9.2 inch"  },
      { label: "Dimension",              value: "Ø 99×33 mm"   },
      { label: "Weight",                 value: "560 g"        },
      { label: "ESC Compatibility",      value: "E120 12S"     },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.55 V", power:"115 W",   thrust:"1.44 kg", current:"1,554 A" },
      { throttle:"50%",  voltage:"47.34 V", power:"446 W",   thrust:"4.58 kg", current:"2,570 A" },
      { throttle:"70%",  voltage:"47.08 V", power:"1,047 W", thrust:"7.88 kg", current:"3,414 A" },
      { throttle:"100%", voltage:"46.60 V", power:"2,577 W", thrust:"15.16 kg",current:"4,597 A" },
    ],
  },
  {
    id: "h-4143-v2",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 4143 II V2", name: "4143 II V2", tag: "Heavy Lift+", application: "UAV / Cargo",
    keySpecs: [
      { label: "KV Rating",   value: "100 KV"     },
      { label: "Peak Thrust", value: "18 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "100 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "76 A"         },
      { label: "Recommended Thrust",     value: "5–7 kg"       },
      { label: "Peak Thrust",            value: "18 kg"        },
      { label: "Recommended Propeller",  value: "30×10.5 inch" },
      { label: "Dimension",              value: "Ø 99×33 mm"   },
      { label: "Weight",                 value: "560 g"        },
      { label: "ESC Compatibility",      value: "E120 12S"     },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.58 V", power:"155 W",   thrust:"1.92 kg", current:"1,518 A" },
      { throttle:"50%",  voltage:"47.27 V", power:"610 W",   thrust:"6.08 kg", current:"2,492 A" },
      { throttle:"70%",  voltage:"46.92 V", power:"1,395 W", thrust:"10.50 kg",current:"3,213 A" },
      { throttle:"100%", voltage:"46.08 V", power:"3,474 W", thrust:"17.28 kg",current:"4,090 A" },
    ],
  },
  {
    id: "h-8005",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 8005", name: "8005", tag: "Multi-Rotor", application: "UAV / Multi-Rotor",
    keySpecs: [
      { label: "KV Rating",   value: "230 KV"     },
      { label: "Peak Thrust", value: "3,700 g"    },
      { label: "Voltage",     value: "6S LiPo"    },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "230 KV"       },
      { label: "Rated Voltage",          value: "6S LiPo"      },
      { label: "Peak Current",           value: "25 A"         },
      { label: "Recommended Thrust",     value: "1,500 g"      },
      { label: "Peak Thrust",            value: "3,700 g"      },
      { label: "Recommended Propeller",  value: "24×7.2 inch"  },
      { label: "Dimension",              value: "Ø 81×21.5 mm" },
      { label: "Weight",                 value: "245 g"        },
      { label: "ESC Compatibility",      value: "F40, 6S"      },
    ],
    perf: [
      { throttle:"30%",  voltage:"24.67 V", power:"46 W",   thrust:"762 g",  current:"16.52 A" },
      { throttle:"50%",  voltage:"24.31 V", power:"110 W",  thrust:"1,429 g",current:"13.03 A" },
      { throttle:"70%",  voltage:"23.83 V", power:"231 W",  thrust:"2,268 g",current:"9.80 A"  },
      { throttle:"100%", voltage:"22.99 V", power:"543 W",  thrust:"3,693 g",current:"6.81 A"  },
    ],
  },
  {
    id: "h-7010",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 7010", name: "7010", tag: "Industrial", application: "UAV / eVTOL",
    keySpecs: [
      { label: "KV Rating",   value: "150 KV"     },
      { label: "Peak Thrust", value: "13 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "150 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "55 A"         },
      { label: "Recommended Thrust",     value: "4.5–6 kg"     },
      { label: "Peak Thrust",            value: "13 kg"        },
      { label: "Recommended Propeller",  value: "24×8 inch"    },
      { label: "Dimension",              value: "Ø 70×33.5 mm" },
      { label: "Weight",                 value: "468 g"        },
      { label: "ESC Compatibility",      value: "E60, 12S"     },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.3 V", power:"76 W",   thrust:"1.7 kg",  current:"2,258 A" },
      { throttle:"50%",  voltage:"47.2 V", power:"557 W",  thrust:"4.8 kg",  current:"3,410 A" },
      { throttle:"70%",  voltage:"46.9 V", power:"1,159 W",thrust:"7.9 kg",  current:"4,363 A" },
      { throttle:"100%", voltage:"46.3 V", power:"2,491 W",thrust:"12.9 kg", current:"5,544 A" },
    ],
  },
  {
    id: "h-1536",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 1536", name: "1536", tag: "High Voltage", application: "eVTOL / Heavy Lift",
    keySpecs: [
      { label: "KV Rating",   value: "80 KV"      },
      { label: "Peak Thrust", value: "44 kg"      },
      { label: "Voltage",     value: "24S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "80 KV"        },
      { label: "Rated Voltage",          value: "24S LiPo"     },
      { label: "Peak Current",           value: "105 A"        },
      { label: "Recommended Thrust",     value: "14–19 kg"     },
      { label: "Peak Thrust",            value: "44 kg"        },
      { label: "Recommended Propeller",  value: "40×13.1 inch" },
      { label: "Dimension",              value: "Ø 145×60 mm"  },
      { label: "Weight",                 value: "1,854 g"      },
      { label: "ESC Compatibility",      value: "EH200, 24S"   },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.42 V", power:"712 W",   thrust:"7.22 kg",  current:"1,626 A" },
      { throttle:"50%",  voltage:"99.11 V", power:"2,312 W", thrust:"16.28 kg", current:"2,480 A" },
      { throttle:"70%",  voltage:"98.57 V", power:"4,623 W", thrust:"26.18 kg", current:"3,127 A" },
      { throttle:"100%", voltage:"97.87 V", power:"10,227 W",thrust:"43.60 kg", current:"4,020 A" },
    ],
  },
  {
    id: "h-1550",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 1550", name: "1550", tag: "Flagship HV", application: "eVTOL / Cargo",
    keySpecs: [
      { label: "KV Rating",   value: "50 KV"      },
      { label: "Peak Thrust", value: "46.06 kg"   },
      { label: "Voltage",     value: "24–28S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "50 KV"        },
      { label: "Rated Voltage",          value: "24S LiPo"     },
      { label: "Peak Current",           value: "90 A"         },
      { label: "Recommended Thrust",     value: "15–20 kg"     },
      { label: "Peak Thrust",            value: "46.06 kg"     },
      { label: "Recommended Propeller",  value: "48×17.5 inch" },
      { label: "Dimension",              value: "Ø 145×54 mm"  },
      { label: "Weight",                 value: "2,250 g"      },
      { label: "ESC Compatibility",      value: "EH200, 28S"   },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.39 V", power:"521 W",   thrust:"6.92 kg",  current:"1,206 A" },
      { throttle:"50%",  voltage:"99.17 V", power:"1,622 W", thrust:"16.74 kg", current:"1,781 A" },
      { throttle:"70%",  voltage:"98.77 V", power:"3,714 W", thrust:"27.16 kg", current:"2,324 A" },
      { throttle:"100%", voltage:"98.02 V", power:"8,743 W", thrust:"46.06 kg", current:"3,004 A" },
    ],
  },
  {
    id: "h-8808-v1",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 8808 V1", name: "8808 V1", tag: "Versatile", application: "UAV / Multi-Mission",
    keySpecs: [
      { label: "KV Rating",   value: "160 KV"     },
      { label: "Peak Thrust", value: "5 kg"       },
      { label: "Voltage",     value: "6S–12S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "160 KV"       },
      { label: "Rated Voltage",          value: "6S–12S LiPo"  },
      { label: "Peak Current",           value: "25 A"         },
      { label: "Recommended Thrust",     value: "1.5–2 kg"     },
      { label: "Peak Thrust",            value: "5 kg"         },
      { label: "Recommended Propeller",  value: "28×9.2 inch"  },
      { label: "Dimension",              value: "Ø 88×21 mm"   },
      { label: "Weight",                 value: "265 g"        },
      { label: "ESC Compatibility",      value: "E60, 12S"     },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.24 V", power:"36 W",   thrust:"0.68 kg", current:"1,104 A" },
      { throttle:"50%",  voltage:"23.15 V", power:"111 W",  thrust:"1.54 kg", current:"1,632 A" },
      { throttle:"70%",  voltage:"22.92 V", power:"245 W",  thrust:"2.66 kg", current:"2,120 A" },
      { throttle:"100%", voltage:"22.67 V", power:"539 W",  thrust:"4.44 kg", current:"2,719 A" },
    ],
  },
  {
    id: "h-8808-v2",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 8808 V2", name: "8808 V2", tag: "Versatile+", application: "UAV / Multi-Mission",
    keySpecs: [
      { label: "KV Rating",   value: "160 KV"     },
      { label: "Peak Thrust", value: "6 kg"       },
      { label: "Voltage",     value: "6S–12S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "160 KV"       },
      { label: "Rated Voltage",          value: "6S–12S LiPo"  },
      { label: "Peak Current",           value: "30 A"         },
      { label: "Recommended Thrust",     value: "2–3 kg"       },
      { label: "Peak Thrust",            value: "6 kg"         },
      { label: "Recommended Propeller",  value: "30×10.5 inch" },
      { label: "Dimension",              value: "Ø 88×21 mm"   },
      { label: "Weight",                 value: "265 g"        },
      { label: "ESC Compatibility",      value: "E60S"         },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.27 V", power:"49 W",   thrust:"0.88 kg", current:"1,069 A" },
      { throttle:"50%",  voltage:"23.18 V", power:"150 W",  thrust:"2.06 kg", current:"1,553 A" },
      { throttle:"70%",  voltage:"23.03 V", power:"323 W",  thrust:"3.44 kg", current:"1,995 A" },
      { throttle:"100%", voltage:"22.67 V", power:"678 W",  thrust:"5.40 kg", current:"2,473 A" },
    ],
  },
  {
    id: "h-8808-v3",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 8808 V3", name: "8808 V3", tag: "High Voltage", application: "UAV / Industrial",
    keySpecs: [
      { label: "KV Rating",   value: "130 KV"     },
      { label: "Peak Thrust", value: "11 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "130 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "46 A"         },
      { label: "Recommended Thrust",     value: "3.5–5 kg"     },
      { label: "Peak Thrust",            value: "11 kg"        },
      { label: "Recommended Propeller",  value: "28×9.2 inch"  },
      { label: "Dimension",              value: "Ø 88×21 mm"   },
      { label: "Weight",                 value: "275 g"        },
      { label: "ESC Compatibility",      value: "E60 12S"      },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.38 V", power:"136 W",   thrust:"1.98 kg", current:"1,729 A" },
      { throttle:"50%",  voltage:"47.17 V", power:"454 W",   thrust:"4.38 kg", current:"2,564 A" },
      { throttle:"70%",  voltage:"46.98 V", power:"937 W",   thrust:"6.62 kg", current:"3,202 A" },
      { throttle:"100%", voltage:"46.91 V", power:"2,131 W", thrust:"10.60 kg",current:"3,884 A" },
    ],
  },
  {
    id: "h-1015",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "Haemng 1015", name: "1015", tag: "High Torque", application: "UAV / Agriculture",
    keySpecs: [
      { label: "KV Rating",   value: "136 KV"     },
      { label: "Peak Thrust", value: "18 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "136 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "90 A"         },
      { label: "Recommended Thrust",     value: "8–9 kg"       },
      { label: "Peak Thrust",            value: "18 kg"        },
      { label: "Recommended Propeller",  value: "30 inch"      },
      { label: "Dimension",              value: "Ø 99×37.5 mm" },
      { label: "Weight",                 value: "636 g"        },
      { label: "ESC Compatibility",      value: "E120 12S"     },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.27 V", power:"210 W",   thrust:"2.48 kg", current:"1,691 A" },
      { throttle:"50%",  voltage:"47.03 V", power:"775 W",   thrust:"6.70 kg", current:"2,698 A" },
      { throttle:"70%",  voltage:"46.50 V", power:"1,692 W", thrust:"11.20 kg",current:"3,460 A" },
      { throttle:"100%", voltage:"45.86 V", power:"4,086 W", thrust:"17.36 kg",current:"4,335 A" },
    ],
  },

  /* ─── MAELARD SERIES ─────────────────────────────────────────────────── */
  {
    id: "m-1026-v1",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 1026 V1", name: "1026 V1", tag: "Marine / UAV", application: "Marine / UAV",
    keySpecs: [
      { label: "KV Rating",   value: "100 KV"     },
      { label: "Peak Thrust", value: "35 kg"      },
      { label: "Voltage",     value: "14S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "100 KV"       },
      { label: "Rated Voltage",          value: "14S LiPo"     },
      { label: "Peak Current",           value: "179 A"        },
      { label: "Recommended Thrust",     value: "14–18 kg"     },
      { label: "Peak Thrust",            value: "35 kg"        },
      { label: "Recommended Propeller",  value: "32×10.5 inch" },
      { label: "Dimension",              value: "Ø 105×39 mm"  },
      { label: "Weight",                 value: "850 g"        },
      { label: "ESC Compatibility",      value: "F180A 14S"    },
    ],
    perf: [
      { throttle:"30%",  voltage:"57.17 V", power:"818 W",   thrust:"7.24 kg",  current:"2,440 A" },
      { throttle:"50%",  voltage:"56.59 V", power:"2,626 W", thrust:"15.98 kg", current:"3,584 A" },
      { throttle:"70%",  voltage:"55.74 V", power:"5,284 W", thrust:"24.94 kg", current:"4,354 A" },
      { throttle:"100%", voltage:"50.72 V", power:"9,048 W", thrust:"34.13 kg", current:"5,153 A" },
    ],
  },
  {
    id: "m-1026-v2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 1026 V2", name: "1026 V2", tag: "Marine / UAV", application: "Marine / UAV",
    keySpecs: [
      { label: "KV Rating",   value: "100 KV"     },
      { label: "Peak Thrust", value: "31 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "100 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "179 A"        },
      { label: "Recommended Thrust",     value: "13–17 kg"     },
      { label: "Peak Thrust",            value: "31 kg"        },
      { label: "Recommended Propeller",  value: "36×19 inch"   },
      { label: "Dimension",              value: "Ø 105×39 mm"  },
      { label: "Weight",                 value: "850 g"        },
      { label: "ESC Compatibility",      value: "F180A 14S"    },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.23 V", power:"657 W",   thrust:"7.44 kg",  current:"2,048 A" },
      { throttle:"50%",  voltage:"46.76 V", power:"1,978 W", thrust:"15.10 kg", current:"2,966 A" },
      { throttle:"70%",  voltage:"46.03 V", power:"4,055 W", thrust:"23.06 kg", current:"3,619 A" },
      { throttle:"100%", voltage:"42.81 V", power:"7,629 W", thrust:"30.44 kg", current:"3,983 A" },
    ],
  },
  {
    id: "m-1240",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 1240", name: "1240", tag: "Heavy Marine", application: "Marine / eVTOL",
    keySpecs: [
      { label: "KV Rating",   value: "60 KV"      },
      { label: "Peak Thrust", value: "43 kg"      },
      { label: "Voltage",     value: "12–18S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "60 KV"        },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "145 A"        },
      { label: "Recommended Thrust",     value: "14–19 kg"     },
      { label: "Peak Thrust",            value: "43 kg"        },
      { label: "Recommended Propeller",  value: "48×17.5 inch" },
      { label: "Dimension",              value: "Ø 120×43 mm"  },
      { label: "Weight",                 value: "1,280 g"      },
      { label: "ESC Compatibility",      value: "E260, 18S"    },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.23 V", power:"497 W",   thrust:"6.75 kg",  current:"1,142 A" },
      { throttle:"50%",  voltage:"46.82 V", power:"1,492 W", thrust:"16.58 kg", current:"1,660 A" },
      { throttle:"70%",  voltage:"46.20 V", power:"3,072 W", thrust:"27.38 kg", current:"2,107 A" },
      { throttle:"100%", voltage:"45.02 V", power:"6,519 W", thrust:"42.76 kg", current:"2,620 A" },
    ],
  },
  {
    id: "m-4101",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 4101", name: "4101", tag: "Compact", application: "Small UAV / Marine",
    keySpecs: [
      { label: "KV Rating",   value: "700 KV"     },
      { label: "Peak Thrust", value: "2 kg"       },
      { label: "Voltage",     value: "3–4S"       },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "700 KV"       },
      { label: "Rated Voltage",          value: "3–4S LiPo"    },
      { label: "Peak Current",           value: "21 A"         },
      { label: "Recommended Thrust",     value: "0.55–0.75 kg" },
      { label: "Peak Thrust",            value: "2 kg"         },
      { label: "Recommended Propeller",  value: "13×4.4 inch"  },
      { label: "Dimension",              value: "Ø 41×30.8 mm" },
      { label: "Weight",                 value: "99 g"         },
      { label: "ESC Compatibility",      value: "E60 12S"      },
    ],
    perf: [
      { throttle:"30%",  voltage:"14.02 V", power:"22 W",   thrust:"0.32 kg", current:"3,380 A" },
      { throttle:"50%",  voltage:"13.96 V", power:"68 W",   thrust:"0.67 kg", current:"4,966 A" },
      { throttle:"70%",  voltage:"13.79 V", power:"141 W",  thrust:"1.08 kg", current:"6,280 A" },
      { throttle:"100%", voltage:"13.51 V", power:"292 W",  thrust:"1.51 kg", current:"7,764 A" },
    ],
  },
  {
    id: "m-4102-v1",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 4102 V1", name: "4102 V1", tag: "Mid UAV", application: "UAV / FPV",
    keySpecs: [
      { label: "KV Rating",   value: "580 KV"     },
      { label: "Peak Thrust", value: "4 kg"       },
      { label: "Voltage",     value: "6S LiPo"    },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "580 KV"       },
      { label: "Rated Voltage",          value: "6S LiPo"      },
      { label: "Peak Current",           value: "35 A"         },
      { label: "Recommended Thrust",     value: "1.20–1.40 kg" },
      { label: "Peak Thrust",            value: "4 kg"         },
      { label: "Recommended Propeller",  value: "15×5 inch"    },
      { label: "Dimension",              value: "Ø 42×33.8 mm" },
      { label: "Weight",                 value: "145 g"        },
      { label: "ESC Compatibility",      value: "E60 12S"      },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.20 V", power:"55 W",   thrust:"0.58 kg", current:"3,611 A" },
      { throttle:"50%",  voltage:"23.08 V", power:"165 W",  thrust:"1.24 kg", current:"5,153 A" },
      { throttle:"70%",  voltage:"22.91 V", power:"353 W",  thrust:"2.23 kg", current:"6,455 A" },
      { throttle:"100%", voltage:"22.79 V", power:"765 W",  thrust:"3.41 kg", current:"7,980 A" },
    ],
  },
  {
    id: "m-4102-v2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 4102 V2", name: "4102 V2", tag: "Mid UAV+", application: "UAV / FPV",
    keySpecs: [
      { label: "KV Rating",   value: "580 KV"     },
      { label: "Peak Thrust", value: "3 kg"       },
      { label: "Voltage",     value: "6S LiPo"    },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "580 KV"       },
      { label: "Rated Voltage",          value: "6S LiPo"      },
      { label: "Peak Current",           value: "45 A"         },
      { label: "Recommended Thrust",     value: "1.40–1.70 kg" },
      { label: "Peak Thrust",            value: "3 kg"         },
      { label: "Recommended Propeller",  value: "16×5.4 inch"  },
      { label: "Dimension",              value: "Ø 42×33.8 mm" },
      { label: "Weight",                 value: "145 g"        },
      { label: "ESC Compatibility",      value: "E60 12S"      },
    ],
    perf: [
      { throttle:"30%",  voltage:"23.17 V", power:"67 W",   thrust:"0.64 kg", current:"3,352 A" },
      { throttle:"50%",  voltage:"23.01 V", power:"203 W",  thrust:"1.45 kg", current:"4,781 A" },
      { throttle:"70%",  voltage:"22.78 V", power:"428 W",  thrust:"2.01 kg", current:"5,725 A" },
      { throttle:"100%", voltage:"21.08 V", power:"946 W",  thrust:"2.81 kg", current:"6,610 A" },
    ],
  },
  {
    id: "m-1560-v1",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 1560 V1", name: "1560 V1", tag: "Ultra Heavy", application: "eVTOL / Marine",
    keySpecs: [
      { label: "KV Rating",   value: "36 KV"      },
      { label: "Peak Thrust", value: "68 kg"      },
      { label: "Voltage",     value: "14–28S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "36 KV"        },
      { label: "Rated Voltage",          value: "14S–28S LiPo" },
      { label: "Peak Current",           value: "110 A"        },
      { label: "Recommended Thrust",     value: "24–30 kg"     },
      { label: "Peak Thrust",            value: "68 kg"        },
      { label: "Recommended Propeller",  value: "56×20 inch"   },
      { label: "Dimension",              value: "Ø 150×58.5 mm"},
      { label: "Weight",                 value: "2,320 g"      },
      { label: "ESC Compatibility",      value: "EH200 28S"    },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.36 V",  power:"706 W",   thrust:"9.65 kg",  current:"1,001 A" },
      { throttle:"50%",  voltage:"99.04 V",  power:"2,243 W", thrust:"24.04 kg", current:"1,497 A" },
      { throttle:"70%",  voltage:"98.49 V",  power:"4,954 W", thrust:"43.24 kg", current:"1,954 A" },
      { throttle:"100%", voltage:"97.52 V",  power:"10,581 W",thrust:"67.28 kg", current:"2,542 A" },
    ],
  },
  {
    id: "m-1560-v2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 1560 V2", name: "1560 V2", tag: "Ultra Heavy+", application: "eVTOL / Marine",
    keySpecs: [
      { label: "KV Rating",   value: "36 KV"      },
      { label: "Peak Thrust", value: "73 kg"      },
      { label: "Voltage",     value: "14–28S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "36 KV"        },
      { label: "Rated Voltage",          value: "14S–28S LiPo" },
      { label: "Peak Current",           value: "130 A"        },
      { label: "Recommended Thrust",     value: "30–42 kg"     },
      { label: "Peak Thrust",            value: "73 kg"        },
      { label: "Recommended Propeller",  value: "56×20 inch"   },
      { label: "Dimension",              value: "Ø 150×58.5 mm"},
      { label: "Weight",                 value: "2,320 g"      },
      { label: "ESC Compatibility",      value: "EH200 28S"    },
    ],
    perf: [
      { throttle:"30%",  voltage:"117.30 V", power:"1,116 W", thrust:"15.36 kg", current:"1,167 A" },
      { throttle:"50%",  voltage:"116.90 V", power:"3,335 W", thrust:"32.54 kg", current:"1,706 A" },
      { throttle:"70%",  voltage:"116.20 V", power:"7,111 W", thrust:"54.56 kg", current:"2,207 A" },
      { throttle:"100%", voltage:"113.30 V", power:"14,298 W",thrust:"72.22 kg", current:"2,901 A" },
    ],
  },
  {
    id: "m-1780",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 1780", name: "1780", tag: "Max Power", application: "eVTOL / Heavy Marine",
    keySpecs: [
      { label: "KV Rating",   value: "48 KV"      },
      { label: "Peak Thrust", value: "79 kg"      },
      { label: "Voltage",     value: "14–28S"     },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "48 KV"        },
      { label: "Rated Voltage",          value: "14S–28S LiPo" },
      { label: "Peak Current",           value: "161 A"        },
      { label: "Recommended Thrust",     value: "40–50 kg"     },
      { label: "Peak Thrust",            value: "79 kg"        },
      { label: "Recommended Propeller",  value: "56 inch"      },
      { label: "Dimension",              value: "Ø 70×35.8 mm" },
      { label: "Weight",                 value: "3,509 g"      },
      { label: "ESC Compatibility",      value: "EH200 24S"    },
    ],
    perf: [
      { throttle:"30%",  voltage:"99.17 V", power:"1,614 W", thrust:"18.52 kg", current:"1,299 A" },
      { throttle:"50%",  voltage:"98.55 V", power:"4,671 W", thrust:"39.36 kg", current:"1,891 A" },
      { throttle:"70%",  voltage:"97.64 V", power:"9,383 W", thrust:"63.02 kg", current:"2,486 A" },
      { throttle:"100%", voltage:"93.80 V", power:"15,017 W",thrust:"78.40 kg", current:"3,056 A" },
    ],
  },
  {
    id: "m-9007",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "Maelard 9007", name: "9007", tag: "High KV Marine", application: "Marine / UAV",
    keySpecs: [
      { label: "KV Rating",   value: "200 KV"     },
      { label: "Peak Thrust", value: "35 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "200 KV"       },
      { label: "Rated Voltage",          value: "12S LiPo"     },
      { label: "Peak Current",           value: "220 A"        },
      { label: "Recommended Thrust",     value: "13–16 kg"     },
      { label: "Peak Thrust",            value: "35 kg"        },
      { label: "Recommended Propeller",  value: "28×9.2 inch"  },
      { label: "Dimension",              value: "Ø 90×67 mm"   },
      { label: "Weight",                 value: "1,268 g"      },
      { label: "ESC Compatibility",      value: "E260 14S"     },
    ],
    perf: [
      { throttle:"30%",  voltage:"47.09 V", power:"739 W",   thrust:"5.68 kg",  current:"2,958 A" },
      { throttle:"50%",  voltage:"46.50 V", power:"2,269 W", thrust:"13.58 kg", current:"4,398 A" },
      { throttle:"70%",  voltage:"45.57 V", power:"4,571 W", thrust:"23.04 kg", current:"5,488 A" },
      { throttle:"100%", voltage:"43.70 V", power:"9,457 W", thrust:"35.24 kg", current:"6,760 A" },
    ],
  },

  /* ─── ESCs ───────────────────────────────────────────────────────────── */
  {
    id: "e-e40",
    series: "esc", seriesLabel: "ESCs",
    model: "E40 V2 12S", name: "E40 V2", tag: "40A / 12S", application: "UAV / Multi-Rotor",
    keySpecs: [
      { label: "Continuous",  value: "40 A"       },
      { label: "Battery",     value: "12S LiPo"   },
      { label: "Weight",      value: "57 g"       },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "40 A (cooled)"  },
      { label: "Current Limiting",      value: "48 A"           },
      { label: "Recommended Battery",   value: "12S"            },
      { label: "Size",                  value: "60.2×31.0×16.0 mm" },
      { label: "Power Line",            value: "16 AWG"         },
      { label: "Weight",                value: "57 g"           },
      { label: "Protection Grade",      value: "IPX4"           },
      { label: "Working Temp",          value: "-20~65°C"       },
      { label: "BEC",                   value: "No"             },
      { label: "Stall Protection",      value: "Yes"            },
    ],
  },
  {
    id: "e-e60",
    series: "esc", seriesLabel: "ESCs",
    model: "E60 12S", name: "E60", tag: "60A / 12S", application: "UAV / Industrial",
    keySpecs: [
      { label: "Continuous",  value: "60 A"       },
      { label: "Battery",     value: "12S LiPo"   },
      { label: "Weight",      value: "108 g"      },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "60 A (cooled)"  },
      { label: "Current Limiting",      value: "72 A"           },
      { label: "Recommended Battery",   value: "12S"            },
      { label: "Size",                  value: "70.2×31.0×16.0 mm" },
      { label: "Power Line",            value: "14 AWG"         },
      { label: "Weight",                value: "108 g"          },
      { label: "Protection Grade",      value: "IPX4"           },
      { label: "Working Temp",          value: "-20~65°C"       },
      { label: "BEC",                   value: "No"             },
      { label: "Stall Protection",      value: "Yes"            },
    ],
  },
  {
    id: "e-e120",
    series: "esc", seriesLabel: "ESCs",
    model: "E120 12S", name: "E120", tag: "120A / 12S / IP67", application: "UAV / Agriculture",
    keySpecs: [
      { label: "Continuous",  value: "120 A"      },
      { label: "Battery",     value: "12S LiPo"   },
      { label: "Weight",      value: "215 g"      },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "120 A (cooled)" },
      { label: "Current Limiting",      value: "120 A"          },
      { label: "Recommended Battery",   value: "12S"            },
      { label: "Size",                  value: "81.8×41.2×23.2 mm" },
      { label: "Power Line",            value: "12 AWG"         },
      { label: "Weight",                value: "215 g"          },
      { label: "Protection Grade",      value: "IP67"           },
      { label: "Working Temp",          value: "-20~65°C"       },
      { label: "Speed Signal",          value: "Yes"            },
      { label: "Error Output",          value: "Yes"            },
      { label: "BEC",                   value: "No"             },
    ],
  },
  {
    id: "e-eh200",
    series: "esc", seriesLabel: "ESCs",
    model: "EH200 24S", name: "EH200", tag: "200A / 24S", application: "Heavy Lift / Marine",
    keySpecs: [
      { label: "Continuous",  value: "200 A"      },
      { label: "Battery",     value: "24S LiPo"   },
      { label: "BEC",         value: "5V/200mA"   },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "200 A (cooled)" },
      { label: "Current Limiting",      value: "200 A"          },
      { label: "Recommended Battery",   value: "24S"            },
      { label: "Size",                  value: "160.7×72×46 mm" },
      { label: "Power Line",            value: "8 AWG"          },
      { label: "Weight",                value: "725 g"          },
      { label: "Protection Grade",      value: "IPX4"           },
      { label: "BEC",                   value: "5V / 200mA"     },
      { label: "Working Temp",          value: "-20~65°C"       },
      { label: "Speed Signal",          value: "Yes"            },
    ],
  },
  {
    id: "e-e260",
    series: "esc", seriesLabel: "ESCs",
    model: "E260 14S", name: "E260", tag: "260A / 14S", application: "Heavy Lift / Marine",
    keySpecs: [
      { label: "Continuous",  value: "260 A"      },
      { label: "Battery",     value: "14S LiPo"   },
      { label: "BEC",         value: "5V/200mA"   },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "260 A (cooled)" },
      { label: "Current Limiting",      value: "260 A"          },
      { label: "Recommended Battery",   value: "14S"            },
      { label: "Size",                  value: "130.0×65.3×43.0 mm" },
      { label: "Power Line",            value: "8 AWG"          },
      { label: "Weight",                value: "537 g"          },
      { label: "Protection Grade",      value: "IPX4"           },
      { label: "BEC",                   value: "5V / 200mA"     },
      { label: "Working Temp",          value: "-20~65°C"       },
      { label: "Speed Signal",          value: "Yes"            },
    ],
  },
  {
    id: "e-e150",
    series: "esc", seriesLabel: "ESCs",
    model: "E150 14S", name: "E150", tag: "150A / 14S / IP67", application: "UAV / Industrial",
    keySpecs: [
      { label: "Continuous",  value: "150 A"      },
      { label: "Battery",     value: "14S LiPo"   },
      { label: "Weight",      value: "357 g"      },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "150 A (cooled)" },
      { label: "Current Limiting",      value: "150 A"          },
      { label: "Recommended Battery",   value: "14S"            },
      { label: "Size",                  value: "98.0×50.0×33.9 mm" },
      { label: "Power Line",            value: "10 AWG"         },
      { label: "Weight",                value: "357 g"          },
      { label: "Protection Grade",      value: "IP67"           },
      { label: "BEC",                   value: "No"             },
      { label: "Speed Signal",          value: "Yes"            },
    ],
  },
  {
    id: "e-e200",
    series: "esc", seriesLabel: "ESCs",
    model: "E200 14S", name: "E200", tag: "200A / 14S / IP67", application: "UAV / Marine",
    keySpecs: [
      { label: "Continuous",  value: "200 A"      },
      { label: "Battery",     value: "14S LiPo"   },
      { label: "Weight",      value: "320 g"      },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "200 A (cooled)" },
      { label: "Current Limiting",      value: "200 A"          },
      { label: "Recommended Battery",   value: "14S"            },
      { label: "Size",                  value: "117.5×56.3×42.8 mm" },
      { label: "Power Line",            value: "8 AWG"          },
      { label: "Weight",                value: "320 g"          },
      { label: "Protection Grade",      value: "IP67"           },
      { label: "BEC",                   value: "No"             },
      { label: "Speed Signal",          value: "Yes"            },
    ],
  },
  {
    id: "e-f120a",
    series: "esc", seriesLabel: "ESCs",
    model: "F120A 12S", name: "F120A", tag: "150A / 12–14S / IP67", application: "Marine / UAV",
    keySpecs: [
      { label: "Continuous",  value: "150 A"      },
      { label: "Battery",     value: "12–14S"     },
      { label: "Weight",      value: "248 g"      },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "150 A (cooled)" },
      { label: "Current Limiting",      value: "150 A"          },
      { label: "Recommended Battery",   value: "12S–14S"        },
      { label: "Size",                  value: "123.5×58.6×30.25 mm" },
      { label: "Power Line",            value: "10 AWG"         },
      { label: "Weight",                value: "248 g"          },
      { label: "Protection Grade",      value: "IP67"           },
      { label: "BEC",                   value: "No"             },
      { label: "Speed Signal",          value: "No"             },
    ],
  },
  {
    id: "e-f30",
    series: "esc", seriesLabel: "ESCs",
    model: "F30 6S", name: "F30", tag: "30A / 6S", application: "Compact UAV",
    keySpecs: [
      { label: "Continuous",  value: "30 A"       },
      { label: "Battery",     value: "6S LiPo"    },
      { label: "Weight",      value: "65 g"       },
    ],
    allSpecs: [
      { label: "Continuous Current",    value: "30 A (cooled)"  },
      { label: "Current Limiting",      value: "35 A"           },
      { label: "Recommended Battery",   value: "6S"             },
      { label: "Size",                  value: "95×30×19.5 mm"  },
      { label: "Power Line",            value: "16 AWG"         },
      { label: "Weight",                value: "65 g"           },
      { label: "Protection Grade",      value: "IPX4"           },
      { label: "BEC",                   value: "No"             },
      { label: "Working Temp",          value: "-20~65°C"       },
    ],
  },

  /* ─── FLIGHT CONTROLLER ──────────────────────────────────────────────── */
  {
    id: "fc-ap",
    series: "fc", seriesLabel: "Flight Controller",
    model: "Auto Pilot FC", name: "Auto Pilot FC", tag: "Triple IMU", application: "Autonomous UAV",
    keySpecs: [
      { label: "IMU",         value: "Triple IMU" },
      { label: "Barometer",   value: "Dual"       },
      { label: "Weight",      value: "155 g"      },
    ],
    allSpecs: [
      { label: "Operating Voltage",     value: "4.5–5.5 V"     },
      { label: "Operating Temp",        value: "-20~70°C"      },
      { label: "Size",                  value: "95.1×62×23 mm" },
      { label: "Weight",                value: "155 g"         },
      { label: "PWM Output",            value: "8 PWM + 6 AUX" },
      { label: "RC Input",              value: "PPM / SBUS"    },
      { label: "USB",                   value: "Type C"        },
      { label: "Power Monitor",         value: "2 (Analog/CAN)"},
      { label: "Sensor",                value: "Triple IMU, Dual Barometer" },
      { label: "Compass",               value: "Yes"           },
      { label: "Vibration Isolation",   value: "Yes"           },
      { label: "UART Ports",            value: "5"             },
      { label: "I2C",                   value: "3"             },
      { label: "CAN",                   value: "2"             },
      { label: "Software",              value: "Mission Planner / QGC" },
      { label: "Power Input",           value: "8-pin ClickMate Molex" },
    ],
  },

  /* ─── INTEGRATED POWER SYSTEMS ───────────────────────────────────────── */
  {
    id: "ips-1",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "Haemng 7010 + F60 12S", name: "IPS-H7010", tag: "12S Integrated", application: "UAV / eVTOL",
    keySpecs: [
      { label: "KV Rating",   value: "150 KV"     },
      { label: "Peak Thrust", value: "13 kg"      },
      { label: "Voltage",     value: "12S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "150 KV"         },
      { label: "Rated Voltage",          value: "12S LiPo"       },
      { label: "Peak Current",           value: "55 A"           },
      { label: "Recommended Thrust",     value: "4.5–6 kg"       },
      { label: "Peak Thrust",            value: "13 kg"          },
      { label: "Recommended Propeller",  value: "24×8 inch"      },
      { label: "Dimension",              value: "Ø 122×70×65.3 mm" },
      { label: "Weight (with wires)",    value: "660 g"          },
    ],
  },
  {
    id: "ips-2",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "Maelard 1026 + E150 12S", name: "IPS-M1026A", tag: "14S Integrated", application: "Marine / UAV",
    keySpecs: [
      { label: "KV Rating",   value: "100 KV"     },
      { label: "Peak Thrust", value: "24 kg"      },
      { label: "Voltage",     value: "14S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "100 KV"         },
      { label: "Rated Voltage",          value: "14S LiPo"       },
      { label: "Peak Current",           value: "150 A"          },
      { label: "Recommended Thrust",     value: "12 kg"          },
      { label: "Peak Thrust",            value: "24 kg"          },
      { label: "Recommended Propeller",  value: "36×19 inch"     },
      { label: "Dimension",              value: "Ø 110×105×86.1 mm" },
      { label: "Weight (with wires)",    value: "1,482 g"        },
    ],
  },
  {
    id: "ips-3",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "Maelard 1026 + F120 14S", name: "IPS-M1026B", tag: "14S Heavy", application: "Marine / UAV",
    keySpecs: [
      { label: "KV Rating",   value: "100 KV"     },
      { label: "Peak Thrust", value: "18 kg"      },
      { label: "Voltage",     value: "14S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "100 KV"         },
      { label: "Rated Voltage",          value: "14S LiPo"       },
      { label: "Peak Current",           value: "70 A"           },
      { label: "Recommended Thrust",     value: "6 kg"           },
      { label: "Peak Thrust",            value: "18 kg"          },
      { label: "Recommended Propeller",  value: "36×19 inch"     },
      { label: "Dimension",              value: "Ø 140×105×119.6 mm" },
      { label: "Weight",                 value: "1,318 g"        },
    ],
  },
  {
    id: "ips-4",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "Maelard 1240 + E260 14S", name: "IPS-M1240", tag: "50 kg Lift", application: "eVTOL / Marine",
    keySpecs: [
      { label: "KV Rating",   value: "60 KV"      },
      { label: "Peak Thrust", value: "50 kg"      },
      { label: "Voltage",     value: "14S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "60 KV"          },
      { label: "Rated Voltage",          value: "14S LiPo"       },
      { label: "Peak Current",           value: "150 A"          },
      { label: "Recommended Thrust",     value: "26 kg"          },
      { label: "Peak Thrust",            value: "50 kg"          },
      { label: "Recommended Propeller",  value: "48×17.5 inch"   },
      { label: "Dimension",              value: "Ø 225×120×158 mm" },
      { label: "Weight",                 value: "4,165 g"        },
    ],
  },
  {
    id: "ips-5",
    series: "ips", seriesLabel: "Integrated Power Systems",
    model: "Maelard 1536 + EH200 24S", name: "IPS-M1536", tag: "55 kg Lift", application: "eVTOL / Heavy Marine",
    keySpecs: [
      { label: "KV Rating",   value: "80 KV"      },
      { label: "Peak Thrust", value: "55 kg"      },
      { label: "Voltage",     value: "24S LiPo"   },
    ],
    allSpecs: [
      { label: "KV Rating",              value: "80 KV"          },
      { label: "Rated Voltage",          value: "24S LiPo"       },
      { label: "Peak Current",           value: "190 A"          },
      { label: "Recommended Thrust",     value: "24 kg"          },
      { label: "Peak Thrust",            value: "55 kg"          },
      { label: "Recommended Propeller",  value: "40×13.1 inch"   },
      { label: "Dimension",              value: "Ø 225×155×210 mm" },
      { label: "Weight",                 value: "5,670 g"        },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SERIES CONFIG
═══════════════════════════════════════════════════════════════════════════ */
const SERIES_CFG = {
  haemng:  { label: "Haemng Series",             accent: "#ffc914", bg: "#fffbe6", dim: "100" },
  maelard: { label: "Maelard Series",             accent: "#1a73e8", bg: "#e8f0fe", dim: "100" },
  esc:     { label: "Electronic Speed Controllers", accent: "#222",   bg: "#f4f4f4", dim: "100" },
  fc:      { label: "Flight Controller",          accent: "#0f9d58", bg: "#e6f4ea", dim: "100" },
  ips:     { label: "Integrated Power Systems",   accent: "#e0440e", bg: "#fce8e6", dim: "100" },
} as const;

/* Motor SVG icon used in cards */
function MotorIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-80">
      <circle cx="40" cy="40" r="30" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="40" cy="40" r="18" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="40" r="6"  fill={color} />
      {[0,60,120,180,240,300].map(a => {
        const r = Math.PI * a / 180;
        const x1 = 40 + 18 * Math.cos(r), y1 = 40 + 18 * Math.sin(r);
        const x2 = 40 + 28 * Math.cos(r), y2 = 40 + 28 * Math.sin(r);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function EscIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-80">
      <rect x="10" y="20" width="60" height="40" rx="4" fill="none" stroke={color} strokeWidth="2.5" />
      <rect x="18" y="30" width="12" height="8"  rx="1" fill={color} opacity=".4" />
      <rect x="34" y="30" width="12" height="8"  rx="1" fill={color} opacity=".4" />
      <rect x="50" y="30" width="12" height="8"  rx="1" fill={color} opacity=".4" />
      <line x1="10" y1="52" x2="70" y2="52" stroke={color} strokeWidth="1.5" opacity=".4" />
      {[15,25,35,45,55,65].map(x => (
        <line key={x} x1={x} y1="52" x2={x} y2="60" stroke={color} strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function FcIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-80">
      <rect x="8" y="8" width="64" height="64" rx="6" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="40" cy="40" r="12" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="40" r="4"  fill={color} />
      {[8,16,24].map((r,i) => (
        <circle key={i} cx="40" cy="40" r={r+24} fill="none" stroke={color} strokeWidth=".8" opacity=".25" />
      ))}
    </svg>
  );
}

const TABS = [
  { id: "all",     label: "All Products",               count: PRODUCTS.length },
  { id: "haemng",  label: "Haemng Series",               count: PRODUCTS.filter(p=>p.series==="haemng").length },
  { id: "maelard", label: "Maelard Series",              count: PRODUCTS.filter(p=>p.series==="maelard").length },
  { id: "esc",     label: "ESCs",                        count: PRODUCTS.filter(p=>p.series==="esc").length },
  { id: "fc",      label: "Flight Controller",           count: 1 },
  { id: "ips",     label: "Integrated Systems",          count: PRODUCTS.filter(p=>p.series==="ips").length },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════════════════════ */
function ProductCard({ p, expanded, onToggle }: {
  p: Product;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = SERIES_CFG[p.series];

  return (
    <div className={`flex flex-col border transition-all duration-300 ${
      expanded ? "border-gray-300 shadow-xl" : "border-gray-100 hover:border-gray-300 hover:shadow-md"
    }`}>

      {/* ── Visual header ── */}
      <div className="relative flex flex-col items-center justify-center h-44 overflow-hidden"
           style={{ background: `linear-gradient(135deg, #111 0%, #1a1a1a 100%)` }}>

        {/* faint grid overlay */}
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `linear-gradient(${cfg.accent}33 1px, transparent 1px),
                                 linear-gradient(90deg, ${cfg.accent}33 1px, transparent 1px)`,
               backgroundSize: "20px 20px",
             }} />

        {/* motor/esc/fc icon */}
        <div className="relative z-10 mb-2">
          {p.series === "esc" ? <EscIcon color={cfg.accent} />
            : p.series === "fc" ? <FcIcon color={cfg.accent} />
            : <MotorIcon color={cfg.accent} />}
        </div>

        {/* dim badge */}
        {p.allSpecs.find(s => s.label === "Dimension") && (
          <p className="relative z-10 text-[9px] tracking-widest text-white/40 uppercase"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            {p.allSpecs.find(s => s.label === "Dimension")?.value}
          </p>
        )}

        {/* Series badge top-right */}
        <div className="absolute top-3 right-3 px-2 py-0.5"
             style={{ background: cfg.accent, transform: "skewX(-10deg)" }}>
          <span className="text-[8px] font-black tracking-widest uppercase"
                style={{ fontFamily: "Michroma, sans-serif",
                         color: p.series === "haemng" ? "#000" : "#fff",
                         display: "inline-block", transform: "skewX(10deg)" }}>
            {p.series === "ips" ? "IPS" : p.series === "fc" ? "FC" : p.series.toUpperCase()}
          </span>
        </div>

        {/* tag bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[8px] tracking-widest uppercase text-white/60 border border-white/20 px-2 py-0.5"
                style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)", display: "inline-block" }}>
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>{p.tag}</span>
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5">
        <p className="text-[9px] tracking-[0.25em] uppercase mb-0.5"
           style={{ fontFamily: "Michroma, sans-serif", color: cfg.accent }}>
          {p.model}
        </p>
        <h3 className="text-sm font-bold text-black mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
          {p.seriesLabel}
        </h3>
        <p className="text-[10px] text-[#808080] mb-4 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>{p.application}</p>

        {/* Key 3 specs as badges */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 mb-4">
          {p.keySpecs.map(s => (
            <div key={s.label} className="bg-white px-2 py-2 text-center">
              <p className="text-[10px] font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                {s.value}
              </p>
              <p className="text-[8px] text-[#808080] mt-0.5 leading-tight" style={{ fontFamily: "Lexend, sans-serif" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Expanded: full spec table */}
        {expanded && (
          <div className="mb-4">
            <p className="text-[8px] tracking-[0.3em] uppercase text-[#808080] mb-2"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Full Specifications
            </p>
            <div className="border border-gray-100 divide-y divide-gray-50">
              {p.allSpecs.map(s => (
                <div key={s.label} className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[9px] text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>{s.label}</span>
                  <span className="text-[9px] font-bold text-black" style={{ fontFamily: "Lexend, sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Performance table (motors only) */}
            {p.perf && p.perf.length > 0 && (
              <div className="mt-3">
                <p className="text-[8px] tracking-[0.3em] uppercase text-[#808080] mb-2"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  Bench Test Data *
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[8px]">
                    <thead>
                      <tr className="bg-gray-50">
                        {["Throttle","Voltage","Power","Thrust","Current"].map(h => (
                          <th key={h} className="px-2 py-1.5 text-left text-[#808080] font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {p.perf.map(r => (
                        <tr key={r.throttle} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-bold text-black">{r.throttle}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.voltage}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.power}</td>
                          <td className="px-2 py-1.5 font-bold" style={{ color: cfg.accent }}>{r.thrust}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[7px] text-[#aaa] mt-1.5 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
                    * Bench test at ambient room temperature, MSL. Actual results may vary by field conditions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onToggle}
            className="flex-1 py-2 border border-gray-200 text-[9px] tracking-widest uppercase text-[#808080] hover:border-black hover:text-black transition-all duration-200"
            style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>{expanded ? "Collapse" : "Full Specs"}</span>
          </button>
          <button
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="flex-1 py-2 text-[9px] tracking-widest uppercase font-black transition-all duration-200"
            style={{ fontFamily: "Michroma, sans-serif",
                     background: cfg.accent,
                     color: p.series === "haemng" ? "#000" : "#fff",
                     transform: "skewX(-10deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Enquire</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function ProductsSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const visible = activeTab === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.series === activeTab);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <section id="products" className="py-24 bg-white scroll-mt-[72px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Header ── */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#ffc914]" />
              <span className="text-[#808080] text-[10px] tracking-[0.3em] uppercase"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                Product Catalogue
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight"
                style={{ fontFamily: "Michroma, sans-serif" }}>
              Engineered for<br /><span className="text-[#ffc914]">Every Frontier</span>
            </h2>
          </div>
          <p className="text-[#808080] text-sm max-w-xs leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
            IIT Madras incubated · Five purpose-built product lines · 36+ variants ·
            Designed and tested in Chennai, India.
          </p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-100 pb-5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpanded(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-black text-[#ffc914]"
                  : "bg-gray-100 text-[#808080] hover:bg-gray-200 hover:text-black"
              }`}
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span className="inline-flex items-center gap-2" style={{ transform: "skewX(10deg)" }}>
                {tab.label}
                <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-medium ${
                  activeTab === tab.id ? "bg-[#ffc914] text-black" : "bg-white text-[#808080]"
                }`}>
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-1 text-[10px] text-[#aaa]"
               style={{ fontFamily: "Michroma, sans-serif" }}>
            {visible.length} / {PRODUCTS.length} shown
          </div>
        </div>

        {/* ── Series group labels when "All" ── */}
        {activeTab === "all" ? (
          Object.entries(SERIES_CFG).map(([key, cfg]) => {
            const group = PRODUCTS.filter(p => p.series === key);
            if (!group.length) return null;
            return (
              <div key={key} className="mb-14">
                {/* series heading */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-1 h-8 flex-shrink-0" style={{ background: cfg.accent }} />
                  <div>
                    <h3 className="text-lg font-bold text-black leading-none"
                        style={{ fontFamily: "Michroma, sans-serif" }}>
                      {cfg.label}
                    </h3>
                    <p className="text-[10px] text-[#808080] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>
                      {group.length} model{group.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {group.map(p => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      expanded={expanded === p.id}
                      onToggle={() => toggle(p.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map(p => (
              <ProductCard
                key={p.id}
                p={p}
                expanded={expanded === p.id}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-16 bg-black p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] text-[#ffc914] tracking-[0.3em] uppercase mb-1"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              IIT Madras Incubated
            </p>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
              Need a custom propulsion solution?
            </h3>
            <p className="text-sm text-white/50 mt-1" style={{ fontFamily: "Lexend, sans-serif" }}>
              Custom KV ratings · Form factors · Voltage ranges · IP ratings · OEM available
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 bg-[#ffc914] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-all duration-300 whitespace-nowrap"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get in Touch</span>
            </button>
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 border border-white/20 text-white text-[10px] tracking-widest uppercase hover:border-[#ffc914] hover:text-[#ffc914] transition-all duration-300 whitespace-nowrap"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Download Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
