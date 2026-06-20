import Head from "next/head";
import Link from "next/link";
import { Sparkles, Handshake, PenTool, Compass, ArrowRight } from "lucide-react";
import { mainServices } from "../data/mainServices";

const offerings = mainServices.map((service) => ({
  title: service.name,
  description: service.shortDesc,
  icon:
    service.icon === "Handshake" ? (
      <Handshake className="w-7 h-7 text-gold-400" />
    ) : service.icon === "PenTool" ? (
      <PenTool className="w-7 h-7 text-forest-500" />
    ) : (
      <Compass className="w-7 h-7 text-slate-850" />
    ),
  slug: service.slug,
}));

const benefits = [
  {
    title: "Warm, human-first guidance",
    description: "A calm, modern process with clear next steps and thoughtful follow-up support.",
  },
  {
    title: "Actionable clarity",
    description: "Walk away with practical recommendations you can use immediately in your career or brand work.",
  },
  {
    title: "Tailored for your goals",
    description: "Every session is built around your experience, audience, and the opportunities you want next.",
  },
];

const testimonials = [
  {
    quote: "The brand session helped me stand out and land the right collaboration. The process felt calm, clear, and professional.",
    name: "Olivia N.",
    role: "Creative Director",
  },
  {
    quote: "I finally understood how to tell my story in a way that felt true. The career advice was warm and direct - exactly what I needed.",
    name: "Daniel A.",
    role: "Consulting Professional",
  },
  {
    quote: "I booked a strategy call and walked away with a complete plan. The follow-up support made a real difference.",
    name: "Sade I.",
    role: "Entrepreneur",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Career Decipher - Warm Modern Career & Consultation</title>
        <meta
          name="description"
          content="Warm modern career consulting, brand collaboration and general consultation services with a friendly, polished experience."
        />
      </Head>

      <section className="min-h-screen bg-cream-50 pt-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 text-sm text-forest-700 shadow-sm border border-cream-200">
              <Sparkles className="w-4 h-4 text-gold-400" />
              Warm modern consultation for career, collaboration, and brand growth.
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Career clarity, brand collaboration, and consultation that feels polished and human.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
                Build your next move with strategy designed for professionals, founders, and creative brands. It is career advice with a warm modern tone, practical next steps, and a refreshingly simple process.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-forest-500 px-8 py-4 text-white text-base font-semibold shadow-lg shadow-forest-500/10 transition hover:bg-forest-600"
              >
                View Services
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-8 py-4 text-slate-900 font-semibold transition hover:bg-cream-100"
              >
                Browse services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cream-200 bg-white p-10 shadow-[0_30px_60px_rgba(62,44,14,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-forest-500">Warm modern consultation</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">What to expect from your first session</h2>
            <ul className="mt-8 space-y-5">
              {[
                "A calm, focused conversation about your goals.",
                "A tailored plan for career progress and collaboration.",
                "Clear follow-up guidance so you keep moving forward.",
              ].map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-cream-50 p-4">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest-500 text-white">+</span>
                  <span className="text-slate-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-forest-500">What we do</p>
          <h2 className="font-display text-4xl font-bold text-slate-900 mt-4">Career consultation, brand collaboration, and general support in one warm modern place.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {offerings.map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="rounded-[2rem] border border-cream-200 bg-cream-50 p-8 shadow-sm transition hover:shadow-lg hover:border-forest-300 group"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-forest-700 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 text-left">{item.title}</h3>
                <p className="text-slate-700 leading-relaxed text-left mb-4">{item.description}</p>
                <div className="flex items-center gap-2 text-forest-500 font-semibold group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-50 py-24">
        <div className="mx-auto max-w-6xl px-6 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-8">
            <p className="text-sm uppercase tracking-[0.3em] text-forest-500">Why this feels different</p>
            <h2 className="font-display text-4xl font-bold text-slate-900">A modern, thoughtful process built for real results.</h2>
            <p className="max-w-xl text-lg leading-relaxed text-slate-700">
              We focus on strategy that feels friendly and professional, so every session helps you move forward with confidence and clarity.
            </p>
            <div className="grid gap-4">
              {benefits.map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm border border-cream-200">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-700 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cream-200 bg-white p-10 shadow-[0_40px_80px_rgba(62,44,14,0.08)]">
            <Link href="/services/brand-collaboration" className="block">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-forest-500/10 p-6 cursor-pointer hover:bg-forest-500/20 transition">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-forest-700">Featured service</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">Brand & Career Launch</p>
                </div>
                <div className="rounded-3xl bg-forest-500 px-4 py-3 text-white text-sm font-semibold">Popular</div>
              </div>
            </Link>
            <div className="mt-8 space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Perfect for professionals who want career momentum plus a stronger personal brand and collaboration strategy.
              </p>
              <ul className="space-y-3 text-slate-700 leading-relaxed">
                <li>- Define your next career or brand direction</li>
                <li>- Shape collaboration opportunities that feel aligned</li>
                <li>- Get a clear follow-up plan and confidence to move forward</li>
              </ul>
              <Link
                href="/booking/brand-collaboration"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-forest-500 text-white font-semibold hover:bg-forest-600 transition"
              >
                Book This Service
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-forest-500">Client stories</p>
          <h2 className="font-display text-4xl font-bold text-slate-900 mt-4">Feedback from people who took the next step.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-[2rem] border border-cream-200 bg-cream-50 p-8 shadow-sm">
                <p className="text-slate-700 leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="text-slate-900">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-700 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-gold-300">Ready when you are</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">Start with a warm, modern consultation.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Choose the service that fits your needs, and let's work together to move your career or brand forward.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/services/career-consultation"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-8 py-4 text-slate-900 font-semibold transition hover:bg-gold-300"
            >
              Book a Service
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-white font-semibold transition hover:bg-white/20"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
