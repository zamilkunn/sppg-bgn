import React, { useState, useEffect } from 'react';
import { getDB, saveDB, getLocalDB } from './utils/db';

// Import Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import BukuKas from './components/BukuKas';
import LaporanBiaya from './components/LaporanBiaya';
import RealisasiAnggaran from './components/RealisasiAnggaran';
import LaporanPenggunaan from './components/LaporanPenggunaan';
import BiayaBahan from './components/BiayaBahan';
import KartuStok from './components/KartuStok';
import StokOpname from './components/StokOpname';
import SisaStok from './components/SisaStok';
import KontrolSuhu from './components/KontrolSuhu';
import Settings from './components/Settings';

export default function App() {
  // Offline-first initialization
  const [db, setDb] = useState(() => getLocalDB());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state
  
  // App routing/view state
  const [activeTab, setActiveTab] = useState('buku-kas');
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('sppg_authenticated') === 'true';
  });

  // Sync state changes back to database (Local storage and Cloud)
  const updateDBState = async (key, value) => {
    const updated = { ...db, [key]: value };
    setDb(updated);
    await saveDB(updated);
  };

  // Background Cloud Sync on mount
  useEffect(() => {
    const loadCloudData = async () => {
      setIsSyncing(true);
      const cloudData = await getDB();
      setDb(cloudData);
      setIsSyncing(false);
    };
    loadCloudData();
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  // Sync state changes across tabs
  useEffect(() => {
    const handleStorageUpdate = async () => {
      const updatedData = getLocalDB();
      setDb(updatedData);
    };
    window.addEventListener('sppg_db_update', handleStorageUpdate);
    return () => window.removeEventListener('sppg_db_update', handleStorageUpdate);
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('sppg_authenticated', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sppg_authenticated');
    setIsLoggedIn(false);
  };

  const handleImportDB = async (importedData) => {
    setDb(importedData);
    await saveDB(importedData);
  };

  // If not logged in, show Login gate
  if (!isLoggedIn) {
    return (
      <Login 
        credentials={db.credentials} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  // Active panel routing
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'buku-kas':
        return (
          <BukuKas 
            bukuKas={db.bukuKas} 
            setBukuKas={(val) => updateDBState('bukuKas', val)}
            profile={db.profile}
            budgets={db.budgets}
          />
        );
      case 'lap-biaya':
        return (
          <LaporanBiaya 
            bukuKas={db.bukuKas}
            profile={db.profile}
          />
        );
      case 'realisasi':
        return (
          <RealisasiAnggaran 
            bukuKas={db.bukuKas}
            budgets={db.budgets}
            profile={db.profile}
          />
        );
      case 'penggunaan':
        return (
          <LaporanPenggunaan 
            bukuKas={db.bukuKas}
            profile={db.profile}
          />
        );
      case 'biaya-bahan':
        return (
          <BiayaBahan 
            items={db.items}
            stockTransactions={db.stockTransactions}
            setStockTransactions={(val) => updateDBState('stockTransactions', val)}
            profile={db.profile}
          />
        );
      case 'kartu-stok':
        return (
          <KartuStok 
            items={db.items}
            stockTransactions={db.stockTransactions}
            setStockTransactions={(val) => updateDBState('stockTransactions', val)}
          />
        );
      case 'stok-opname':
        return (
          <StokOpname 
            items={db.items}
            stockTransactions={db.stockTransactions}
            setStockTransactions={(val) => updateDBState('stockTransactions', val)}
            stockOpname={db.stockOpname}
            setStockOpname={(val) => updateDBState('stockOpname', val)}
            profile={db.profile}
          />
        );
      case 'sisa-stok':
        return (
          <SisaStok 
            items={db.items}
            stockTransactions={db.stockTransactions}
            profile={db.profile}
          />
        );
      case 'kontrol-suhu':
        return (
          <KontrolSuhu 
            tempLogs={db.tempLogs}
            setTempLogs={(val) => updateDBState('tempLogs', val)}
            profile={db.profile}
          />
        );
      case 'setting':
        return (
          <Settings 
            profile={db.profile}
            setProfile={(val) => updateDBState('profile', val)}
            credentials={db.credentials}
            setCredentials={(val) => updateDBState('credentials', val)}
            budgets={db.budgets}
            setBudgets={(val) => updateDBState('budgets', val)}
            items={db.items}
            setItems={(val) => updateDBState('items', val)}
            fullDB={db}
            onImportDB={handleImportDB}
          />
        );
      default:
        return <div>Halaman tidak ditemukan.</div>;
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        profile={db.profile}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="main-layout">
        <DashboardHeader 
          activeTab={activeTab} 
          isDark={isDark} 
          setIsDark={setIsDark}
          profile={db.profile}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        {isSyncing && (
          <div style={{
            background: 'linear-gradient(90deg, #1e6091, #34a0a4)',
            color: 'white',
            textAlign: 'center',
            padding: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            zIndex: 10
          }}>
            🔄 MENYINKRONKAN DENGAN CLOUD SUPABASE...
          </div>
        )}
        <main className="panel-container">
          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
