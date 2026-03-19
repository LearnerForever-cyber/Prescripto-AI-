import React from 'react';
import { 
  ShieldCheck, Zap, ArrowRight, CheckCircle2, 
  Upload, FileText, Lock, AlertCircle, 
  Heart, ShieldAlert, Activity, IndianRupee
} from 'lucide-react';
import { CREDIT_PACKS } from '../constants';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-[#0f2a43]">
      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#00a3e0] text-[10px] font-bold uppercase tracking-widest mb-8">
                <Zap className="w-3 h-3" />
                <span>AI-Powered Clarity</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold text-[#0f2a43] leading-[1.1] tracking-tight mb-8">
                Understanding Your Prescription <br/>
                <span className="text-slate-400">—</span> <span className="text-[#00a3e0]">Simplified.</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg">
                Clear breakdowns of medicines, charges, and critical information in seconds. No more medical jargon or confusing bills.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => window.location.hash = '#signup'}
                  className="px-8 py-4 bg-[#0f2a43] text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center group"
                >
                  Start Analyzing
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="mt-16 lg:mt-0 relative">
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#dcfce7] rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0f2a43]">Analysis Complete</h4>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">Prescription-ID: #88219</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-14 h-14">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-[#00a3e0]" strokeWidth="3" strokeDasharray="99.4, 100" strokeLinecap="round" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <text x="18" y="20.35" className="text-[8px] font-bold fill-[#0f2a43]" textAnchor="middle">99.4%</text>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Confidence Score</p>
                      <p className="text-[10px] font-bold text-[#00a3e0]">High Accuracy</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-6 mb-4 border border-slate-100">
                  <div className="flex items-center space-x-2 text-[#00a3e0] text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Activity className="w-3 h-3" />
                    <span>Medication</span>
                  </div>
                  <h5 className="text-lg font-bold text-[#0f2a43] mb-1">Amoxicillin 500mg</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">Common antibiotic used to treat bacterial infections. Take with food.</p>
                </div>

                <div className="bg-[#fffbeb] rounded-2xl p-6 border border-[#fef3c7]">
                  <div className="flex items-center space-x-2 text-[#d97706] text-[10px] font-bold uppercase tracking-widest mb-3">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Critical Warning</span>
                  </div>
                  <p className="text-xs text-[#92400e] font-semibold leading-relaxed">Complete the full course even if you feel better. Avoid alcohol during treatment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Struggles Section */}
      <section id="struggles" className="py-32 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-[#0f2a43] mb-4">Healthcare shouldn't be a puzzle.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Patients face significant hurdles when trying to manage their own health data.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Messy Handwriting", desc: "Deciphering a doctor's handwriting is often impossible for patients." },
              { title: "Complex Jargon", desc: "Medical terms are designed for doctors, leaving patients in the dark." },
              { title: "Hidden Costs", desc: "Hospital bills are often a black box of unexplained charges." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
                <h4 className="text-xl font-bold text-[#0f2a43] mb-4">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" 
                  alt="Health Insights" 
                  className="w-full h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-8 left-8 right-8 bg-[#f1f5f9]/95 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl">
                <p className="text-[#00a3e0] text-[10px] font-bold uppercase tracking-widest mb-4">Real-time Insights</p>
                <p className="text-[#0f2a43] font-medium leading-relaxed italic">
                  "I finally understood why I was prescribed three different pills and what each one was doing for my recovery."
                </p>
              </div>
            </div>

            <div className="mt-16 lg:mt-0">
              <h2 className="text-4xl font-extrabold text-[#0f2a43] mb-8 leading-tight">Your health data, decoded.</h2>
              <p className="text-lg text-slate-500 mb-12 leading-relaxed">
                Prescription AI uses advanced medical-grade language models to translate clinical data into patient-first knowledge.
              </p>
              <ul className="space-y-8">
                {[
                  { title: "Readable Prescriptions", desc: "From messy handwriting to a clean digital dashboard." },
                  { title: "Understand Your Medicine", desc: "Plain-English explanations of usage & side effects." },
                  { title: "Highlighted Warnings", desc: "Critical safety info brought to the forefront." },
                  { title: "Know Your Costs", desc: "Clear breakdown of every charge." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-4">
                    <div className="mt-1 w-5 h-5 rounded-full border border-[#00a3e0] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[#00a3e0]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f2a43] mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-[#0f2a43] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-6">Three steps to clarity.</h2>
          <p className="text-slate-400 mb-20 max-w-2xl mx-auto">We've made the process as simple as taking a photo. No medical degree required.</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0">
            {[
              { icon: Upload, title: "Upload", desc: "Take a photo or upload a PDF of your prescription." },
              { icon: Zap, title: "Analyze", desc: "Our secure AI extracts data and cross-references medical databases." },
              { icon: FileText, title: "Understand", desc: "View your structured report with warnings and costs." }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center max-w-[280px]">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <step.icon className="w-8 h-8 text-[#00a3e0]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00a3e0] rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-[#0f2a43]">
                      0{i + 1}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex items-center px-12">
                    <ArrowRight className="w-6 h-6 text-slate-700" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f8fafc] rounded-[3rem] p-12 md:p-20 border border-slate-100">
            <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] text-[10px] font-bold uppercase tracking-widest mb-8">
                  <Lock className="w-3 h-3" />
                  <span>Privacy First</span>
                </div>
                <h2 className="text-4xl font-extrabold text-[#0f2a43] mb-8 leading-tight">Your data is safe and secure.</h2>
                <p className="text-lg text-slate-500 mb-12 leading-relaxed">
                  We use enterprise-grade encryption and HIPAA-compliant practices to ensure your medical information remains private. We never sell your data to third parties.
                </p>
                
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-start space-x-4">
                  <div className="mt-1 w-10 h-10 bg-[#e0f2fe] rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-[#00a3e0]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f2a43] mb-2">Important Disclaimer</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Prescription AI provides informational clarity only and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 lg:mt-0 grid grid-cols-2 gap-4">
                {[
                  { icon: Lock, title: "Data Encrypted" },
                  { icon: AlertCircle, title: "No Diagnosis" },
                  { icon: Heart, title: "Patient Focused" },
                  { icon: ShieldCheck, title: "Secure Storage" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <item.icon className="w-6 h-6 text-[#00a3e0] mb-4" />
                    <h4 className="text-sm font-bold text-[#0f2a43]">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-[#0f2a43] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Buy credits and use them whenever you need. No monthly subscriptions, no hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`relative bg-white p-10 rounded-[3rem] border transition-all flex flex-col ${
                  pack.id === 'popular' ? "border-[#00a3e0] shadow-2xl scale-105 z-10" : "border-slate-100 shadow-sm"
                }`}
              >
                {pack.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00a3e0] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {pack.badge}
                  </div>
                )}
                
                <div className="text-center mb-10">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{pack.label}</p>
                  <h3 className="text-2xl font-bold text-[#0f2a43] mb-6">{pack.name}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <IndianRupee className="w-6 h-6 text-[#0f2a43]" />
                    <span className="text-5xl font-black text-[#0f2a43]">{pack.price}</span>
                  </div>
                  <p className="text-[#00a3e0] font-bold text-sm">{pack.credits} Credits</p>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Usage Estimate</p>
                    <p className="text-sm font-bold text-[#0f2a43]">
                      ≈ {pack.credits} Basic Scans <br />
                      <span className="text-slate-300 font-normal">OR</span> {Math.floor(pack.credits / 3)} Pro Insights
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {['Instant AI Analysis', 'Generic Medicine Finder', 'Cost Benchmarking'].map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => window.location.hash = '#signup'}
                  className={`w-full py-4 rounded-2xl font-bold transition-all text-sm ${
                    pack.id === 'popular' 
                      ? "bg-[#00a3e0] text-white hover:bg-[#0092c9] shadow-lg shadow-[#00a3e0]/20" 
                      : "bg-slate-100 text-[#0f2a43] hover:bg-slate-200"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="join" className="py-32 bg-[#00a3e0] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold mb-8">Make healthcare understandable.</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Take control of your medical information today. Join us and start simplifying your prescriptions and bills.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.hash = '#signup'}
              className="px-12 py-5 bg-[#0f2a43] text-white rounded-full font-bold text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-black/20 flex items-center group"
            >
              Join Us Now
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
