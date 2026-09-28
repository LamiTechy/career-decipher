import Head from "next/head";
import Link from "next/link";
import { Handshake, PenTool, Compass, Home as HomeIcon, ArrowRight } from "lucide-react";
import { mainServices } from "../data/mainServices";

const offerings = mainServices.map((service) => ({
  title: service.displayName || service.name,
  description: service.shortDesc,
  icon:
    service.icon === "Handshake" ? (
      <Handshake className="w-7 h-7 text-gold-400" />
    ) : service.icon === "PenTool" ? (
      <PenTool className="w-7 h-7 text-forest-500" />
    ) : service.icon === "Home" ? (
      <HomeIcon className="w-7 h-7 text-forest-500" />
    ) : (
      <Compass className="w-7 h-7 text-slate-850" />
    ),
  slug: service.slug,
}));

export default function Home() {
  return (
    <>
      <Head>
        <title>Hanot Hub - Warm Modern Career & Consultation</title>
        <meta
          name="description"
          content="Warm modern career consulting, brand collaboration and general consultation services with a friendly, polished experience."
        />
      </Head>

      <section className="min-h-screen bg-cream-50 pt-24">
        <div className="mx-auto flex max-w-6xl flex-col-reverse gap-12 px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Welcome! I'm so glad you're here.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
                Whether you are looking to decode your next major career move, collaborate on an impactful brand campaign, book a memorable stay, or simply connect one-on-one—you've landed in the right place.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_30px_60px_rgba(62,44,14,0.08)]">
              <img
                src="/ceo.jpeg"
                alt="Hanot Hub"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-forest-500">What we do</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {offerings.map((item) => (
              <Link
                key={item.slug}
                href={item.slug === "career-consultation" ? "/services" : `/services/${item.slug}`}
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

      <section className="bg-forest-700 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-gold-300">Ready when you are</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">Start with a warm, modern consultation.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Choose the service that fits your needs, and let's work together to move your career or brand forward.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-8 py-4 text-slate-900 font-semibold transition hover:bg-gold-300"
            >
              Book a Service
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
