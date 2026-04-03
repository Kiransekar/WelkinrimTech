interface CalcStubProps {
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function CalcStub({ name, description, icon }: CalcStubProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 border border-dashed border-gray-200 py-16">
      <div className="text-[#ffc914]/25 w-20 h-20">{icon}</div>
      <div className="text-center">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914] mb-2"
           style={{ fontFamily: "Michroma, sans-serif" }}>
          Coming Soon
        </p>
        <h3 className="text-2xl font-bold text-black mb-2"
            style={{ fontFamily: "Michroma, sans-serif" }}>
          {name}
        </h3>
        <p className="text-sm text-[#808080] max-w-sm"
           style={{ fontFamily: "Lexend, sans-serif" }}>
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-[#ffc914]/5 border border-[#ffc914]/20 px-5 py-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ffc914] animate-pulse" />
        <p className="text-[10px] tracking-widest uppercase text-[#555]"
           style={{ fontFamily: "Michroma, sans-serif" }}>
          Under development — request early access
        </p>
      </div>
    </div>
  );
}
