import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import OverviewTab from './components/tabs/OverviewTab'
import FinancialsTab from './components/tabs/FinancialsTab'
import OperationsTab from './components/tabs/OperationsTab'
import ValuationTab from './components/tabs/ValuationTab'
import { useDentsightStore } from './store/useDentsightStore'
import mockData from './data/mockData'

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'operations' | 'valuation'>('overview')
  const setMetrics = useDentsightStore(state => state.setMetrics)
  
  // Load mock data on mount (in production, this would come from API)
  useState(() => {
    if (mockData && Object.keys(mockData).length > 0) {
      setMetrics(mockData)
    }
  })

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'financials':
        return <FinancialsTab />
      case 'operations':
        return <OperationsTab />
      case 'valuation':
        return <ValuationTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTab()}
      </AppLayout>
    </div>
  )
}

export default App
