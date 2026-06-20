import Link from "next/link";
import {
  Compass,
  FileText,
  FileCheck,
  Mail,
  Target,
  Link2,
  Leaf,
  Package,
  Circle,
  Check,
} from "lucide-react";

const ICON_MAP = {
  Compass,
  FileText,
  FileCheck,
  Mail,
  Target,
  Link2,
  Leaf,
  Package,
};

export default function ServiceCard({ service, compact = false }) {
  const Icon = ICON_MAP[service.icon] || Circle;

  return (
    <div
      className={`relative bg-white rounded-2xl border border-cream-200 hover:border-forest-400 hover:shadow-xl transition-all duration-300 group overflow-hidden ${
        compact ? "p-6" : "p-8"
      } ${service.popular ? "ring-2 ring-forest-500" : ""}`}
    >
      {service.popular && (
        <div className="absolute top-4 right-4 bg-forest-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Popular
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center text-forest-500 shrink-0 group-hover:bg-forest-500/10 transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-display font-semibold text-slate-850 leading-snug ${compact ? "text-lg" : "text-xl"}`}>
            {service.name}
          </h3>
          <span className="text-xs text-forest-500 font-medium bg-forest-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
            {service.duration}
          </span>
        </div>
      </div>

      <p className="text-slate-850/70 text-sm leading-relaxed mb-5">
        {compact ? service.shortDesc : service.description}
      </p>

      {!compact && service.highlights && (
        <ul className="space-y-2 mb-6">
          {service.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-sm text-slate-850/80">
              <span className="w-4 h-4 bg-forest-500/15 rounded-full flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-forest-600" />
              </span>
              {h}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div>
          {service.price ? (
            <div>
              <span className="text-2xl font-display font-bold text-forest-600">${service.price}</span>
              <span className="text-slate-850/50 text-xs ml-1">/ session</span>
            </div>
          ) : (
            <span className="text-forest-600 font-semibold text-sm">Custom pricing</span>
          )}
        </div>
        <Link
          href={`/booking/${service.id}`}
          className="px-5 py-2.5 bg-forest-500 hover:bg-forest-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
