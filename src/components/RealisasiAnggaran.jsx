import React from 'react';
import { TrendingUp, AlertTriangle, Printer } from 'lucide-react';

export default function RealisasiAnggaran({ bukuKas, budgets, profile }) {
  const formatIDR = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Calculate actual spending per category from Buku Kas
  const getActualSpending = (category) => {
    return bukuKas
      .filter((tx) => tx.type === 'pengeluaran' && tx.category === category)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const categories = Object.keys(budgets);

  const budgetRealisations = categories.map((cat) => {
    const budget = budgets[cat] || 0;
    const actual = getActualSpending(cat);
    const remaining = budget - actual;
    const percentage = budget ? (actual / budget) * 100 : 0;

    let status = 'safe'; // safe, warning, danger
    if (percentage >= 90) {
      status = 'danger';
    } else if (percentage >= 75) {
      status = 'warning';
    }

    return {
      category: cat,
      budget,
      actual,
      remaining,
      percentage,
      status
    };
  });

  const totalBudget = categories.reduce((sum, cat) => sum + budgets[cat], 0);
  const totalActual = budgetRealisations.reduce((sum, item) => sum + item.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const totalPercentage = totalBudget ? (totalActual / totalBudget) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-card">
      <div className="page-card-header">
        <div className="page-card-title">
          <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
          <span>Monitoring Realisasi Anggaran SPPG</span>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid-stats" style={{ marginBottom: '32px' }}>
        <div className="stat-card primary">
          <div className="stat-header">
            <span className="stat-title">Pagu Anggaran (Limit)</span>
            <span>💰</span>
          </div>
          <div className="stat-value">{formatIDR(totalBudget)}</div>
          <div className="stat-desc">Batas total alokasi dana</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-title">Total Realisasi</span>
            <span>📉</span>
          </div>
          <div className="stat-value">{formatIDR(totalActual)}</div>
          <div className="stat-desc">Jumlah yang telah dibelanjakan ({totalPercentage.toFixed(1)}%)</div>
        </div>
        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-title">Sisa Pagu Anggaran</span>
            <span>⚖️</span>
          </div>
          <div className="stat-value">{formatIDR(totalRemaining)}</div>
          <div className="stat-desc">Sisa anggaran yang tersedia</div>
        </div>
      </div>

      {/* Progress Bars & Details */}
      <div className="budget-progress-container" style={{ marginBottom: '32px' }}>
        {budgetRealisations.map((item) => (
          <div key={item.category} className="budget-progress-item">
            <div className="budget-meta">
              <span className="budget-cat-name">{item.category}</span>
              <span className="budget-amount-info">
                {formatIDR(item.actual)} dari {formatIDR(item.budget)} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            
            <div className="progress-track" style={{ marginBottom: '8px' }}>
              <div 
                className={`progress-bar ${item.status}`} 
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Sisa: {formatIDR(item.remaining)}</span>
              {item.percentage >= 100 ? (
                <span style={{ color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} /> Anggaran Terlampaui!
                </span>
              ) : item.percentage >= 90 ? (
                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Kritis (&gt;90%)</span>
              ) : item.percentage >= 75 ? (
                <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Waspada (&gt;75%)</span>
              ) : (
                <span style={{ color: 'var(--success)' }}>Aman</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabular data */}
      <div className="table-responsive">
        <table className="table-sppg">
          <thead>
            <tr>
              <th>Kategori Anggaran</th>
              <th style={{ textAlign: 'right' }}>Pagu Anggaran</th>
              <th style={{ textAlign: 'right' }}>Realisasi Belanja</th>
              <th style={{ textAlign: 'right' }}>Sisa Anggaran</th>
              <th style={{ textAlign: 'center' }}>% Realisasi</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetRealisations.map((item) => (
              <tr key={item.category}>
                <td style={{ fontWeight: '600' }}>{item.category}</td>
                <td style={{ textAlign: 'right' }}>{formatIDR(item.budget)}</td>
                <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatIDR(item.actual)}</td>
                <td style={{ 
                  textAlign: 'right', 
                  color: item.remaining < 0 ? 'var(--danger)' : 'var(--text-main)',
                  fontWeight: item.remaining < 0 ? 'bold' : 'normal'
                }}>
                  {formatIDR(item.remaining)}
                </td>
                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                  {item.percentage.toFixed(1)}%
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${
                    item.status === 'danger' ? 'badge-danger' : 
                    item.status === 'warning' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {item.percentage >= 100 ? 'Over' : 
                     item.status === 'danger' ? 'Kritis' : 
                     item.status === 'warning' ? 'Waspada' : 'Aman'}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="table-total-row">
              <td>TOTAL</td>
              <td style={{ textAlign: 'right' }}>{formatIDR(totalBudget)}</td>
              <td style={{ textAlign: 'right' }}>{formatIDR(totalActual)}</td>
              <td style={{ textAlign: 'right' }}>{formatIDR(totalRemaining)}</td>
              <td style={{ textAlign: 'center' }}>{totalPercentage.toFixed(1)}%</td>
              <td style={{ textAlign: 'center' }}>
                <span className={`badge ${totalPercentage >= 90 ? 'badge-danger' : totalPercentage >= 75 ? 'badge-warning' : 'badge-success'}`}>
                  {totalPercentage >= 90 ? 'Kritis' : totalPercentage >= 75 ? 'Waspada' : 'Aman'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>BADAN GIZI NASIONAL</h2>
          <h3>LAPORAN MONITORING & REALISASI ANGGARAN SPPG {profile.name.toUpperCase()}</h3>
          <p>Mencakup seluruh pengeluaran kas yang didebet pada alokasi pagu anggaran tahun berjalan.</p>
        </div>
      </div>
    </div>
  );
}
