import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-850 text-cream-100 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 overflow-hidden rounded-lg">
                <img
                  src="/logo.png"
                  alt="Hanot Hub logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display text-xl font-semibold">Hanot Hub</span>
            </div>
            <p className="text-cream-200/70 text-sm leading-relaxed">
              Welcome to Hanot Hub, your all-in-one platform for professional growth, custom solutions, short-term stays, and brand partnerships.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gold-300 mb-4 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-2">
              {[
                { label: "Career Consultation", href: "/services/career-consultation" },
                { label: "Custom Consultation", href: "/services/general-consultation" },
                { label: "Brand Collaboration/Influencing", href: "/services/brand-collaboration" },
                { label: "Evet Shortlet", href: "/services/shortlet" },
              ].map((service) => (
                <li key={service.href}>
                  <Link href={service.href} className="text-cream-200/70 hover:text-cream-100 text-sm transition-colors">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gold-300 mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Book a Session", href: "/services" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream-200/70 hover:text-cream-100 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream-200/50 text-sm">© {new Date().getFullYear()} Hanot Hub. All rights reserved.</p>
          <p className="text-cream-200/50 text-sm flex items-center gap-1">
            <Heart className="w-4 h-4 text-gold-400" />
            Built for career clarity
          </p>
        </div>
      </div>
    </footer>
  );
}
