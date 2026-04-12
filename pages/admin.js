import Head from "next/head";
import { useState } from "react";
import toast from "react-hot-toast";
import { Lock, CalendarDays, CheckCircle2, DollarSign, Clock, Inbox, X, Send } from "lucide-react";

export async function getServerSideProps() {
  try {
    const { default: sql } = await import("../lib/db");
    const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return { props: { initialBookings: bookings } };
  } catch {
    return { props: { initialBookings: [] } };
  }
}

const STATUS_STYLES = {
  confirmed: "bg-gold-100 text-gold-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-blue-100 text-blue-700",
};

export default function Admin({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const unlock = () => {
    if (adminKey === "admin123") {
      setUnlocked(true);
    } else {
      toast.error("Incorrect admin key");
    }
  };

  const formatDate = (d) => {
    if (!d) return "–";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
        if (selected?.id === id) setSelected({ ...selected, status });
        toast.success(`Status updated to ${status}`);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const sendMeetingInvite = async () => {
    if (!meetingLink.trim()) {
      toast.error("Please enter a meeting link.");
      return;
    }
    setSendingInvite(true);
    try {
      const res = await fetch("/api/send-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selected.id,
          meetingLink: meetingLink.trim(),
          adminNote: adminNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Meeting invite sent to ${selected.customer?.email}`);
        setMeetingLink("");
        setAdminNote("");
      } else {
        toast.error(data.error || "Failed to send invite.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = !search || [b.customer?.name, b.customer?.email, b.service?.name, b.id].some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue: bookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + (b.service?.price || 0), 0),
    today: bookings.filter((b) => b.createdAt && new Date(b.createdAt).toDateString() === new Date().toDateString()).length,
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center pt-20">
        <div className="bg-white rounded-2xl border border-cream-200 p-10 max-w-sm w-full mx-4 text-center shadow-lg">
          <div className="text-4xl mb-4">
            <Lock className="w-10 h-10 mx-auto text-slate-850" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-850 mb-2">Admin Access</h1>
          <p className="text-slate-850/50 text-sm mb-6">Enter the admin key to access the dashboard</p>
          <input
            type="password"
            placeholder="Admin key (default: admin123)"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-forest-400 outline-none text-sm mb-4 bg-cream-50"
          />
          <button
            onClick={unlock}
            className="w-full py-3 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-semibold transition-all"
          >
            Enter Dashboard
          </button>
          <p className="text-xs text-slate-850/30 mt-3">Use the admin key provided by your team</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel – Career Decipher</title>
      </Head>

      <div className="min-h-screen bg-cream-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-850">Admin Dashboard</h1>
              <p className="text-slate-850/50 text-sm mt-1">Manage all bookings and appointments</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: stats.total, icon: <CalendarDays className="w-6 h-6" /> },
              { label: "Confirmed", value: stats.confirmed, icon: <CheckCircle2 className="w-6 h-6" /> },
              { label: "Total Revenue", value: `$${stats.revenue}`, icon: <DollarSign className="w-6 h-6" /> },
              { label: "Today", value: stats.today, icon: <Clock className="w-6 h-6" /> },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-cream-200 p-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-display text-2xl font-bold text-slate-850">{s.value}</div>
                <div className="text-xs text-slate-850/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Table */}
            <div className="flex-1 bg-white rounded-2xl border border-cream-200 overflow-hidden">
              {/* Filters */}
              <div className="p-5 border-b border-cream-200 flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search name, email, service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-48 px-4 py-2 rounded-lg border border-cream-200 text-sm focus:border-forest-400 outline-none bg-cream-50"
                />
                <div className="flex gap-1">
                  {["all", "confirmed", "pending", "completed", "cancelled"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        filter === f ? "bg-forest-500 text-white" : "bg-cream-100 text-slate-850/60 hover:bg-cream-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings list */}
              <div className="divide-y divide-cream-200">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-slate-850/40">
                    <div className="text-4xl mb-3">
                      <Inbox className="w-10 h-10 mx-auto" />
                    </div>
                    <p>No bookings found</p>
                  </div>
                ) : (
                  filtered.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => { setSelected(b); setMeetingLink(""); setAdminNote(""); }}
                      className={`p-5 cursor-pointer hover:bg-cream-50 transition-colors ${selected?.id === b.id ? "bg-forest-500/5 border-l-2 border-forest-500" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-forest-500/10 rounded-full flex items-center justify-center text-xs font-bold text-forest-600 shrink-0">
                            {b.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-850 text-sm truncate">{b.customer?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-850/50 truncate">{b.customer?.email}</p>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right shrink-0">
                          <p className="text-xs font-medium text-slate-850">{b.service?.name}</p>
                          <p className="text-xs text-slate-850/50">{formatDate(b.date)} {b.time && `· ${b.time}`}</p>
                        </div>
                        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                          {b.status || "pending"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="w-full md:w-80 bg-white rounded-2xl border border-cream-200 p-6 h-fit sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-slate-850">Booking Details</h3>
                  <button onClick={() => setSelected(null)} className="text-slate-850/40 hover:text-slate-850 text-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  {[
                    ["ID", `#${selected.id?.slice(0, 8).toUpperCase()}`],
                    ["Name", selected.customer?.name],
                    ["Email", selected.customer?.email],
                    ["Phone", selected.customer?.phone || "–"],
                    ["Service", selected.service?.name],
                    ["Duration", selected.service?.duration],
                    ["Price", selected.service?.price ? `$${selected.service.price}` : "Custom"],
                    ["Date", formatDate(selected.date)],
                    ["Time", selected.time || "–"],
                    ["Booked On", formatDate(selected.createdAt)],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-slate-850/50 shrink-0">{label}</span>
                      <span className="font-medium text-slate-850 text-right truncate">{val}</span>
                    </div>
                  ))}
                </div>

                {selected.customer?.details && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-850/50 uppercase tracking-wide mb-2">Client Notes</p>
                    <p className="text-sm text-slate-850/70 bg-cream-50 rounded-xl p-3 leading-relaxed">{selected.customer.details}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-850/50 uppercase tracking-wide mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["confirmed", "pending", "completed", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                          selected.status === s ? "bg-forest-500 text-white" : "bg-cream-100 text-slate-850/60 hover:bg-cream-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meeting Invite */}
                <div className="mt-6 pt-6 border-t border-cream-200">
                  <p className="text-xs font-semibold text-slate-850/50 uppercase tracking-wide mb-3">Send Meeting Invite</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-850/60 mb-1 block">Meeting Link <span className="text-red-400">*</span></label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-cream-200 text-xs focus:border-forest-400 outline-none bg-cream-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-850/60 mb-1 block">Note to client <span className="text-slate-850/30">(optional)</span></label>
                      <textarea
                        placeholder="e.g. Please come prepared with your latest CV..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-cream-200 text-xs focus:border-forest-400 outline-none bg-cream-50 resize-none"
                      />
                    </div>
                    <button
                      onClick={sendMeetingInvite}
                      disabled={sendingInvite || !meetingLink.trim()}
                      className="w-full py-2.5 bg-forest-500 hover:bg-forest-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sendingInvite ? "Sending…" : "Send Meeting Invite"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}