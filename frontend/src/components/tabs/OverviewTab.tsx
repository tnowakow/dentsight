import React from 'react';
import { mockData } from '../../data/mockData';
import { AlertCard } from '../ui/AlertCard';
import { BenchmarkIndicator } from '../ui/BenchmarkIndicator';

export const OverviewTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Active Alerts Panel */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h2>
        <div className="flex flex-col gap-3">
          {mockData.alerts.map(alert => (
            <AlertCard 
              key={alert.id} 
              type={alert.type} 
              headline={alert.headline} 
              subtext={alert.subtext} 
              severity={alert.severity} 
            />
          ))}
        </div>
      </section>

      {/* 2. Practice Health Score Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-slate-400 font-medium uppercase text-xs tracking-widest">Health Score</h3>
          <div className="relative flex items-center justify-center">
            {/* Simple CSS Gauge approximation */}
            <div className="w-32 h-32 rounded-full border-[12px] border-slate-800 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 border-[12px] border-blue-500 rounded-full" style={{ clipPath: 'inset(0 0 50% 0)' }} />
               <span className="text-4xl font-bold">{mockData.healthScore}</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">Overall practice stability is <span className="text-emerald-500 font-semibold">High</span></p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Net Collection Rate', value: '94%', trend: 'up' as const, target: '92%' },
            { label: 'Hygiene Re-appointment', value: '78%', trend: 'down' as const, target: '85%' },
            { label: 'Denial Rate', value: '5.4%', trend: 'stable' as const, target: '5%' },
            { label: 'Case Acceptance', value: '72%', trend: 'up' as const, target: '70%' },
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{kpi.value}</span>
              </div>
              <BenchmarkIndicator 
                current={kpi.value} 
                target={kpi.target} 
                trend={kpi.trend} 
              />
            </div>
          ))}
        </div>
      </</strong>
      </section>

      {/* 3. Valuation Preview & Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white space-y-4 shadow-xl shadow-blue-900/20">
            <h3 className="text-blue-100 font-medium uppercase text-xs tracking-widest">Valuation Range Preview</h3>
            <div className="text-4xl font-bold">{mockData.valuationPreview}</div>
            <button className="text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold backdrop-blur-md">
              View Detailed Valuation
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Monthly Prod.', value: `$${mockData.quickStats.monthlyProduction.toLocaleString()}`, icon: '💰' },
              { label: 'Unscheduled', value: `$${mockData.quickStats.unscheduledTreatmentValue.toLocaleString()}`, icon: '⏳' },
              { label: 'No-Show Rate', value: `${mockData.quickStats.noShowRate}%`, icon: '❌' },
              { label: 'Case Acceptance', value: `${mockData.quickStats.caseAcceptance}%`, icon: '✅' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center space-y-1">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};
