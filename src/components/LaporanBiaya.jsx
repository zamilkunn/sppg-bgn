import React, { useState } from 'react';
import { Download, Calendar, Filter, Printer } from 'lucide-react';

export default function LaporanBiaya({ bukuKas, profile }) {
  const [startDate, setStartDate] = useState('2025-10-01');
  const [endDate, setEndDate] = useState('2025-10-31');

  const formatIDR = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Filter expenses
  const expenses = bukuKas.filter(tx => 
    tx.type === 'pengeluaran' && 
    (!startDate || tx.date >= startDate) && 
    (!endDate || tx.date <= endDate)
  );

  // Group by Sewa, Bahan Baku, and Operasional
  let sewaTotal = 0;
  let bahanTotal = 0;
  let operasionalTotal = 0;

  expenses.forEach(tx => {
    if (tx.category === 'Sewa Tempat') {
      sewaTotal += tx.amount;
    } else if (tx.category === 'Bahan Makanan') {
      bahanTotal += tx.amount;
    } else {
      operasionalTotal += tx.amount;
    }
  });

  const totalPengeluaran = sewaTotal + bahanTotal + operasionalTotal;

  // Percentages
  const sewaPct = totalPengeluaran ? (sewaTotal / totalPengeluaran) * 100 : 0;
  const bahanPct = totalPengeluaran ? (bahanTotal / totalPengeluaran) * 100 : 0;
  const operasionalPct = totalPengeluaran ? (operasionalTotal / totalPengeluaran) * 100 : 0;

  // Calculations for SVG Donut
  // Circumference of circle with r=50 is 2 * pi * 50 = 314.159
  const circumference = 314.16;
  const sewaStroke = (sewaPct / 100) * circumference;
  const bahanStroke = (bahanPct / 100) * circumference;
  const operasionalStroke = (operasionalPct / 100) * circumference;

  const offsetSewa = circumference;
  const offsetBahan = circumference - sewaStroke;
  const offsetOperasional = circumference - sewaStroke - bahanStroke;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-card">
      <div className="page-card-header">
        <div className="page-card-title">
          <span>Laporan Biaya Operasional SPPG</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Cetak Laporan</span>
          </button>
        </div>
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

      {/* Main Breakdown Layout */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginTop: '24px' }}>
        {/* Left Side: Donut Chart & Legend */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--primary-light)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '15px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Rasio Pengeluaran Biaya
          </h3>

          <div className="chart-container-sppg" style={{ position: 'relative', width: '220px', height: '220px' }}>
            {totalPengeluaran > 0 ? (
              <svg width="200" height="200" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--border-color)" strokeWidth="12" />
                
                {/* Sewa Tempat */}
                {sewaTotal > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#34a0a4"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offsetSewa}
                  />
                )}

                {/* Bahan Baku */}
                {bahanTotal > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#1e6091"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offsetBahan}
                  />
                )}

                {/* Operasional */}
                {operasionalTotal > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offsetOperasional}
                  />
                )}
              </svg>
            ) : (
              <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '8px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                Kosong
              </div>
            )}

            {/* Total Label inside donut */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Biaya</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'center' }}>
                {formatIDR(totalPengeluaran)}
              </span>
            </div>
          </div>

          {/* Legends */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34a0a4', display: 'inline-block' }}></span>
                <span>Sewa Bahan Baku / Tempat</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{sewaPct.toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1e6091', display: 'inline-block' }}></span>
                <span>Bahan Makanan (Dapur)</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{bahanPct.toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                <span>Biaya Operasional & Lainnya</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{operasionalPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Specific Details */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid-stats" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: 0 }}>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-header" style={{ marginBottom: '6px' }}>
                <span className="stat-title" style={{ fontSize: '11px' }}>Sewa & Kontrak</span>
              </div>
              <div className="stat-value" style={{ fontSize: '18px', color: '#34a0a4' }}>{formatIDR(sewaTotal)}</div>
              <div className="stat-desc">Kontrak lahan & alat dapur</div>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-header" style={{ marginBottom: '6px' }}>
                <span className="stat-title" style={{ fontSize: '11px' }}>Bahan Baku</span>
              </div>
              <div className="stat-value" style={{ fontSize: '18px', color: '#1e6091' }}>{formatIDR(bahanTotal)}</div>
              <div className="stat-desc">Belanja bahan makanan harian</div>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-header" style={{ marginBottom: '6px' }}>
                <span className="stat-title" style={{ fontSize: '11px' }}>Operasional</span>
              </div>
              <div className="stat-value" style={{ fontSize: '18px', color: '#f59e0b' }}>{formatIDR(operasionalTotal)}</div>
              <div className="stat-desc">Gaji, LPG, BBM & ATK</div>
            </div>
          </div>

          {/* List of matching expenses */}
          <div className="table-responsive">
            <table className="table-sppg">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Tanggal</th>
                  <th style={{ width: '100px' }}>No. Bukti</th>
                  <th>Uraian</th>
                  <th>Kategori</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Tidak ada catatan biaya dalam periode ini.
                    </td>
                  </tr>
                ) : (
                  expenses.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td><span className="badge badge-neutral">{tx.proofNo}</span></td>
                      <td style={{ fontWeight: '500' }}>{tx.description}</td>
                      <td>
                        <span className="badge badge-neutral">
                          {tx.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: '600' }}>
                        {formatIDR(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>BADAN GIZI NASIONAL</h2>
          <h3>LAPORAN BIAYA OPERASIONAL & BAHAN BAKU SPPG {profile.name.toUpperCase()}</h3>
          <p>Periode: {startDate} s.d {endDate}</p>
        </div>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid black' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Jenis Biaya</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Realisasi Biaya</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Persentase</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>Biaya Sewa Lahan, Bahan Baku & Gedung</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{formatIDR(sewaTotal)}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{sewaPct.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px' }}>Biaya Pembelian Bahan Baku Makanan (Dapur)</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{formatIDR(bahanTotal)}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{bahanPct.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px' }}>Biaya Operasional, Gaji, BBM & Lain-lain</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{formatIDR(operasionalTotal)}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{operasionalPct.toFixed(2)}%</td>
              </tr>
              <tr style={{ fontWeight: 'bold', borderTop: '2px solid black' }}>
                <td style={{ padding: '8px' }}>TOTAL REALISASI BIAYA</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{formatIDR(totalPengeluaran)}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>100.00%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
