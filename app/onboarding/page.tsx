"use client";

import { useState } from "react";

const FIELDS = [
  { key: "Full Name", type: "text", placeholder: "John Doe", required: true },
  {
    key: "Email",
    type: "email",
    placeholder: "john@email.com",
    required: true,
  },
  { key: "Phone", type: "tel", placeholder: "(555) 123-4567", required: true },
  { key: "Age", type: "number", placeholder: "30", required: true },
  {
    key: "Current Weight",
    type: "number",
    placeholder: "200",
    required: true,
  },
  { key: "Goal Weight", type: "number", placeholder: "180", required: true },
  { key: "Height", type: "text", placeholder: "5'10\"", required: true },
  {
    key: "Medical Conditions",
    type: "textarea",
    placeholder: "Any conditions, medications, or injuries we should know about",
    required: false,
  },
  {
    key: "Foods You Love",
    type: "textarea",
    placeholder: "List your favorite foods",
    required: true,
  },
  {
    key: "Foods You Hate",
    type: "textarea",
    placeholder: "List foods you can't stand",
    required: true,
  },
  {
    key: "Restaurants",
    type: "textarea",
    placeholder: "Where do you eat out most often?",
    required: false,
  },
  {
    key: "Cook or Eat Out",
    type: "select",
    options: ["Mostly Cook", "Mostly Eat Out", "50/50"],
    required: true,
  },
  {
    key: "Work Schedule",
    type: "text",
    placeholder: "e.g. Mon-Fri 9-5",
    required: true,
  },
  { key: "Wake Time", type: "time", placeholder: "", required: true },
  { key: "Bed Time", type: "time", placeholder: "", required: true },
];

export default function OnboardingPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to RIVEN!</h2>
          <p className="text-riven-muted">
            Your onboarding form has been submitted. We&apos;ll be in touch soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-riven-bg flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-riven-gold">RIVEN</span> Client Onboarding
          </h1>
          <p className="text-riven-muted mt-2">
            Tell us about yourself so we can build your custom plan
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-riven-card border border-riven-border rounded-xl p-6 md:p-8 space-y-6"
        >
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-riven-muted mb-2">
                {field.key}
                {field.required && (
                  <span className="text-riven-gold ml-1">*</span>
                )}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  value={form[field.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none resize-none h-20"
                  placeholder={field.placeholder}
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={form[field.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  value={form[field.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  className="w-full bg-riven-bg border border-riven-border rounded-lg px-4 py-3 text-white focus:border-riven-gold focus:outline-none"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-riven-gold text-black font-bold text-lg rounded-xl hover:bg-riven-gold-light transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Onboarding Form"}
          </button>
        </form>
      </div>
    </div>
  );
}
