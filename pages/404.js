import Head from "next/head";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found – Hanot Hub</title>
      </Head>
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-md">
          <div className="font-display text-9xl font-bold text-forest-500/20 leading-none mb-4">404</div>
          <h1 className="font-display text-3xl font-bold text-slate-850 mb-3">Page not found</h1>
          <p className="text-slate-850/60 mb-8">
            Looks like this page took a career detour. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-semibold transition-all">
              Go Home
            </Link>
            <Link href="/services" className="px-6 py-3 bg-cream-100 hover:bg-cream-200 text-slate-850 rounded-xl font-semibold transition-all border border-cream-200">
              Book a Session
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
