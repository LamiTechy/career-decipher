import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { mainServices } from "../../data/mainServices";
import { services as detailedServices } from "../../data/services";

export default function ServiceDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const mainService = mainServices.find((s) => s.slug === slug);
  const detailedService = detailedServices.find((s) => s.id === slug);

  const service = {
    name: detailedService?.name || mainService?.name,
    description: detailedService?.description || mainService?.description,
    price: detailedService?.price ?? mainService?.price,
    duration: detailedService?.duration || mainService?.duration,
    highlights: detailedService?.highlights || mainService?.highlights || [],
    includes: mainService?.includes || detailedService?.highlights || [],
    benefits: mainService?.benefits || [],
    faq: mainService?.faq || [],
    caseStudies: mainService?.caseStudies || [],
    slug: mainService?.slug || detailedService?.id,
  };

  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-700">Loading...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Service not found</h1>
          <Link href="/" className="text-forest-500 hover:text-forest-600">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{service.name} - Career Decipher</title>
        <meta name="description" content={service.description} />
      </Head>

      <section className="min-h-screen bg-cream-50 pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-1 text-forest-500 hover:text-forest-600 mb-6">
              <span>←</span> Back to home
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <h1 className="font-display text-5xl font-bold text-slate-900 mb-6">{service.name}</h1>
              <p className="text-xl text-slate-700 leading-relaxed mb-8">{service.description}</p>

              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">What's Included</h2>
                  <div className="space-y-3">
                    {service.includes.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">Key Benefits</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {service.benefits.map((benefit) => (
                      <div key={benefit} className="p-4 rounded-2xl bg-white border border-cream-200">
                        <p className="text-slate-700">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {service.caseStudies.length > 0 && (
                  <div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">Success Stories</h2>
                    <div className="grid gap-4">
                      {service.caseStudies.map((study) => (
                        <div key={study.name} className="p-6 rounded-2xl bg-white border border-cream-200">
                          <p className="italic text-slate-700 mb-4">"{study.quote}"</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{study.name}</p>
                              <p className="text-sm text-slate-600">{study.company}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-forest-500 text-sm">{study.result}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.faq.length > 0 && (
                  <div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">FAQ</h2>
                    <div className="space-y-4">
                      {service.faq.map((item, idx) => (
                        <details key={idx} className="p-4 rounded-2xl bg-white border border-cream-200 group cursor-pointer">
                          <summary className="font-semibold text-slate-900 flex items-center justify-between">
                            {item.q}
                            <span className="transition-transform group-open:rotate-180">▼</span>
                          </summary>
                          <p className="mt-3 text-slate-700 leading-relaxed">{item.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl bg-white border border-cream-200 p-8 shadow-lg">
                <div className="mb-8">
                  <p className="text-sm uppercase tracking-[0.3em] text-forest-500 font-semibold">Investment</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">${service.price}</p>
                  <p className="text-sm text-slate-600 mt-1">{service.duration} session</p>
                </div>

                <Link
                  href={`/booking/${service.slug}`}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-forest-500 px-8 py-4 text-white text-base font-semibold shadow-lg shadow-forest-500/10 transition hover:bg-forest-600 mb-4"
                >
                  Book This Service
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button className="w-full flex items-center justify-center gap-2 rounded-full border border-cream-200 bg-white px-8 py-4 text-slate-900 text-base font-semibold transition hover:bg-cream-100">
                  <MessageCircle className="w-4 h-4" />
                  Have Questions?
                </button>

                <div className="mt-8 p-4 rounded-2xl bg-cream-50 text-center">
                  <p className="text-sm text-slate-700">
                    <strong>30-day satisfaction guarantee</strong>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Not satisfied? Full refund within 30 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-700 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg text-white/80 mb-8">
            Book your {service.name.toLowerCase()} session today and take the next step forward.
          </p>
          <Link
            href={`/booking/${service.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-8 py-4 text-slate-900 font-semibold transition hover:bg-gold-300"
          >
            Secure Your Spot
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
