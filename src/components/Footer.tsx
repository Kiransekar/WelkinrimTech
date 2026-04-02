const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Technology", href: "#technology" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const industries = ["UAV / eVTOL", "Marine", "Land", "Robotics"];

export default function Footer() {
  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="inline-flex items-center gap-3 mb-6">
            <img
              src={`${import.meta.env.BASE_URL}welkinrim-logo-white.svg`}
              alt="Welkinrim Technologies"
              className="h-10 w-auto"
            />
          </div>
          <p className="text-[#808080] text-xs leading-relaxed mb-6" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Pioneering the future of electric propulsion for UAV, Marine, Land and Robotics applications.
          </p>
          <div className="flex gap-3">
            {["in", "tw", "yt"].map((soc) => (
              <div
                key={soc}
                className="w-8 h-8 border border-white/10 hover:border-[#ffc914] hover:text-[#ffc914] flex items-center justify-center text-white/50 text-xs cursor-pointer transition-all duration-200"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {soc.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffc914] mb-6" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Navigation
          </div>
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="text-left text-xs text-white/60 hover:text-[#ffc914] transition-colors duration-200 uppercase tracking-widest"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Industries */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffc914] mb-6" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Industries
          </div>
          <div className="flex flex-col gap-3">
            {industries.map((ind) => (
              <span key={ind} className="text-xs text-white/60 uppercase tracking-widest" style={{ fontFamily: 'Michroma, sans-serif' }}>
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffc914] mb-6" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Contact
          </div>
          <div className="flex flex-col gap-4 text-xs text-white/60" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <div>
              <div className="text-[#808080] text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>Address</div>
              Chennai Industrial Corridor,<br />Tamil Nadu, India
            </div>
            <div>
              <div className="text-[#808080] text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>Email</div>
              info@electroprop.in
            </div>
            <div>
              <div className="text-[#808080] text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>Phone</div>
              +91 44 XXXX XXXX
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] text-white/30 uppercase tracking-widest" style={{ fontFamily: 'Michroma, sans-serif' }}>
            © {new Date().getFullYear()} Welkinrim Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <div className="h-px w-8 bg-[#ffc914]/40" />
            <span className="text-[10px] text-[#ffc914]/60 uppercase tracking-widest px-2" style={{ fontFamily: 'Michroma, sans-serif' }}>
              Precision Electric Propulsion
            </span>
            <div className="h-px w-8 bg-[#ffc914]/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
