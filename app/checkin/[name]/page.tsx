"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function CheckInForm() {
  const params = useParams();
  const clientName = decodeURIComponent(params.name as string);

  const [form, setForm] = useState({
    "Current Weight": "",
    Feeling: "5",
    "Biggest Win": "",
    "Biggest Struggle": "",
    "Hit Protein Daily": "Yes",
    "Step Days": "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "Client Name": clientName,
          ...form,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-riven-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Check-In Submitted!</h2>
          <p className="text-riven-muted">
            Thanks {clientName}, your check-in has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-riven-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-riven-gold">RIVEN</span> Check-In
          </h1>
          <p className="text-riven-muted mt-2">
            Welcome back, <span className="text-white font-medium">{clientName}</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-riven-card border border-riven-border rounded-xl p-6 space-y-6"
        >
          <div>
            <label className="block text-sm text-riven-muted mb-2">
              Current Weight (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={form["Current Weight"]}
              onChange={(e) =>
                setForm({ ...form, "Current Weight": e.target.value })
              }
              className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none"
              placeholder="e.g. 185.5"
            />
          </div>

          <div>
            <label className="block text-sm text-riven-muted mb-2">
              How are you feeling? ({form.Feeling}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={form.Feeling}
              onChange={(e) => setForm({ ...form, Feeling: e.target.value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-riven-muted mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-riven-muted mb-2">
              Biggest Win This Week
            </label>
            <textarea
              required
              value={form["Biggest Win"]}
              onChange={(e) =>
                setForm({ ...form, "Biggest Win": e.target.value })
              }
              className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none resize-none h-20"
              placeholder="What went well this week?"
            />
          </div>

          <div>
            <label className="block text-sm text-riven-muted mb-2">
              Biggest Struggle This Week
            </label>
            <textarea
              required
              value={form["Biggest Struggle"]}
              onChange={(e) =>
                setForm({ ...form, "Biggest Struggle": e.target.value })
              }
              className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none resize-none h-20"
              placeholder="What was challenging?"
            />
          </div>

          <div>
            <label className="block text-sm text-riven-muted mb-2">
              Did you hit your protein goal daily?
            </label>
            <div className="flex gap-3">
              {["Yes", "No"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, "Hit Protein Daily": opt })
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition ${
                    form["Hit Protein Daily"] === opt
                      ? "bg-riven-gold text-black"
                      : "bg-riven-bg border border-riven-border text-riven-muted hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-riven-muted mb-2">
              How many days did you hit your step goal? (0-7)
            </label>
            <input
              type="number"
              min="0"
              max="7"
              required
              value={form["Step Days"]}
              onChange={(e) =>
                setForm({ ...form, "Step Days": e.target.value })
              }
              className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none"
              placeholder="0-7"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-riven-gold text-black font-bold text-lg rounded-xl hover:bg-riven-gold-light transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Check-In"}
          </button>
        </form>
      </div>
    </div>
  );
}
