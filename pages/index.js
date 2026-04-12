import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, Target, Zap, Globe2, Handshake, Check } from "lucide-react";
import { services } from "../data/services";
import ServiceCard from "../components/ServiceCard";

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.15, ...options });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

const stats = [
  { value: "500+", label: "Clients Helped" },
  { value: "93%", label: "Job Placement Rate" },
  { value: "4.9", label: "Average Rating" },
  { value: "8 yrs", label: "Experience" },
];

const benefits = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Personalized Strategy",
    desc: "No templates. Every session is tailored specifically to your career goals, industry, and unique background.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast, Actionable Feedback",
    desc: "Walk away with clear next steps — not vague advice. Every session gives you tools you can use immediately.",
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    title: "Global Expertise",
    desc: "We've helped professionals across tech, finance, healthcare, and creative industries land roles worldwide.",
  },
  {
    icon: <Handshake className="w-6 h-6" />,
    title: "Ongoing Support",
    desc: "Your journey doesn't end at the session. We're here for follow-ups, questions, and celebrating your wins.",
  },
];

const testimonials = [
  {
    quote: "I went from feeling completely lost to landing my dream role in just 6 weeks. The resume review alone was worth every penny.",
    name: "Amara K.",
    role: "Product Manager @ Fintech Startup",
    avatar: "AK",
  },
  {
    quote: "The interview prep was game-changing. I walked into that final round calm, prepared, and confident. Got the offer!",
    name: "James T.",
    role: "Software Engineer @ Big Tech",
    avatar: "JT",
  },
  {
    quote: "My LinkedIn views went up 400% after the optimization session. Recruiters started reaching out within days.",
    name: "Fatima O.",
    role: "Data Analyst @ Consulting Firm",
    avatar: "FO",
  },
];

export default function Home() {
  const [heroRef, heroIn] = useInView();
  const [statsRef, statsIn] = useInView();
  const [benefitsRef, benefitsIn] = useInView();
  const [servicesRef, servicesIn] = useInView();
  const [testimonialsRef, testimonialsIn] = useInView();

  return (
    <>
      <Head>
        <title>Career Decipher – Find Your Path Forward</title>
        <meta name="description" content="Professional career consulting services including resume review, interview prep, and career coaching." />
      </Head>

      {/* HERO */}
      <section className="min-h-screen bg-cream-50 relative overflow-hidden flex items-center pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-forest-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-400/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-forest-400 rounded-full animate-float opacity-40" />
            <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-gold-400 rounded-full animate-float opacity-30" style={{animationDelay: '2s'}} />
            <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-forest-500 rounded-full animate-float opacity-50" style={{animationDelay: '4s'}} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center relative" ref={heroRef}>
          <div>
            <div className={`inline-flex items-center gap-2 bg-forest-500/10 text-forest-600 text-sm font-medium px-4 py-2 rounded-full mb-6 transition-all duration-700 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="w-2 h-2 bg-forest-500 rounded-full animate-pulse" />
              Trusted by 500+ Professionals
            </div>
            <h1 className={`font-display text-5xl md:text-6xl font-bold text-slate-850 leading-tight mb-6 transition-all duration-700 delay-100 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Feeling Stuck in Your Career?{" "}
              <span className="text-forest-500 italic">Let's Find Your Path Forward!</span>
            </h1>
            <p className={`text-slate-850/65 text-lg leading-relaxed mb-8 max-w-lg transition-all duration-700 delay-200 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Expert career coaching, resume reviews, interview prep and more — all personalized to get you from where you are to where you want to be.
            </p>
            <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Link href="/book" className="px-8 py-4 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                Book a Free Discovery Call
              </Link>
              <Link href="/services" className="px-8 py-4 bg-white hover:bg-cream-100 text-slate-850 rounded-xl font-semibold text-base border border-cream-200 transition-all duration-200 hover:shadow-md">
                Explore Services →
              </Link>
            </div>
          </div>

          {/* Hero illustration card */}
          <div className={`hidden md:block transition-all duration-1000 delay-400 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-cream-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 overflow-hidden rounded-2xl">
                    <img
                      src="/career-decipher-logo.svg"
                      alt="Career Decipher logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-850 text-sm">Career Decipher</p>
                    <p className="text-xs text-forest-500">Session in Progress</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-gold-600 font-medium">
                    <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {["Define your 90-day career goal", "Identify skill gaps", "Polish your resume", "Prep for interviews"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < 2 ? 'bg-forest-500 text-white' : 'bg-cream-200 text-slate-850/50'}`}>
                        {i < 2 ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-sm ${i < 2 ? 'text-slate-850 font-medium line-through opacity-60' : 'text-slate-850'}`}>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-forest-500/8 rounded-xl p-4">
                  <p className="text-xs text-forest-600 font-semibold mb-1">Progress to Goal</p>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-forest-500 rounded-full" />
                  </div>
                  <p className="text-xs text-forest-600 mt-1 text-right font-medium">50% Complete</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-gold-400 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg animate-float flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Job Offer Received!
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-slate-850 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg border border-cream-200 animate-float" style={{animationDelay: '3s'}}>
                <Star className="w-4 h-4 inline-block mr-1" />5.0 Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-forest-700 py-12" ref={statsRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`transition-all duration-500 ${statsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="font-display text-4xl font-bold text-white mb-1 flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.label === "Average Rating" && <Star className="w-5 h-5 text-gold-400" />}
                </div>
                <div className="text-forest-400/80 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24 bg-cream-50" ref={benefitsRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${benefitsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-forest-500 text-sm font-semibold uppercase tracking-widest">Why Career Decipher</span>
            <h2 className="font-display text-4xl font-bold text-slate-850 mt-2">
              Career clarity, backed by expertise
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className={`p-6 bg-white rounded-2xl border border-cream-200 hover:shadow-lg hover:border-forest-300 transition-all duration-300 group ${benefitsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">{b.icon}</div>
                <h3 className="font-semibold text-slate-850 mb-2">{b.title}</h3>
                <p className="text-slate-850/60 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 bg-cream-100" ref={servicesRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${servicesIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-forest-500 text-sm font-semibold uppercase tracking-widest">Services</span>
            <h2 className="font-display text-4xl font-bold text-slate-850 mt-2">
              Everything you need to get hired
            </h2>
            <p className="text-slate-850/60 mt-3 max-w-xl mx-auto">
              From first draft to final offer — we've got every stage of your job search covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.slice(0, 6).map((service, i) => (
              <div
                key={service.id}
                className={`transition-all duration-500 ${servicesIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <ServiceCard service={service} compact />
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/services" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-forest-500 text-forest-600 rounded-xl font-semibold hover:bg-forest-500 hover:text-white transition-all duration-200">
              View All Services & Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-cream-50" ref={testimonialsRef}>
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${testimonialsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-forest-500 text-sm font-semibold uppercase tracking-widest">Success Stories</span>
            <h2 className="font-display text-4xl font-bold text-slate-850 mt-2">
              Real results, real people
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white rounded-2xl p-8 border border-cream-200 hover:shadow-lg transition-all duration-500 ${testimonialsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-gold-400" />
                  ))}
                </div>
                <p className="text-slate-850/75 italic leading-relaxed mb-6 text-sm">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-850 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-850/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-forest-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-forest-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Your career breakthrough is one session away. Book today and start your journey forward.
          </p>
          <Link href="/book" className="inline-flex items-center gap-2 px-10 py-4 bg-gold-400 hover:bg-gold-500 text-white rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
            Book Your Session Now →
          </Link>
          <p className="text-white/40 text-sm mt-4">30-day satisfaction guarantee • Secure payment</p>
        </div>
      </section>
    </>
  );
}
