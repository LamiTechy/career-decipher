import Head from "next/head";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { services } from "../data/services";
import ServiceCard from "../components/ServiceCard";

export default function Services() {
  return (
    <>
      <Head>
        <title>Services & Pricing – Career Decipher</title>
        <meta name="description" content="View all career consulting services and pricing. Resume review, interview prep, LinkedIn optimization, and more." />
      </Head>

      {/* Page header */}
      <section className="bg-cream-50 pt-32 pb-16 border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-forest-500 text-sm font-semibold uppercase tracking-widest">Services & Pricing</span>
          <h1 className="font-display text-5xl font-bold text-slate-850 mt-2 mb-4">
            Invest in your career future
          </h1>
          <p className="text-slate-850/60 text-lg max-w-2xl mx-auto">
            Every service is a focused, personalized session designed to give you a real competitive edge. No fluff — just results.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Bundle highlight */}
      <section className="py-16 bg-forest-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-gold-300 text-sm font-semibold uppercase tracking-widest">Best Value</span>
          <h2 className="font-display text-4xl font-bold text-white mt-2 mb-4 inline-flex items-center justify-center gap-3">
            <Rocket className="w-6 h-6" />
            The Bundle Package — 5 Hours for $250
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Get everything: resume, cover letter, LinkedIn, career strategy, interview prep, and 30-day follow-up email support. Save $100+ compared to individual sessions.
          </p>
          <Link href="/booking/bundle-package" className="inline-flex items-center gap-2 px-10 py-4 bg-gold-400 hover:bg-gold-500 text-white rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
            Get the Bundle →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-slate-850 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "How do sessions work?", a: "All sessions are conducted via video call (Zoom or Google Meet). You'll receive a calendar invite with the link after booking." },
              { q: "What happens after I book?", a: "You'll receive a confirmation email with your session details. For resume/cover letter reviews, we'll ask you to send your documents 24 hours in advance." },
              { q: "Can I reschedule my session?", a: "Yes! You can reschedule up to 24 hours before your session at no charge. Reach out to hello@careerdecipher.com to reschedule." },
              { q: "Is there a satisfaction guarantee?", a: "Absolutely. If you're not satisfied with your session, we'll offer a free follow-up session or a full refund — no questions asked." },
              { q: "What if I need ongoing support?", a: "Consider the Bundle Package for 5 hours of dedicated support, or reach out about our monthly mentorship plans." },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 border border-cream-200">
                <h3 className="font-semibold text-slate-850 mb-2">{faq.q}</h3>
                <p className="text-slate-850/65 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
