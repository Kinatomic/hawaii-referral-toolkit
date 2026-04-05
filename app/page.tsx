"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useIsAuthenticated } from "@/components/AuthProvider";
import { X, Eye, EyeOff, MapPin, TrendingUp, Mail, Users, ChevronRight, Loader2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { signIn, signUp, enterDemoMode } = useAuth();
  const { isAuthenticated, loading } = useIsAuthenticated();

  const [modal, setModal] = useState<"signin" | "signup" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 size={24} className="animate-spin text-[#C9A96E]" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const fn = modal === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setAuthLoading(false);
    if (error) { setAuthError(error); return; }
    router.replace("/dashboard");
  };

  const handleDemo = () => {
    enterDemoMode();
    router.replace("/dashboard");
  };

  const resetModal = (m: "signin" | "signup" | null) => {
    setModal(m);
    setAuthError("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-[#EDE8E0] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E2761, #2D3A8C)" }}>
            <span className="text-[10px] font-bold text-white">PIP</span>
          </div>
          <span className="font-semibold text-[#1A1615] tracking-tight">Pacific Island Partners</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => resetModal("signin")}
            className="text-sm font-medium text-[#5A534E] hover:text-[#1A1615] transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            onClick={() => resetModal("signup")}
            className="btn-primary text-sm px-5 py-2"
          >
            Get access
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#F5F3EF] border border-[#EDE8E0] rounded-full px-4 py-1.5 text-xs font-medium text-[#5A534E] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
          Hawaii's most exclusive referral network
        </div>

        <h1 className="text-5xl font-semibold text-[#1A1615] tracking-tight max-w-3xl leading-tight mb-6">
          The private intelligence platform for{" "}
          <span style={{ color: "#C9A96E" }}>Hawaii luxury</span>{" "}
          real estate
        </h1>

        <p className="text-lg text-[#5A534E] max-w-xl leading-relaxed mb-10">
          Monitor UHNW buying signals, craft hyper-personalized outreach, and manage your mainland brokerage referral network — all in one place.
        </p>

        <div className="flex items-center gap-3 mb-16">
          <button
            onClick={() => resetModal("signup")}
            className="btn-primary flex items-center gap-2 text-base px-7 py-3"
          >
            Request access <ChevronRight size={16} />
          </button>
          <button
            onClick={handleDemo}
            className="btn-outline text-base px-7 py-3"
          >
            View demo
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-5 max-w-3xl w-full text-left">
          {[
            {
              icon: TrendingUp,
              title: "Signal Intelligence",
              desc: "Monitor liquidity events, agent activity, $10M+ closings, and privacy-seeker patterns in real time.",
            },
            {
              icon: Mail,
              title: "Smart Outreach",
              desc: "8 trigger-based email templates personalized to each agent's market, recent deals, and social signals.",
            },
            {
              icon: Users,
              title: "Lead CRM",
              desc: "Centralized database of luxury agents with contact info, listing history, and signal-match scoring.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "#F5F3EF" }}
              >
                <Icon size={18} style={{ color: "#C9A96E" }} />
              </div>
              <h3 className="font-semibold text-[#1A1615] mb-2 text-sm">{title}</h3>
              <p className="text-sm text-[#5A534E] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EDE8E0] bg-white px-8 py-5 flex items-center justify-between text-xs text-[#9B958F]">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} style={{ color: "#C9A96E" }} />
          Island Sotheby's International Realty · Molokai &amp; Maui, Hawaii
        </div>
        <span>© 2026 Pacific Island Partners</span>
      </footer>

      {/* Auth Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => resetModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <button
              onClick={() => resetModal(null)}
              className="absolute top-4 right-4 text-[#9B958F] hover:text-[#1A1615] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E2761, #2D3A8C)" }}>
                <span className="text-xs font-bold text-white">PIP</span>
              </div>
              <h2 className="text-lg font-semibold text-[#1A1615]">
                {modal === "signin" ? "Sign in to your account" : "Create your account"}
              </h2>
              <p className="text-sm text-[#9B958F] mt-1">Pacific Island Partners</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="mark@islandsothebys.com"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B958F] hover:text-[#5A534E]"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {authLoading && <Loader2 size={14} className="animate-spin" />}
                {modal === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EDE8E0]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-[#9B958F]">or</span>
              </div>
            </div>

            <button
              onClick={handleDemo}
              className="btn-outline w-full text-sm py-2.5"
            >
              Continue in demo mode
            </button>

            <p className="text-center text-xs text-[#9B958F] mt-5">
              {modal === "signin" ? (
                <>No account?{" "}<button onClick={() => resetModal("signup")} className="text-[#C9A96E] hover:underline font-medium">Sign up</button></>
              ) : (
                <>Already have access?{" "}<button onClick={() => resetModal("signin")} className="text-[#C9A96E] hover:underline font-medium">Sign in</button></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
