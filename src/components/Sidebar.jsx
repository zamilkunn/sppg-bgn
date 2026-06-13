import React from 'react';
import BgnLogo from './BgnLogo';
import { 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Coins, 
  Scale, 
  FileText, 
  RefreshCw, 
  Thermometer,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, profile, onLogout, isOpen, onClose }) {
  const menuItems = [
    { id: 'buku-kas', name: 'Buku Kas', icon: BookOpen },
    { id: 'lap-biaya', name: 'Laporan Biaya', icon: BarChart3 },
    { id: 'realisasi', name: 'Realisasi Anggaran', icon: TrendingUp },
    { id: 'penggunaan', name: 'Penggunaan Dana', icon: Coins },
    { id: 'biaya-bahan', name: 'Biaya Bahan', icon: FileText },
    { id: 'kartu-stok', name: 'Kartu Stok', icon: RefreshCw },
    { id: 'stok-opname', name: 'Stok Opname', icon: Scale },
    { id: 'sisa-stok', name: 'Sisa Stok', icon: FileText },
    { id: 'kontrol-suhu', name: 'Kontrol Suhu', icon: Thermometer },
    { id: 'setting', name: 'Setting', icon: Sliders },
  ];

  // Dummy fallback in case Sliders icon was imported or not
  const Sliders = FileText; // just in case

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo-img">
            <BgnLogo size={34} />
          </div>
          <div className="sidebar-title-container">
            <h1 className="sidebar-title">BGN SPPG</h1>
            <span className="sidebar-subtitle">Nutrition Agency Portal</span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          className="burger-btn" 
          onClick={onClose}
          style={{ 
            color: '#cbd5e1', 
            marginRight: 0, 
            padding: 0, 
            width: '32px', 
            height: '32px',
            display: isOpen ? 'flex' : 'none' 
          }}
          title="Tutup Menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose(); // Auto-close drawer on mobile selection
              }}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">SPPG {profile.name}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={14} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
