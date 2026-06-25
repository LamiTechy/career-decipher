import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mainServices = [
    { label: "Career Consultation", href: "/booking/career-consultation" },
    { label: "Brand Collaboration", href: "/booking/brand-collaboration" },
    { label: "General Consultation", href: "/booking/general-consultation" },
    { label: "Short-let Apartment", href: "/booking/shortlet" },
  ];

  const links = [
    { href: "/", label: "Home" },
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
            <img
              src="/hanot-hub-logo.svg"
              alt="Hanot Hub logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-display font-700 text-xl text-slate-850 tracking-tight">
            Hanot <span className="text-forest-500">Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-forest-500 text-white"
                  : "text-slate-850 hover:bg-cream-100 hover:text-forest-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Services Dropdown */}
          <div className="relative group">
            <button
              onMouseEnter={() => setServicesDropdown(true)}
              onMouseLeave={() => setServicesDropdown(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-850 hover:bg-cream-100 hover:text-forest-600 transition-all duration-200 flex items-center gap-1"
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesDropdown ? "rotate-180" : ""}`} />
            </button>

            {servicesDropdown && (
              <div
                onMouseEnter={() => setServicesDropdown(true)}
                onMouseLeave={() => setServicesDropdown(false)}
                className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-cream-200 py-2 z-50"
              >
                <Link
                  href="/services"
                  onClick={() => setServicesDropdown(false)}
                  className="block px-4 py-2.5 text-sm text-forest-600 hover:bg-cream-50 transition-colors border-b border-cream-200"
                >
                  Career Consultation
                </Link>
                {mainServices.slice(1).map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    onClick={() => setServicesDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-slate-850 hover:bg-cream-50 hover:text-forest-600 transition-colors"
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-cream-100 transition-colors"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-slate-850 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 bg-slate-850 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-slate-850 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-cream-200 px-6 py-4 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-forest-500 text-white"
                  : "text-slate-850 hover:bg-cream-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/services"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 rounded-lg text-sm text-forest-600 hover:bg-cream-50 transition-colors border-t border-cream-200 mt-2"
          >
           Career Consultation
          </Link>
          {mainServices.slice(1).map((service) => (
            <Link
              key={service.href}
              href={service.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm text-slate-850 hover:bg-cream-50 transition-colors"
            >
              {service.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
