const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Technology", href: "#technology" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const industries = ["UAV/eVTOL", "Marine", "Land", "Robotics"];

export default function Footer() {
  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="inline-flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <img
              src={`${import.meta.env.BASE_URL}welkinrim-logo-white.svg`}
              alt="Welkinrim Technologies"
              className="h-8 md:h-10 w-auto"
            />
          </div>
          <p className="text-[#808080] text-xs leading-relaxed mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Pioneering the future of electric propulsion for UAV, Marine, Land and Robotics applications.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.linkedin.com/company/welkinrimtechnologies/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-white/10 hover:border-[#ffc812] hover:text-[#ffc812] flex items-center justify-center text-white/50 transition-all duration-200 group"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:stroke-[#ffc812]"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffc812] mb-3 md:mb-4" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Navigation
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="text-left text-xs text-white/60 hover:text-[#ffc812] transition-colors duration-200 uppercase tracking-widest"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Industries */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffc812] mb-3 md:mb-4" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Industries
          </div>
          <div className="flex flex-col gap-2">
            {industries.map((ind) => (
              <span key={ind} className="text-xs text-white/60 uppercase tracking-widest" style={{ fontFamily: 'Michroma, sans-serif' }}>
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffc812] mb-3 md:mb-4" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Contact
          </div>
          <div className="flex flex-col gap-3 text-xs text-white/60" style={{ fontFamily: 'Lexend, sans-serif' }}>
            <div>
              <div className="text-[#808080] text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>Registered Address</div>
              #5, Chokkanathar Street, MMDA Nagar<br />Chitalapakam, Chennai 600064
            </div>
            <div>
              <div className="text-[#808080] text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>Factory Address</div>
              #23, Sujatha nagar, kandigai village,<br />Panruti, Sripermabadur, TN - 631604
            </div>
            <div>
              <div className="text-[#808080] text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>Email</div>
              contact@welkinrim.com
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] text-white/30 uppercase tracking-widest" style={{ fontFamily: 'Michroma, sans-serif' }}>
            © {new Date().getFullYear()} Welkinrim Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <div className="h-px w-8 bg-[#ffc812]/40" />
            <span className="text-[10px] text-[#ffc812]/60 uppercase tracking-widest px-2" style={{ fontFamily: 'Michroma, sans-serif' }}>
              Precision Electric Propulsion
            </span>
            <div className="h-px w-8 bg-[#ffc812]/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
