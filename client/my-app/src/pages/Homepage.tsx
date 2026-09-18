import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen">
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
