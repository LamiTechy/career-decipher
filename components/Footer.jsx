import Link from "next/link";
import { Mail, CalendarDays, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-850 text-cream-100 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 overflow-hidden rounded-lg">
                <img
                  src="/career-decipher-logo.svg"
                  alt="Career Decipher logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display text-xl font-semibold">Career Decipher</span>
            </div>
            <p className="text-cream-200/70 text-sm leading-relaxed">
              Professional career consulting to help you find clarity, confidence, and your next big opportunity.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gold-300 mb-4 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-2">
              {["Career Consultation", "Resume Review", "Interview Prep", "LinkedIn Optimization", "Bundle Package"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-cream-200/70 hover:text-cream-100 text-sm transition-colors">
                    {s}
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
                { label: "Book a Session", href: "/book" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream-200/70 hover:text-cream-100 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-sm space-y-2 text-cream-200/70">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-100/10 text-cream-100">
                  <Mail className="w-4 h-4" />
                </span>
                <span>hello@careerdecipher.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-100/10 text-cream-100">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <span>Mon–Fri, 9am–6pm EST</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream-200/50 text-sm">© {new Date().getFullYear()} Career Decipher. All rights reserved.</p>
          <p className="text-cream-200/50 text-sm flex items-center gap-1">
            <Heart className="w-4 h-4 text-gold-400" />
            Built for career clarity
          </p>
        </div>
      </div>
    </footer>
  );
}
