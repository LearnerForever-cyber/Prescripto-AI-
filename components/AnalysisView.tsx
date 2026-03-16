
import React from 'react';
import { 
  Stethoscope, AlertCircle, ShieldCheck, ArrowRight, Printer, 
  CheckCircle2, Zap, TrendingDown, Building2, Landmark
} from 'lucide-react';
import { MedicalAnalysis, DocumentType } from '../types';

interface AnalysisViewProps {
  analysis: MedicalAnalysis;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  const getDocTypeColor = (type: string) => {
    switch(type) {
      case DocumentType.PRESCRIPTION: return 'bg-purple-50 text-purple-600 border border-purple-100';
      case DocumentType.HOSPITAL_BILL: return 'bg-amber-50 text-amber-600 border border-amber-100';
      case DocumentType.LAB_REPORT: return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      default: return 'bg-blue-50 text-blue-600 border border-blue-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Disclaimer */}
      <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center space-x-2 text-rose-600 text-xs font-semibold">
        <ShieldCheck className="w-4 h-4" />
        <span>Medical Disclaimer: Not a substitute for professional advice. Consult your doctor before changing medications.</span>
      </div>

      {/* Summary Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDocTypeColor(analysis.documentType)}`}>
              {analysis.documentType.replace('_', ' ')}
            </span>
            <div className="flex items-center text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#00a3e0] mr-1" />
              Price Guard Active
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Printer className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-[#0f2a43] mb-2">Analysis Summary</h2>
        <p className="text-slate-500 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* NEW: Generic Alternative Engine */}
      {analysis.genericAlternatives && analysis.genericAlternatives.length > 0 && (
        <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#00a3e0]" />
              <h3 className="text-lg font-bold text-[#0f2a43]">Generic Savings Available</h3>
            </div>
            <span className="text-xs font-bold text-[#00a3e0] bg-[#e0f2fe] px-2 py-1 rounded border border-[#00a3e0]/20">Potential Savings: Up to 80%</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {analysis.genericAlternatives.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-[#00a3e0]/30 transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-[#0f2a43]">{item.brandedName}</h4>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-[#00a3e0] font-bold">{item.genericName}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Suggested Generic Alternative (Jan Aushadhi)</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs line-through text-slate-400">{item.approxBrandedPrice}</p>
                    <p className="font-bold text-[#00a3e0]">{item.approxGenericPrice}</p>
                  </div>
                  <div className="bg-[#e0f2fe] text-[#00a3e0] px-3 py-1 rounded-full text-xs font-bold border border-[#00a3e0]/20">
                    Save {item.savingsPercentage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEW: Cost Benchmarking Chart */}
      {analysis.costInsights && (
        <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingDown className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-[#0f2a43]">Hospital Cost Benchmark</h3>
          </div>
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-[#0f2a43]">{analysis.costInsights.procedureName}</h4>
            <p className="text-sm text-slate-500">{analysis.costInsights.tierComparison}</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Sector</span>
                <span>Expected Range (Average)</span>
              </div>
              
              {/* Private Hospital Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Building2 className="w-4 h-4" />
                    <span>Private Hospital</span>
                  </div>
                  <span className="text-sm font-bold text-[#0f2a43]">{analysis.costInsights.expectedRange.privateLow} - {analysis.costInsights.expectedRange.privateHigh}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-3/4"></div>
                </div>
              </div>

              {/* Government Hospital Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Landmark className="w-4 h-4" />
                    <span>Government/CGHS</span>
                  </div>
                  <span className="text-sm font-bold text-[#0f2a43]">{analysis.costInsights.expectedRange.government}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a3e0] w-1/4"></div>
                </div>
              </div>
            </div>

            {analysis.costInsights.isOvercharged && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-600">High Cost Warning</p>
                  <p className="text-sm text-rose-600/80">The billed amount ({analysis.costInsights.billedAmount}) is above the typical private hospital range for this city. You may want to request a breakdown or check for billing errors.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Findings & Jargon sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Stethoscope className="w-5 h-5 text-[#00a3e0]" />
            <h3 className="text-lg font-bold text-[#0f2a43]">Decoded Jargon</h3>
          </div>
          <div className="space-y-4">
            {analysis.simplifiedTerms.map((term, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#00a3e0]/30 transition-all">
                <h4 className="font-bold text-[#0f2a43]">{term.jargon}</h4>
                <p className="text-sm text-slate-500 mt-1">{term.meaning}</p>
                <p className="text-xs text-[#00a3e0] mt-2 italic font-medium">Impact: {term.importance}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-[#0f2a43]">Critical Observations</h3>
          </div>
          <div className="space-y-4">
            {analysis.criticalFindings.map((finding, i) => (
              <div key={i} className="p-4 rounded-2xl border border-rose-100 bg-rose-50">
                <h4 className="font-bold text-rose-600">{finding.issue}</h4>
                <p className="text-sm text-rose-600/80 mt-1">{finding.description}</p>
                <div className="mt-2 text-xs font-bold text-rose-600 flex items-center">
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Action: {finding.action}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
