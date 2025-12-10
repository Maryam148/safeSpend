import { useState } from 'react'
import Navbar from './components/navbar'
import './index.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './home';
import ZakatCalculator from './pages/zakat';
import LeasingCalculator from './pages/leasing';
import ProfitSharingCalculator from './pages/profit_sharing_mudarabah';
import MurabahaCalculator from './pages/murabaha';
import IstisnaCalculator from './pages/istisna';
import TakafulEstimator from './pages/takaful';
import QardHasanPlanner from './pages/qarzehasan';
import BusinessPartnershipSplitCalculator from './pages/bPartnership';
import IslamicPensionPlanner from './pages/islPension';
import Documentation from './pages/docs';
import Auth from './pages/login';
import { useAuth } from './authContext';
import HistoryPanel from './components/historyPanel';
import ChatBot from './components/chatbot';


function App() {
  const { user } = useAuth();
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  
  return (
    <>
      {/* Navbar shown to everyone */}
      <Navbar onHistoryOpen={() => setHistoryOpen(true)} />
      <hr className='mx-10 mt-2 mb-5' />
      
      <Routes>
        {/* Public routes - accessible to everyone */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/zakat" element={<ZakatCalculator />} />
        <Route path="/leasing" element={<LeasingCalculator />} />
        <Route path="/profit-sharing" element={<ProfitSharingCalculator />} />
        <Route path="/murabaha" element={<MurabahaCalculator />} />
        <Route path="/istisna" element={<IstisnaCalculator />} />
        <Route path="/takaful" element={<TakafulEstimator />} />
        <Route path="/qard-hasan" element={<QardHasanPlanner />} />
        <Route path="/partnership" element={<BusinessPartnershipSplitCalculator />} />
        <Route path="/pension" element={<IslamicPensionPlanner />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Auth />} />
      </Routes>
      
      {/* History panel and ChatBot only for logged-in users */}
      {user && (
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setHistoryOpen(false)}
          userId={user?.id}
        />
      )}
      
      {/* ChatBot available for everyone */}
      <div className="fixed bottom-4 right-4 z-50">
        <ChatBot />
      </div>
    </>
  )
}

export default App
