import { useState } from "react";
import { domToJpeg } from "modern-screenshot";
import jsPDF from "jspdf";

// Fixed capture width matching A4 landscape proportions for clean layout
// Increased from 1400 to 1600 to better accommodate the split-panel results column
const LANDSCAPE_CAPTURE_WIDTH = 1600;

export function DownloadReportButton({ 
  targetElementId, 
  filename, 
}: { 
  targetElementId: string, 
  filename: string, 
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const el = document.getElementById(targetElementId);
    if (!el) {
      alert("Error: Capture area not found.");
      return;
    }

    setIsExporting(true);

    // Force header visible and hide action buttons for capture
    document.body.classList.add("pdf-exporting");

    // Ensure all fonts are fully loaded before capturing
    await document.fonts.ready;

    // Allow DOM/React to apply visibility styles + font loading settle
    await new Promise(r => setTimeout(r, 400));

    try {
      const scale = 2; // 2x DPI — crisp text at 3200px, keeps file size small

      // The pdf-exporting class is already applied to body, which triggers:
      // - .pdf-header to display:block
      // - .pdf-hide to display:none
      // - report-area to have full width/overflow visible via CSS

      // Wait a moment for React to re-render with the pdf-exporting styles applied
      await new Promise(r => setTimeout(r, 300));

      // Get the direct parent (results column from SplitLayout)
      const resultsColumn = el.parentElement;

      // Temporarily override the SplitLayout constraints on the results column
      if (resultsColumn) {
        resultsColumn.style.position = "static";
        resultsColumn.style.width = "100%";
        resultsColumn.style.maxHeight = "none";
        resultsColumn.style.overflow = "visible";
      }

      const dataUrl = await domToJpeg(el, {
        scale,
        quality: 0.92,
        backgroundColor: "#ffffff",
        width: LANDSCAPE_CAPTURE_WIDTH,
        height: el.scrollHeight,
        style: {
          width: LANDSCAPE_CAPTURE_WIDTH + "px",
          // Ensure the captured element renders in full-width mode
          maxWidth: "none",
        },
        // Filter out elements marked with pdf-hide class
        filter: (node: Node) => {
          if (node instanceof HTMLElement) {
            return !node.classList.contains("pdf-hide");
          }
          return true;
        },
        font: {
          preferredFormat: "woff2",
        },
        timeout: 30000,
      });

      // Restore the results column styles
      if (resultsColumn) {
        resultsColumn.style.position = "";
        resultsColumn.style.width = "";
        resultsColumn.style.maxHeight = "";
        resultsColumn.style.overflow = "";
      }

      // A4 Landscape: 297mm × 210mm
      const pdfWidth = 297;
      const pdfPageHeight = 210;

      // Calculate image dimensions on PDF, maintaining aspect ratio
      const imgAspectRatio = el.scrollHeight / LANDSCAPE_CAPTURE_WIDTH;
      const imgHeightOnPdf = pdfWidth * imgAspectRatio;

      if (imgHeightOnPdf <= pdfPageHeight) {
        // Content fits on a single landscape page
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, imgHeightOnPdf);
        downloadPdf(pdf, filename);
      } else {
        // Content is taller — use a custom single tall page (no awkward cuts)
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [pdfWidth, imgHeightOnPdf],
        });
        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, imgHeightOnPdf);
        downloadPdf(pdf, filename);
      }
    } catch (e: any) {
      console.error("PDF Export error:", e);
      alert(`Failed to generate PDF: ${e?.message || e}`);
    } finally {
      document.body.classList.remove("pdf-exporting");
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`pdf-hide flex items-center gap-1.5 border border-[#ffc812]/30 px-3 py-1.5 text-[9px] tracking-widest uppercase transition-all duration-300 ${
        isExporting 
          ? "bg-[#ffc812]/10 text-[#ffc812] cursor-wait" 
          : "bg-[#ffc812]/5 text-[#ffc812] hover:bg-[#ffc812] hover:text-black hover:border-[#ffc812]"
      }`}
      style={{ fontFamily: "Michroma, sans-serif" }}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Generating PDF...
        </>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}

function downloadPdf(pdf: jsPDF, filename: string) {
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function PdfTemplateHeader({ calculatorName }: { calculatorName: string }) {
  // This header is display:none by default (in index.css).
  // When body gets .pdf-exporting, it reveals itself to be stamped into the PDF.
  return (
    <div className="pdf-header pb-6 mb-6 pt-4 px-4 border-b border-white/10 bg-[#0a0a0a] relative">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <img src="/welkinrim-logo-white.svg" className="h-8 opacity-90" alt="WelkinRim" />
          <div className="h-6 w-px bg-white/20 mx-2" />
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
              Drive Calculator Suite
            </p>
            <h1 className="text-xl font-bold text-white uppercase tracking-widest mt-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>
              {calculatorName} Report
            </h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#808080] tracking-widest uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
            Generated On
          </p>
          <p className="text-[11px] text-white/80" style={{ fontFamily: "Lexend, sans-serif" }}>
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Disclaimer block */}
      <div className="mt-4 p-3 bg-[#ffc812]/5 border border-[#ffc812]/20">
        <p className="text-[9px] text-[#ffc812]/80 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
          <strong className="text-[#ffc812] uppercase tracking-wider" style={{ fontFamily: "Michroma, sans-serif" }}>Disclaimer:</strong> All calculations are theoretical estimations and do not guarantee real-world performance. Environmental conditions, precise manufacturing variations, and exact setup topologies significantly alter outcomes. Review safely.
        </p>
      </div>

      {/* Decorative stripe */}
      <div className="absolute bottom-0 left-0 h-0.5 w-1/4 bg-[#ffc812]" />
    </div>
  );
}
