import { useState } from 'react'
import Navbar from './components/navbar'
import './index.css'
import { Routes, Route } from 'react-router-dom';
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
import { Navigate } from 'react-router-dom';
import HistoryPanel from './components/historyPanel';
import ChatBot from './components/chatbot';


function App() {
  const { user } = useAuth();
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  return (
    <>
      
      {user && <Navbar onHistoryOpen={() => setHistoryOpen(true)} />}
      {user && <hr className='mx-10 mt-2 mb-5' />}
        <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Auth />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/zakat" element={user ? <ZakatCalculator /> : <Navigate to="/" />} />
        <Route path="/leasing" element={user ? <LeasingCalculator /> : <Navigate to="/" />} />
        <Route path="/profit-sharing" element={user ? <ProfitSharingCalculator /> : <Navigate to="/" />} />
        <Route path="/murabaha" element={user ? <MurabahaCalculator /> : <Navigate to="/" />} />
        <Route path="/istisna" element={user ? <IstisnaCalculator /> : <Navigate to="/" />} />
        <Route path="/takaful" element={user ? <TakafulEstimator /> : <Navigate to="/" />} />
        <Route path="/qard-hasan" element={user ? <QardHasanPlanner /> : <Navigate to="/" />} />
        <Route path="/partnership" element={user ? <BusinessPartnershipSplitCalculator /> : <Navigate to="/" />} />
        <Route path="/pension" element={user ? <IslamicPensionPlanner /> : <Navigate to="/" />} />
        <Route path="/docs" element={user ? <Documentation /> : <Navigate to="/" />} />
        </Routes>
      {user && (
        <>
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setHistoryOpen(false)}
          userId={user?.id}
        />
        <div className="fixed bottom-4 right-4 z-50">
            <ChatBot />
          </div>
        </>
      )}
    </>
  )
}

export default App
