import Hero from "../components/landing/Hero.js";
import Features from "../components/landing/Features.js";
import CTA from "../components/landing/CTA.js";

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
