// src/components/calculators/SplitLayout.tsx
// Shared split-panel layout: inputs left (scrollable), results right (sticky)
// Falls back to stacked vertical layout on mobile (< lg)

import React from "react";

interface SplitLayoutProps {
  inputs: React.ReactNode;
  results: React.ReactNode;
}

export default function SplitLayout({ inputs, results }: SplitLayoutProps) {
  return (
    <div id="calculator-capture-area" className="flex flex-col lg:flex-row gap-6 bg-white" style={{ minHeight: "70vh" }}>
      {/* Left: Inputs — scrollable */}
      <div
        className="w-full lg:w-[40%] lg:overflow-y-auto lg:pr-4"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        {inputs}
      </div>

      {/* Right: Results — sticky */}
      <div
        className="w-full lg:w-[60%] lg:sticky lg:self-start lg:overflow-y-auto"
        style={{ top: 120, maxHeight: "calc(100vh - 140px)" }}
      >
        {results}
      </div>
    </div>
  );
}
