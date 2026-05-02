import { useState } from "react";

const industries = ["UAV/eVTOL", "Marine", "Land", "Robotics", "Multiple"];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-6 md:py-8 lg:py-12 bg-[#050505] scroll-mt-[60px] md:scroll-mt-[72px] flex flex-col justify-center min-h-[80vh] lg:min-h-[calc(100vh-72px)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 w-full my-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-2 md:mb-3">
            <div className="h-px w-8 md:w-10 bg-[#ffc812]" />
            <span className="text-white/40 text-[9px] md:text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Michroma, sans-serif' }}>
              Enquiry
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Start a Conversation
            <br />
            <span className="text-[#ffc812]">With Our Engineers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center">
          {/* Left: Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Whether you're integrating our propulsion systems into an existing platform or starting from scratch, our engineering team is ready to discuss your specific requirements.
            </p>

            {/* Contact cards */}
            <div className="flex flex-col gap-2 md:gap-3">
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: "Email",
                  value: "connect@welkinrim.com",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  label: "Location",
                  value: "#23, Sujatha nagar, kandigai village, Panruti, Sripermabadur, TN - 631604",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 md:gap-4 p-2 md:p-3 border border-white/5 bg-[#080808] hover:border-[#ffc812]/50 transition-colors duration-200" style={{ transform: 'skewX(-10deg)' }}>
                  <div className="w-7 md:w-8 h-7 md:h-8 bg-[#ffc812]/10 flex items-center justify-center flex-shrink-0 text-[#ffc812]" style={{ transform: 'skewX(10deg)' }}>
                    {item.icon}
                  </div>
                  <div style={{ transform: 'skewX(10deg)' }}>
                    <div className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Michroma, sans-serif' }}>{item.label}</div>
                    <div className="text-xs md:text-sm text-white/90 font-medium" style={{ fontFamily: 'Lexend, sans-serif' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Industries badge */}
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-widest mb-2" style={{ fontFamily: 'Michroma, sans-serif' }}>We Serve</div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {["UAV/eVTOL", "Marine", "Land", "Robotics"].map((ind) => (     
                  <span
                    key={ind}
                    className="px-2 py-1 border border-[#ffc812]/30 text-[9px] tracking-[0.15em] uppercase text-white/80"
                    style={{ fontFamily: 'Michroma, sans-serif', transform: 'skewX(-10deg)' }}
                  >
                    <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>{ind}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 border border-[#ffc812]/30 bg-[#ffc812]/5">
                <div className="w-16 h-16 bg-[#ffc812] rounded-full flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Michroma, sans-serif' }}>
                  Message Received
                </h3>
                <p className="text-white/60 text-sm max-w-xs" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Our engineering team will review your inquiry and get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", company: "", email: "", phone: "", industry: "", message: "" }); }}
                  className="mt-6 px-6 py-2.5 bg-white text-black text-xs tracking-widest uppercase hover:bg-[#ffc812] transition-all duration-300"
                  style={{ fontFamily: 'Michroma, sans-serif', transform: 'skewX(-10deg)' }}
                >
                  <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>Send Another</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 lg:gap-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Full Name *</label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ffc812] transition-colors duration-200 bg-[#0a0a0a]"
                    style={{ fontFamily: 'Lexend, sans-serif', transform: 'skewX(-10deg)' }}
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ffc812] transition-colors duration-200 bg-[#0a0a0a]"
                    style={{ fontFamily: 'Lexend, sans-serif', transform: 'skewX(-10deg)' }}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Email *</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ffc812] transition-colors duration-200 bg-[#0a0a0a]"
                    style={{ fontFamily: 'Lexend, sans-serif', transform: 'skewX(-10deg)' }}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ffc812] transition-colors duration-200 bg-[#0a0a0a]"
                    style={{ fontFamily: 'Lexend, sans-serif', transform: 'skewX(-10deg)' }}
                  />
                </div>

                {/* Industry */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Industry Sector</label>
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className="w-full border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ffc812] transition-colors duration-200 bg-[#0a0a0a] appearance-none"
                    style={{ fontFamily: 'Lexend, sans-serif', transform: 'skewX(-10deg)' }}
                  >
                    <option value=""></option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Message *</label>
                  <textarea
                    required
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ffc812] transition-colors duration-200 bg-[#0a0a0a] resize-none"
                    style={{ fontFamily: 'Lexend, sans-serif', transform: 'skewX(-10deg)' }}
                  />
                </div>

                {/* Submit */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#ffc812] text-black text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#e0b212] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3"
                    style={{ fontFamily: 'Michroma, sans-serif', transform: 'skewX(-10deg)' }}
                  >
                    <span className="inline-flex items-center gap-3" style={{ transform: 'skewX(10deg)' }}>
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Enquiry"
                      )}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
