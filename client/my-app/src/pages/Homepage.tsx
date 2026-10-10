import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="font-plex bg-slate-50 dark:bg-ink min-h-screen">
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
