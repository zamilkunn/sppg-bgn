import React, { useState } from 'react';
import { Coins, Download, Printer } from 'lucide-react';

export default function LaporanPenggunaan({ bukuKas, profile }) {
  const [startDate, setStartDate] = useState('2025-10-01');
  const [endDate, setEndDate] = useState('2025-10-31');

  const formatIDR = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Filter transactions within range
  const filterTxs = (source) => {
    return bukuKas.filter((tx) => 
      tx.source === source && 
      (!startDate || tx.date >= startDate) && 
      (!endDate || tx.date <= endDate)
    );
  };

  const getStatsForSource = (source) => {
    const txs = filterTxs(source);
    const pemasukan = txs.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
    const pengeluaran = txs.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
    const saldo = pemasukan - pengeluaran;
    return { pemasukan, pengeluaran, saldo };
  };

  const kasUmumStats = getStatsForSource('Kas Umum');
  const kasKecilStats = getStatsForSource('Kas Kecil');

  const totalPemasukan = kasUmumStats.pemasukan + kasKecilStats.pemasukan;
  const totalPengeluaran = kasUmumStats.pengeluaran + kasKecilStats.pengeluaran;
  const totalSaldo = kasUmumStats.saldo + kasKecilStats.saldo;

  // Categorized breakdown per fund source
  const getCategoryBreakdown = (source) => {
    const txs = filterTxs(source).filter(t => t.type === 'pengeluaran');
    const breakdown = {};
    txs.forEach((tx) => {
      breakdown[tx.category] = (breakdown[tx.category] || 0) + tx.amount;
    });
    return breakdown;
  };

  const kasUmumCategories = getCategoryBreakdown('Kas Umum');
  const kasKecilCategories = getCategoryBreakdown('Kas Kecil');

  const allCategories = Array.from(new Set([
    ...Object.keys(kasUmumCategories),
    ...Object.keys(kasKecilCategories)
  ]));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-card">
      <div className="page-card-header">
        <div className="page-card-title">
          <Coins size={20} style={{ color: 'var(--primary)' }} />
          <span>Laporan Penggunaan Dana SPPG</span>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Date Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Tanggal Awal</span>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <span className="filter-label">Tanggal Akhir</span>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Cash Source Table Summary */}
      <h3 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Ringkasan Saldo Buku Kas SPPG
      </h3>
      <div className="table-responsive" style={{ marginBottom: '32px' }}>
        <table className="table-sppg">
          <thead>
            <tr>
              <th>Sumber Dana</th>
              <th style={{ textAlign: 'right' }}>Total Penerimaan (Masuk)</th>
              <th style={{ textAlign: 'right' }}>Total Penggunaan (Keluar)</th>
              <th style={{ textAlign: 'right' }}>Saldo Akhir Kas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>📘 Kas Umum (Rekening/Bank)</td>
              <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatIDR(kasUmumStats.pemasukan)}</td>
              <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatIDR(kasUmumStats.pengeluaran)}</td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatIDR(kasUmumStats.saldo)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>📙 Kas Kecil (Tunai Dapur)</td>
              <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatIDR(kasKecilStats.pemasukan)}</td>
              <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatIDR(kasKecilStats.pengeluaran)}</td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatIDR(kasKecilStats.saldo)}</td>
            </tr>
            <tr className="table-total-row">
              <td>GABUNGAN (TOTAL DANA)</td>
              <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatIDR(totalPemasukan)}</td>
              <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatIDR(totalPengeluaran)}</td>
              <td style={{ textAlign: 'right' }}>{formatIDR(totalSaldo)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Category Breakdown Table */}
      <h3 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Rincian Penggunaan Dana Per Kategori Anggaran
      </h3>
      <div className="table-responsive">
        <table className="table-sppg">
          <thead>
            <tr>
              <th>Kategori Biaya</th>
              <th style={{ textAlign: 'right', width: '200px' }}>Realisasi Kas Umum</th>
              <th style={{ textAlign: 'right', width: '200px' }}>Realisasi Kas Kecil</th>
              <th style={{ textAlign: 'right', width: '220px' }}>Total Penggunaan Gabungan</th>
            </tr>
          </thead>
          <tbody>
            {allCategories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  Tidak ada data transaksi pengeluaran.
                </td>
              </tr>
            ) : (
              allCategories.map((cat) => {
                const umumVal = kasUmumCategories[cat] || 0;
                const kecilVal = kasKecilCategories[cat] || 0;
                const totalVal = umumVal + kecilVal;
                return (
                  <tr key={cat}>
                    <td style={{ fontWeight: '600' }}>{cat}</td>
                    <td style={{ textAlign: 'right', color: umumVal > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {umumVal > 0 ? formatIDR(umumVal) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', color: kecilVal > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {kecilVal > 0 ? formatIDR(kecilVal) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--danger)' }}>
                      {formatIDR(totalVal)}
                    </td>
                  </tr>
                );
              })
            )}
            {allCategories.length > 0 && (
              <tr className="table-total-row">
                <td>TOTAL BELANJA</td>
                <td style={{ textAlign: 'right' }}>{formatIDR(kasUmumStats.pengeluaran)}</td>
                <td style={{ textAlign: 'right' }}>{formatIDR(kasKecilStats.pengeluaran)}</td>
                <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatIDR(totalPengeluaran)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>BADAN GIZI NASIONAL</h2>
          <h3>LAPORAN PENGGUNAAN DANA (KAS UMUM VS KAS KECIL) SPPG {profile.name.toUpperCase()}</h3>
          <p>Mencakup arus mutasi penerimaan dan belanja dana SPPG harian dapur MBG.</p>
        </div>
      </div>
    </div>
  );
}
