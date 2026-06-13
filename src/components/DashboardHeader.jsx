import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';

export default function DashboardHeader({ activeTab, isDark, setIsDark, profile, onMenuClick }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'buku-kas':
        return 'Pencatat Buku Kas';
      case 'lap-biaya':
        return 'Laporan Biaya Operasional';
      case 'realisasi':
        return 'Realisasi Anggaran SPPG';
      case 'penggunaan':
        return 'Laporan Penggunaan Dana';
      case 'biaya-bahan':
        return 'Laporan Biaya Bahan & Produksi';
      case 'kartu-stok':
        return 'Kartu Kontrol Stok Barang';
      case 'stok-opname':
        return 'Audit Stok Opname Harian/Mingguan';
      case 'sisa-stok':
        return 'Sisa Stok Barang & Monitoring Kedaluwarsa';
      case 'kontrol-suhu':
        return 'Kartu Kontrol Suhu Penyimpanan';
      case 'setting':
        return 'Konfigurasi Sistem SPPG';
      default:
        return 'Dashboard SPPG';
    }
  };

  const getSubTitle = () => {
    return `${profile.kelurahan}, ${profile.kecamatan}, ${profile.kabupaten}, ${profile.provinsi}`;
  };

  return (
    <header className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          className="burger-btn" 
          onClick={onMenuClick}
          title="Buka Menu"
        >
          <Menu size={22} />
        </button>
        <div className="header-title-section">
          <h1>{getTabTitle()}</h1>
          <span className="header-meta">{getSubTitle()}</span>
        </div>
      </div>

      <div className="header-controls">
        <button 
          className="theme-toggle" 
          onClick={() => setIsDark(!isDark)}
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="sppg-badge">
          SPPG {profile.name.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
