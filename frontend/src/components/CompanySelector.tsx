import { useState, useEffect } from 'react';
import { ChevronDown, Target } from 'lucide-react';
import { useDentsightStore } from '../store/useDentsightStore';
import { fetchCompanies } from '../services/api';

export const CompanySelector = () => {
  const { companies, setCompanies, selectedCompanyId, setSelectedCompanyId, setIsLoadingCompanyData } = useDentsightStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(companies.length === 0);

  // Fetch companies on mount if not already loaded
  useEffect(() => {
    if (companies.length === 0) {
      loadCompanies();
    }
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
      // Set default selected company (first one)
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    if (companyId === selectedCompanyId) return;
    
    setDropdownOpen(false);
    setIsLoadingCompanyData(true);
    setSelectedCompanyId(companyId);
    
    // The dashboard will automatically refetch data via useEffect in App.tsx
    // when selectedCompanyId changes
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
      >
        <span className="text-sm text-slate-300">
          {selectedCompany?.name || 'Select Company'}
        </span>
        {selectedCompany?.isAcquisitionTarget && (
          <Target className="w-3.5 h-3.5 text-emerald-500" />
        )}
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-96 overflow-y-auto">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanySelect(company.id)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-group gap-2 group ${
                  selectedCompanyId === company.id
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="flex-1 truncate">{company.name}</span>
                
                {company.isAcquisitionTarget && (
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      Target
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" title="Potential Acquisition Target">
                      <Target className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                )}

                {selectedCompanyId === company.id && (
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
