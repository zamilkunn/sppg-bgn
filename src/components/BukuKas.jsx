import React, { useState } from 'react';
import { Plus, Download, Printer, Search, Calendar, Filter } from 'lucide-react';
import BgnLogo from './BgnLogo';

export default function BukuKas({ bukuKas, setBukuKas, profile, budgets }) {
  const [activeSource, setActiveSource] = useState('Kas Umum'); // 'Kas Umum' or 'Kas Kecil'
  const [startDate, setStartDate] = useState('2025-10-01');
  const [endDate, setEndDate] = useState('2025-10-31');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    proofNo: '',
    description: '',
    type: 'pengeluaran',
    amount: '',
    source: 'Kas Umum',
    category: 'Operasional & ATK'
  });

  const categories = [
    'Penerimaan',
    'Bahan Makanan',
    'Sewa Tempat',
    'Operasional & ATK',
    'Gaji & Honor',
    'Peralatan',
    'BBM & Distribusi'
  ];

  const formatIDR = (val) => {
    if (val === 0 || !val) return 'Rp 0';
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const newTx = {
      id: 'tx-' + Date.now(),
      date: formData.date,
      proofNo: formData.proofNo,
      description: formData.description,
      type: formData.type,
      amount: parseFloat(formData.amount),
      source: formData.source,
      category: formData.type === 'pemasukan' ? 'Penerimaan' : formData.category
    };

    setBukuKas([newTx, ...bukuKas]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      proofNo: '',
      description: '',
      type: 'pengeluaran',
      amount: '',
      source: activeSource,
      category: 'Operasional & ATK'
    });
  };

  // Filter & sort transactions
  const filteredTransactions = bukuKas
    .filter((tx) => {
      const matchSource = tx.source === activeSource;
      const matchDate = (!startDate || tx.date >= startDate) && (!endDate || tx.date <= endDate);
      const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.proofNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSource && matchDate && matchSearch;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort chronologically to calculate running balance

  // Calculate Running Balance
  let runningBalance = 0;
  const transactionsWithBalance = filteredTransactions.map((tx) => {
    if (tx.type === 'pemasukan') {
      runningBalance += tx.amount;
    } else {
      runningBalance -= tx.amount;
    }
    return { ...tx, balance: runningBalance };
  });

  // Totals
  const totalPemasukan = filteredTransactions
    .filter(tx => tx.type === 'pemasukan')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalPengeluaran = filteredTransactions
    .filter(tx => tx.type === 'pengeluaran')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const finalBalance = totalPemasukan - totalPengeluaran;

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'No,Tanggal,No. Bukti,Uraian,Kategori,Pemasukan,Pengeluaran,Saldo\n';
    
    transactionsWithBalance.forEach((tx, idx) => {
      const pem = tx.type === 'pemasukan' ? tx.amount : 0;
      const pen = tx.type === 'pengeluaran' ? tx.amount : 0;
      csvContent += `${idx + 1},"${tx.date}","${tx.proofNo}","${tx.description.replace(/"/g, '""')}","${tx.category}",${pem},${pen},${tx.balance}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Kas_${activeSource.replace(' ', '_')}_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      {/* Top Source Toggles */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeSource === 'Kas Umum' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveSource('Kas Umum');
            setFormData(prev => ({ ...prev, source: 'Kas Umum' }));
          }}
          style={{ flex: 1 }}
        >
          📘 Kas Umum
        </button>
        <button
          className={`btn ${activeSource === 'Kas Kecil' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveSource('Kas Kecil');
            setFormData(prev => ({ ...prev, source: 'Kas Kecil' }));
          }}
          style={{ flex: 1 }}
        >
          📙 Kas Kecil
        </button>
      </div>

      {/* Main Container */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title">
            <span>Buku Kas - {activeSource}</span>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} />
              <span>Ekspor CSV</span>
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Cetak Laporan</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Tambah Transaksi</span>
            </button>
          </div>
        </div>

        {/* Filters */}
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
          <div className="filter-group" style={{ flexGrow: 1 }}>
            <span className="filter-label">Cari Transaksi</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Cari uraian, no bukti, atau kategori..."
                className="form-control"
                style={{ paddingLeft: '34px', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Stats Summary */}
        <div className="grid-stats" style={{ marginBottom: '24px' }}>
          <div className="stat-card success">
            <div className="stat-header">
              <span className="stat-title">Total Pemasukan</span>
              <span className="stat-icon">📈</span>
            </div>
            <div className="stat-value">{formatIDR(totalPemasukan)}</div>
            <div className="stat-desc">Akumulasi penerimaan dana</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-header">
              <span className="stat-title">Total Pengeluaran</span>
              <span className="stat-icon">📉</span>
            </div>
            <div className="stat-value">{formatIDR(totalPengeluaran)}</div>
            <div className="stat-desc">Belanja operasional & bahan baku</div>
          </div>
          <div className="stat-card primary">
            <div className="stat-header">
              <span className="stat-title">Saldo Akhir</span>
              <span className="stat-icon">⚖️</span>
            </div>
            <div className="stat-value">{formatIDR(finalBalance)}</div>
            <div className="stat-desc">Sisa kas yang tersedia</div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="table-responsive">
          <table className="table-sppg">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th style={{ width: '110px' }}>Tanggal</th>
                <th style={{ width: '100px' }}>No. Bukti</th>
                <th>Uraian</th>
                <th style={{ width: '150px' }}>Kategori</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Pemasukan</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Pengeluaran</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {transactionsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Tidak ada transaksi dalam periode ini.
                  </td>
                </tr>
              ) : (
                transactionsWithBalance.map((tx, idx) => (
                  <tr key={tx.id}>
                    <td>{idx + 1}</td>
                    <td>{tx.date}</td>
                    <td><span className="badge badge-neutral">{tx.proofNo}</span></td>
                    <td style={{ fontWeight: '500' }}>{tx.description}</td>
                    <td>
                      <span className={`badge ${
                        tx.type === 'pemasukan' ? 'badge-success' : 'badge-neutral'
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: '600' }}>
                      {tx.type === 'pemasukan' ? formatIDR(tx.amount) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: '600' }}>
                      {tx.type === 'pengeluaran' ? formatIDR(tx.amount) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>
                      {formatIDR(tx.balance)}
                    </td>
                  </tr>
                ))
              )}
              {transactionsWithBalance.length > 0 && (
                <tr className="table-total-row">
                  <td colSpan="5" style={{ textAlign: 'right' }}>Total:</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatIDR(totalPemasukan)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatIDR(totalPengeluaran)}</td>
                  <td style={{ textAlign: 'right' }}>{formatIDR(finalBalance)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div className="print-logo-row">
          <BgnLogo size={55} />
          <div className="print-title-block">
            <h2>BADAN GIZI NASIONAL (NATIONAL NUTRITION AGENCY)</h2>
            <p>{profile.address}</p>
            <p><strong>BUKU KAS UTUM / KECIL SPPG {profile.name.toUpperCase()}</strong></p>
            <p>Periode Laporan: {formatDateLabel(startDate)} s.d {formatDateLabel(endDate)}</p>
          </div>
        </div>
        <div style={{ marginTop: '16px', fontSize: '10px' }}>
          <div><strong>Nama SPPG:</strong> SPPG {profile.name}</div>
          <div><strong>Wilayah:</strong> {profile.kelurahan}, {profile.kecamatan}, {profile.kabupaten}, {profile.provinsi}</div>
          <div><strong>Sumber Dana:</strong> {activeSource}</div>
        </div>
      </div>

      {/* PRINT-ONLY SIGNATURE SECTION */}
      <div className="print-signature-section">
        <div className="sig-block">
          <div className="sig-title">Mengetahui,<br />Koordinator SPPG</div>
          <div className="sig-name">....................................................</div>
          <div className="sig-nip">SPPG {profile.name}</div>
        </div>
        <div className="sig-block">
          <div className="sig-title">Diverifikasi Oleh,<br />Supervisor Dapur</div>
          <div className="sig-name">....................................................</div>
          <div className="sig-nip">Pemeriksa Suhu & QC</div>
        </div>
        <div className="sig-block">
          <div className="sig-title">Dibuat Oleh,<br />Petugas Logistik</div>
          <div className="sig-name">....................................................</div>
          <div className="sig-nip">Pencatat Harian</div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Tambah Transaksi Baru ({activeSource})</span>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTransaction}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Tanggal</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>No. Bukti</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: 008, KK-003"
                      value={formData.proofNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, proofNo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group form-group-full">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Uraian</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Masukkan deskripsi transaksi"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Jenis</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="pengeluaran">Pengeluaran</option>
                      <option value="pemasukan">Pemasukan</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Jumlah (Rupiah)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Masukkan nominal"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  {formData.type === 'pengeluaran' && (
                    <div className="filter-group form-group-full">
                      <label className="input-label" style={{ color: 'var(--text-main)' }}>Kategori Anggaran</label>
                      <select
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {categories.filter(c => c !== 'Penerimaan').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
