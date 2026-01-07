import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingHomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero - Full screen landing */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-900 via-royal-800 to-teal-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coral-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 pt-16">
          <span className="inline-block bg-gold-500/20 text-gold-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
            Limited Time Offer
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Your
            <br />
            <span className="text-gold-400">Business Today</span>
          </h1>
          
          <p className="text-xl text-royal-100 max-w-2xl mx-auto mb-10">
            Get exclusive access to our premium business acceleration program 
            with special launch pricing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="inline-flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-coral-500/30">
              Claim Your Spot
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-royal-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Expert Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for more landing content */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <p className="text-slate-500">
            Additional landing page sections will be added here.
          </p>
        </div>
      </section>
    </div>
  );
}
