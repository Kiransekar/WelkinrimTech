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
  series: "haemng" | "maelard" | "esc" | "fc" | "ips";
  seriesLabel: string;
  model: string;
  name: string;
  tag: string;
  application: string;
  keySpecs: { label: string; value: string }[];
  allSpecs: { label: string; value: string }[];
  perf?: PerfRow[];
};

export const SERIES_CFG = {
  haemng:  { label: "Haemng Series", useSvgLogo: true, logoSrc: "haemng.svg", accent: "#ffc812", textOnAccent: "#000" },
  maelard: { label: "Maelard Series", useSvgLogo: true, logoSrc: "Maelard.svg", accent: "#ffc812", textOnAccent: "#000" },
  esc:     { label: "Electronic Speed Controllers", accent: "#ffc812", textOnAccent: "#000" },
  fc:      { label: "Flight Controller",            accent: "#ffc812", textOnAccent: "#000" },
  ips:     { label: "Integrated Power Systems",     accent: "#ffc812", textOnAccent: "#000" },
} as const;

export const PRODUCTS: Product[] = [
  {
    id: "haemng-xamqa8ak3",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 2121 II — Configuration 1", name: "HAEMNG 2121 II", tag: "HAEMNG", application: "UAV / eVTOL",
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
            "value": "46 x 20 mm"
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
      { throttle:"90%", voltage:"24.36 V", power:"129.60 W", thrust:"1,003 kg", current:"5.32 A", speed:"6,064 RPM", efficiency:"7.74 g/W" },
      { throttle:"100%", voltage:"24.18 V", power:"203.60 W", thrust:"1,204 kg", current:"8.42 A", speed:"6,624 RPM", efficiency:"5.91 g/W" },
    ],
  },
  {
    id: "haemng-axn8bed5g",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 2121 II — Configuration 2", name: "HAEMNG 2121 II", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "380"  }, { "label": "Peak Thrust", "value": "550 g"  }, { "label": "Voltage", "value": "6S"  }
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
            "value": "16 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "550 g"
      },
      {
            "label": "Peak Thrust",
            "value": "1,650 g"
      },
      {
            "label": "Recommended Propeller",
            "value": "15 x 5 inch"
      },
      {
            "label": "Dimension",
            "value": "46 x 20 mm"
      },
      {
            "label": "Weight",
            "value": "86 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"24.87 V", power:"18.95 W", thrust:"231 g", current:"0.76 A", speed:"2,267 RPM", efficiency:"12.19 g/W" },
      { throttle:"35%", voltage:"24.85 V", power:"24.95 W", thrust:"299 g", current:"1.00 A", speed:"2,544 RPM", efficiency:"11.98 g/W" },
      { throttle:"40%", voltage:"24.82 V", power:"31.52 W", thrust:"369 g", current:"1.27 A", speed:"2,789 RPM", efficiency:"11.71 g/W" },
      { throttle:"45%", voltage:"24.77 V", power:"40.62 W", thrust:"450 g", current:"1.64 A", speed:"3,064 RPM", efficiency:"11.08 g/W" },
      { throttle:"50%", voltage:"24.73 V", power:"50.05 W", thrust:"523 g", current:"2.02 A", speed:"3,298 RPM", efficiency:"10.45 g/W" },
      { throttle:"55%", voltage:"24.67 V", power:"62.17 W", thrust:"631 g", current:"2.52 A", speed:"3,567 RPM", efficiency:"10.15 g/W" },
      { throttle:"60%", voltage:"24.60 V", power:"78.23 W", thrust:"751 g", current:"3.18 A", speed:"3,860 RPM", efficiency:"9.60 g/W" },
      { throttle:"65%", voltage:"24.53 V", power:"94.93 W", thrust:"823 g", current:"3.87 A", speed:"4,111 RPM", efficiency:"8.67 g/W" },
      { throttle:"70%", voltage:"24.45 V", power:"115.89 W", thrust:"951 g", current:"4.74 A", speed:"4,351 RPM", efficiency:"8.21 g/W" },
      { throttle:"75%", voltage:"24.34 V", power:"143.61 W", thrust:"1,085 kg", current:"5.90 A", speed:"4,627 RPM", efficiency:"7.56 g/W" },
      { throttle:"80%", voltage:"24.24 V", power:"169.92 W", thrust:"1,204 kg", current:"7.01 A", speed:"4,937 RPM", efficiency:"7.09 g/W" },
      { throttle:"90%", voltage:"23.97 V", power:"231.79 W", thrust:"1,484 kg", current:"9.67 A", speed:"5,424 RPM", efficiency:"6.40 g/W" },
      { throttle:"100%", voltage:"23.73 V", power:"377.54 W", thrust:"1,650 kg", current:"15.91 A", speed:"5,734 RPM", efficiency:"4.37 g/W" },
    ],
  },
  {
    id: "haemng-p7ofe6dco",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 4143 II — Configuration 1", name: "HAEMNG 4143 II", tag: "HAEMNG", application: "UAV / eVTOL",
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
            "value": "99 x 33 mm"
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
    model: "HAEMNG 4143 II — Configuration 2", name: "HAEMNG 4143 II", tag: "HAEMNG", application: "UAV / eVTOL",
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
            "value": "99 x 33 mm"
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
            "value": "81 x 21.5 mm"
      },
      {
            "label": "Weight",
            "value": "245 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"24.67 V", power:"46.13 W", thrust:"762 g", current:"1.87 A", speed:"1,503 RPM", efficiency:"16.52 g/W" },
      { throttle:"35%", voltage:"24.57 V", power:"62.16 W", thrust:"938 g", current:"2.53 A", speed:"1,643 RPM", efficiency:"15.09 g/W" },
      { throttle:"40%", voltage:"24.52 V", power:"78.71 W", thrust:"1,042 kg", current:"3.21 A", speed:"1,778 RPM", efficiency:"13.24 g/W" },
      { throttle:"45%", voltage:"24.44 V", power:"95.56 W", thrust:"1,223 kg", current:"3.91 A", speed:"1,915 RPM", efficiency:"12.80 g/W" },
      { throttle:"50%", voltage:"24.31 V", power:"109.64 W", thrust:"1,429 kg", current:"4.51 A", speed:"2,062 RPM", efficiency:"13.03 g/W" },
      { throttle:"55%", voltage:"24.21 V", power:"138.00 W", thrust:"1,618 kg", current:"5.70 A", speed:"2,186 RPM", efficiency:"11.72 g/W" },
      { throttle:"60%", voltage:"24.10 V", power:"166.05 W", thrust:"1,800 kg", current:"6.89 A", speed:"2,313 RPM", efficiency:"10.84 g/W" },
      { throttle:"65%", voltage:"23.98 V", power:"189.20 W", thrust:"1,962 kg", current:"7.89 A", speed:"2,452 RPM", efficiency:"10.37 g/W" },
      { throttle:"70%", voltage:"23.83 V", power:"231.39 W", thrust:"2,268 kg", current:"9.71 A", speed:"2,603 RPM", efficiency:"9.80 g/W" },
      { throttle:"75%", voltage:"23.73 V", power:"270.52 W", thrust:"2,473 kg", current:"11.40 A", speed:"2,723 RPM", efficiency:"9.14 g/W" },
      { throttle:"80%", voltage:"23.60 V", power:"318.60 W", thrust:"2,753 kg", current:"13.50 A", speed:"2,859 RPM", efficiency:"8.64 g/W" },
      { throttle:"90%", voltage:"23.28 V", power:"430.68 W", thrust:"3,345 kg", current:"18.50 A", speed:"3,146 RPM", efficiency:"7.77 g/W" },
      { throttle:"100%", voltage:"22.99 V", power:"542.56 W", thrust:"3,693 kg", current:"23.60 A", speed:"3,321 RPM", efficiency:"6.81 g/W" },
    ],
  },
  {
    id: "haemng-79588b9hf",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 7010", name: "HAEMNG 7010", tag: "HAEMNG", application: "UAV / eVTOL",
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
            "value": "70 x 39.3 mm"
      },
      {
            "label": "Weight",
            "value": "468 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"49.25 V", power:"465.91 W", thrust:"3.22 kg", current:"9.46 A", speed:"3,386 RPM", efficiency:"6.91 g/W" },
      { throttle:"35%", voltage:"48.96 V", power:"637.95 W", thrust:"4.14 kg", current:"13.03 A", speed:"3,828 RPM", efficiency:"6.49 g/W" },
      { throttle:"40%", voltage:"48.61 V", power:"799.15 W", thrust:"4.90 kg", current:"16.44 A", speed:"4,155 RPM", efficiency:"6.13 g/W" },
      { throttle:"45%", voltage:"48.25 V", power:"983.82 W", thrust:"5.62 kg", current:"20.39 A", speed:"4,448 RPM", efficiency:"5.71 g/W" },
      { throttle:"50%", voltage:"47.90 V", power:"1,184.57 W", thrust:"6.44 kg", current:"24.73 A", speed:"4,745 RPM", efficiency:"5.44 g/W" },
      { throttle:"55%", voltage:"47.46 V", power:"1,409.09 W", thrust:"7.20 kg", current:"29.69 A", speed:"4,997 RPM", efficiency:"5.11 g/W" },
      { throttle:"60%", voltage:"47.60 V", power:"1,775.96 W", thrust:"8.52 kg", current:"37.31 A", speed:"5,311 RPM", efficiency:"4.80 g/W" },
      { throttle:"65%", voltage:"46.71 V", power:"1,987.04 W", thrust:"9.56 kg", current:"42.54 A", speed:"5,596 RPM", efficiency:"4.81 g/W" },
      { throttle:"70%", voltage:"46.45 V", power:"2,286.73 W", thrust:"10.48 kg", current:"49.23 A", speed:"5,855 RPM", efficiency:"4.58 g/W" },
      { throttle:"75%", voltage:"45.99 V", power:"2,571.30 W", thrust:"11.00 kg", current:"55.91 A", speed:"6,057 RPM", efficiency:"4.28 g/W" },
      { throttle:"80%", voltage:"45.47 V", power:"3,001.02 W", thrust:"11.68 kg", current:"66.00 A", speed:"6,264 RPM", efficiency:"3.89 g/W" },
      { throttle:"90%", voltage:"44.78 V", power:"3,706.44 W", thrust:"13.26 kg", current:"82.77 A", speed:"6,613 RPM", efficiency:"3.58 g/W" },
      { throttle:"100%", voltage:"44.08 V", power:"4,487.34 W", thrust:"14.66 kg", current:"101.80 A", speed:"6,918 RPM", efficiency:"3.27 g/W" },
    ],
  },
  {
    id: "haemng-ixtod385i",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 1536", name: "HAEMNG 1536", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "80"  }, { "label": "Peak Thrust", "value": "15 kg"  }, { "label": "Voltage", "value": "24S"  }
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
            "value": "85 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "15 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "36 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "40 x 13.1 inch"
      },
      {
            "label": "Dimension",
            "value": "145 x 47 mm"
      },
      {
            "label": "Weight",
            "value": "1,854 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"99.91 V", power:"684.38 W", thrust:"6.02 kg", current:"6.85 A", speed:"1,520 RPM", efficiency:"8.80 g/W" },
      { throttle:"35%", voltage:"99.60 V", power:"901.38 W", thrust:"7.72 kg", current:"9.05 A", speed:"1,717 RPM", efficiency:"8.56 g/W" },
      { throttle:"40%", voltage:"99.40 V", power:"1,166.96 W", thrust:"9.38 kg", current:"11.74 A", speed:"1,885 RPM", efficiency:"8.04 g/W" },
      { throttle:"45%", voltage:"98.80 V", power:"1,578.82 W", thrust:"11.92 kg", current:"15.98 A", speed:"2,114 RPM", efficiency:"7.55 g/W" },
      { throttle:"50%", voltage:"98.66 V", power:"1,931.76 W", thrust:"13.82 kg", current:"19.58 A", speed:"2,286 RPM", efficiency:"7.15 g/W" },
      { throttle:"55%", voltage:"98.30 V", power:"2,316.93 W", thrust:"15.91 kg", current:"23.57 A", speed:"2,452 RPM", efficiency:"6.87 g/W" },
      { throttle:"60%", voltage:"97.70 V", power:"2,725.83 W", thrust:"18.61 kg", current:"27.90 A", speed:"2,589 RPM", efficiency:"6.83 g/W" },
      { throttle:"65%", voltage:"97.21 V", power:"3,170.99 W", thrust:"19.96 kg", current:"32.62 A", speed:"2,726 RPM", efficiency:"6.29 g/W" },
      { throttle:"70%", voltage:"96.71 V", power:"3,697.22 W", thrust:"21.88 kg", current:"38.23 A", speed:"2,763 RPM", efficiency:"5.92 g/W" },
      { throttle:"75%", voltage:"96.16 V", power:"4,169.50 W", thrust:"23.90 kg", current:"43.36 A", speed:"2,994 RPM", efficiency:"5.73 g/W" },
      { throttle:"80%", voltage:"95.55 V", power:"4,798.52 W", thrust:"26.40 kg", current:"50.22 A", speed:"3,133 RPM", efficiency:"5.50 g/W" },
      { throttle:"90%", voltage:"94.65 V", power:"6,271.51 W", thrust:"31.08 kg", current:"66.26 A", speed:"3,446 RPM", efficiency:"4.96 g/W" },
      { throttle:"100%", voltage:"93.29 V", power:"7,824.23 W", thrust:"36.46 kg", current:"83.87 A", speed:"3,640 RPM", efficiency:"4.66 g/W" },
    ],
  },
  {
    id: "haemng-3lcfswn25",
    series: "haemng", seriesLabel: "Haemng Series",
    model: "HAEMNG 1550", name: "HAEMNG 1550", tag: "HAEMNG", application: "UAV / eVTOL",
    keySpecs: [ { "label": "KV Rating", "value": "50"  }, { "label": "Peak Thrust", "value": "25 kg"  }, { "label": "Voltage", "value": "24S"  }
],
    allSpecs: [
      {
            "label": "KV Rating",
            "value": "50"
      },
      {
            "label": "Rated Voltage (LiPo)",
            "value": "24S"
      },
      {
            "label": "Peak Current",
            "value": "200 A"
      },
      {
            "label": "Recommended Thrust",
            "value": "25 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "52 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "40 x 13.1 inch"
      },
      {
            "label": "Dimension",
            "value": "145 x 60 mm"
      },
      {
            "label": "Weight",
            "value": "2,250 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"102.40 V", power:"1,966.08 W", thrust:"12.44 kg", current:"19.20 A", speed:"2,194 RPM", efficiency:"6.33 g/W" },
      { throttle:"35%", voltage:"101.90 V", power:"2,644.31 W", thrust:"16.66 kg", current:"25.95 A", speed:"2,595 RPM", efficiency:"6.30 g/W" },
      { throttle:"40%", voltage:"101.20 V", power:"3,592.60 W", thrust:"20.48 kg", current:"35.50 A", speed:"2,782 RPM", efficiency:"5.70 g/W" },
      { throttle:"45%", voltage:"100.40 V", power:"4,478.84 W", thrust:"24.24 kg", current:"44.61 A", speed:"3,080 RPM", efficiency:"5.10 g/W" },
      { throttle:"50%", voltage:"99.13 V", power:"5,565.16 W", thrust:"27.86 kg", current:"56.14 A", speed:"3,188 RPM", efficiency:"5.01 g/W" },
      { throttle:"55%", voltage:"97.31 V", power:"6,785.43 W", thrust:"31.24 kg", current:"69.73 A", speed:"3,480 RPM", efficiency:"4.60 g/W" },
      { throttle:"60%", voltage:"97.99 V", power:"8,019.50 W", thrust:"35.55 kg", current:"81.84 A", speed:"3,585 RPM", efficiency:"4.43 g/W" },
      { throttle:"65%", voltage:"96.84 V", power:"9,586.19 W", thrust:"40.24 kg", current:"98.99 A", speed:"3,720 RPM", efficiency:"4.20 g/W" },
      { throttle:"70%", voltage:"94.89 V", power:"11,329.87 W", thrust:"43.28 kg", current:"119.40 A", speed:"3,931 RPM", efficiency:"3.82 g/W" },
      { throttle:"75%", voltage:"90.67 V", power:"11,542.29 W", thrust:"45.74 kg", current:"127.30 A", speed:"4,050 RPM", efficiency:"3.96 g/W" },
      { throttle:"80%", voltage:"89.27 V", power:"14,024.32 W", thrust:"48.46 kg", current:"157.10 A", speed:"4,110 RPM", efficiency:"3.46 g/W" },
      { throttle:"90%", voltage:"87.20 V", power:"14,867.60 W", thrust:"49.34 kg", current:"170.50 A", speed:"4,175 RPM", efficiency:"3.32 g/W" },
      { throttle:"100%", voltage:"85.20 V", power:"16,895.16 W", thrust:"51.80 kg", current:"198.30 A", speed:"4,230 RPM", efficiency:"3.07 g/W" },
    ],
  },
  {
    id: "maelard-a4w2jf3t2",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1026 — Configuration 1", name: "MAELARD 1026", tag: "MAELARD", application: "Multi-Mission",
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
            "value": "105 x 39 mm"
      },
      {
            "label": "Weight",
            "value": "842 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"58.04 V", power:"329.44 W", thrust:"3.34 kg", current:"5.68 A", speed:"1,532 RPM", efficiency:"10.14 g/W" },
      { throttle:"35%", voltage:"57.87 V", power:"437.15 W", thrust:"4.02 kg", current:"7.55 A", speed:"1,671 RPM", efficiency:"9.20 g/W" },
      { throttle:"40%", voltage:"57.72 V", power:"531.20 W", thrust:"4.64 kg", current:"9.20 A", speed:"1,810 RPM", efficiency:"8.73 g/W" },
      { throttle:"45%", voltage:"57.54 V", power:"636.97 W", thrust:"5.38 kg", current:"11.07 A", speed:"1,940 RPM", efficiency:"8.45 g/W" },
      { throttle:"50%", voltage:"57.27 V", power:"749.09 W", thrust:"6.16 kg", current:"13.08 A", speed:"2,084 RPM", efficiency:"8.22 g/W" },
      { throttle:"55%", voltage:"57.06 V", power:"892.42 W", thrust:"6.90 kg", current:"15.64 A", speed:"2,217 RPM", efficiency:"7.73 g/W" },
      { throttle:"60%", voltage:"56.82 V", power:"1,051.74 W", thrust:"7.90 kg", current:"18.51 A", speed:"2,355 RPM", efficiency:"7.51 g/W" },
      { throttle:"65%", voltage:"56.42 V", power:"1,235.03 W", thrust:"9.10 kg", current:"21.89 A", speed:"2,495 RPM", efficiency:"7.37 g/W" },
      { throttle:"70%", voltage:"56.09 V", power:"1,439.83 W", thrust:"10.16 kg", current:"25.67 A", speed:"2,634 RPM", efficiency:"7.06 g/W" },
      { throttle:"75%", voltage:"55.84 V", power:"1,662.36 W", thrust:"11.32 kg", current:"29.77 A", speed:"2,776 RPM", efficiency:"6.81 g/W" },
      { throttle:"80%", voltage:"55.40 V", power:"1,958.39 W", thrust:"12.38 kg", current:"35.35 A", speed:"2,895 RPM", efficiency:"6.32 g/W" },
      { throttle:"90%", voltage:"54.86 V", power:"2,651.93 W", thrust:"14.96 kg", current:"48.34 A", speed:"3,170 RPM", efficiency:"5.64 g/W" },
      { throttle:"100%", voltage:"53.41 V", power:"3,759.00 W", thrust:"18.08 kg", current:"70.38 A", speed:"3,451 RPM", efficiency:"4.81 g/W" },
    ],
  },
  {
    id: "maelard-vnu49pfqo",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1026 — Configuration 2", name: "MAELARD 1026", tag: "MAELARD", application: "Multi-Mission",
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
            "value": "105 x 39 mm"
      },
      {
            "label": "Weight",
            "value": "850 g"
      }
],
    perf: [
      { throttle:"30%", voltage:"57.24 V", power:"1,043.49 W", thrust:"8.16 kg", current:"18.23 A", speed:"2,357 RPM", efficiency:"7.82 g/W" },
      { throttle:"35%", voltage:"56.76 V", power:"1,432.62 W", thrust:"10.40 kg", current:"25.24 A", speed:"2,606 RPM", efficiency:"7.26 g/W" },
      { throttle:"40%", voltage:"56.27 V", power:"1,846.22 W", thrust:"12.06 kg", current:"32.81 A", speed:"2,820 RPM", efficiency:"6.53 g/W" },
      { throttle:"45%", voltage:"55.67 V", power:"2,283.58 W", thrust:"13.76 kg", current:"41.02 A", speed:"3,038 RPM", efficiency:"6.03 g/W" },
      { throttle:"50%", voltage:"55.23 V", power:"2,693.57 W", thrust:"14.16 kg", current:"48.77 A", speed:"3,149 RPM", efficiency:"5.26 g/W" },
      { throttle:"55%", voltage:"54.54 V", power:"3,216.77 W", thrust:"16.28 kg", current:"58.98 A", speed:"3,307 RPM", efficiency:"5.06 g/W" },
      { throttle:"60%", voltage:"55.09 V", power:"4,041.40 W", thrust:"18.72 kg", current:"73.36 A", speed:"3,549 RPM", efficiency:"4.63 g/W" },
      { throttle:"65%", voltage:"54.26 V", power:"4,616.98 W", thrust:"20.52 kg", current:"85.09 A", speed:"3,671 RPM", efficiency:"4.44 g/W" },
      { throttle:"70%", voltage:"54.11 V", power:"5,416.41 W", thrust:"21.92 kg", current:"100.10 A", speed:"3,807 RPM", efficiency:"4.05 g/W" },
      { throttle:"75%", voltage:"53.71 V", power:"6,063.86 W", thrust:"23.28 kg", current:"112.90 A", speed:"3,912 RPM", efficiency:"3.84 g/W" },
      { throttle:"90%", voltage:"52.06 V", power:"6,996.86 W", thrust:"24.00 kg", current:"134.40 A", speed:"4,104 RPM", efficiency:"3.43 g/W" },
      { throttle:"100%", voltage:"51.40 V", power:"7,098.34 W", thrust:"23.58 kg", current:"138.10 A", speed:"4,098 RPM", efficiency:"3.32 g/W" },
    ],
  },
  {
    id: "maelard-wkapubmc7",
    series: "maelard", seriesLabel: "Maelard Series",
    model: "MAELARD 1240", name: "MAELARD 1240", tag: "MAELARD", application: "Multi-Mission",
    keySpecs: [ { "label": "KV Rating", "value": "60"  }, { "label": "Peak Thrust", "value": "15 kg"  }, { "label": "Voltage", "value": "14S"  }
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
            "value": "15 kg"
      },
      {
            "label": "Peak Thrust",
            "value": "34 kg"
      },
      {
            "label": "Recommended Propeller",
            "value": "48 x 17.5 inch"
      },
      {
            "label": "Dimension",
            "value": "120 x 43 mm"
      },
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
    id: "fc-hs6o2ke3i",
    series: "fc", seriesLabel: "Flight Controller",
    model: "Auto Pilot", name: "Auto Pilot", tag: "FC", application: "Multi-Mission",
    keySpecs: [ { "label": "Core", "value": "Triple IMU"  }
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
            "value": "122 x 70 x 65.5 mm"
      },
      {
            "label": "Weight (with wires)",
            "value": "660 g"
      }
],
  },
  {
    id: "maelard-4irvoyh8l",
    series: "maelard", seriesLabel: "Maelard Series",
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
            "value": "110 x 105 x 86.1 mm"
      },
      {
            "label": "Weight (with wires)",
            "value": "1,482 g"
      }
],
  },
  {
    id: "maelard-svex1f94t",
    series: "maelard", seriesLabel: "Maelard Series",
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
            "value": "140 x 105 x 119.6 mm"
      },
      {
            "label": "Weight",
            "value": "1,318 g"
      }
],
  },
  {
    id: "maelard-bvszvpczv",
    series: "maelard", seriesLabel: "Maelard Series",
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
            "value": "225 x 120 x 158 mm"
      },
      {
            "label": "Weight",
            "value": "4,165 g"
      }
],
  },
  {
    id: "maelard-sz6lpwgd0",
    series: "maelard", seriesLabel: "Maelard Series",
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
            "value": "225 x 155 x 210 mm"
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
    keySpecs: [ { "label": "Continuous", "value": "40 A (under good cooling conditions)"  }, { "label": "Battery", "value": "12S"  }, { "label": "Weight", "value": "57 g"  }
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
            "value": "40 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "60 A (under good cooling conditions)"  }, { "label": "Battery", "value": "12S"  }, { "label": "Weight", "value": "108 g"  }
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
            "value": "60 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "120 A (under good cooling conditions)"  }, { "label": "Battery", "value": "12S"  }, { "label": "Weight", "value": "215 g"  }
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
            "value": "120 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "200 A (under good cooling conditions)"  }, { "label": "Battery", "value": "24S"  }, { "label": "Weight", "value": "725 g"  }
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
            "value": "200 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "260 A (under good cooling conditions)"  }, { "label": "Battery", "value": "14S"  }, { "label": "Weight", "value": "537 g"  }
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
            "value": "260 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "150 A (under good cooling conditions)"  }, { "label": "Battery", "value": "14S"  }, { "label": "Weight", "value": "357 g"  }
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
            "value": "150 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "200 A (under good cooling conditions)"  }, { "label": "Battery", "value": "14S"  }, { "label": "Weight", "value": "320 g"  }
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
            "value": "200 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "150 A (under good cooling conditions)"  }, { "label": "Battery", "value": "12S – 14S"  }, { "label": "Weight", "value": "248 g"  }
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
            "value": "150 A (under good cooling conditions)"
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
    keySpecs: [ { "label": "Continuous", "value": "30 A (under good cooling conditions)"  }, { "label": "Battery", "value": "6S"  }, { "label": "Weight", "value": "65 g"  }
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
            "value": "30 A (under good cooling conditions)"
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
];
