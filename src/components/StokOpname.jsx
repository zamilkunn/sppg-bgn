import React, { useState } from 'react';
import { Scale, Plus, AlertTriangle, CheckCircle, Printer } from 'lucide-react';

export default function StokOpname({ items, stockTransactions, setStockTransactions, stockOpname, setStockOpname, profile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: items[0]?.id || '',
    auditType: 'Mingguan',
    actualQty: '',
    notes: '',
    operator: ''
  });

  // Calculate current system quantity of an item
  const getSystemQty = (itemId) => {
    const txs = stockTransactions.filter(tx => tx.itemId === itemId);
    let qty = 0;
    txs.forEach((tx) => {
      if (tx.type === 'masuk') qty += tx.qty;
      else qty -= tx.qty;
    });
    return qty;
  };

  const currentSystemQty = getSystemQty(formData.itemId);

  const handleAddOpname = (e) => {
    e.preventDefault();
    const selectedItem = items.find(i => i.id === formData.itemId);
    if (!selectedItem) return;

    const actual = parseFloat(formData.actualQty);
    const system = getSystemQty(formData.itemId);
    const discrepancy = actual - system;

    const newOpname = {
      id: 'so-' + Date.now(),
      date: formData.date,
      itemId: formData.itemId,
      auditType: formData.auditType,
      systemQty: system,
      actualQty: actual,
      discrepancy,
      notes: formData.notes || (discrepancy === 0 ? 'Stok sesuai' : 'Penyesuaian fisik'),
      operator: formData.operator || 'Administrator'
    };

    // Save opname audit log
    setStockOpname([newOpname, ...stockOpname]);

    // Create adjustment transaction to correct system stock
    if (discrepancy !== 0) {
      const adjustmentTx = {
        id: 'st-adj-' + Date.now(),
        itemId: formData.itemId,
        date: formData.date,
        type: discrepancy > 0 ? 'masuk' : 'keluar',
        qty: Math.abs(discrepancy),
        price: 0,
        notes: `Penyesuaian Stok Opname (${formData.auditType}): ${newOpname.notes}`,
        menuName: ''
      };
      setStockTransactions([adjustmentTx, ...stockTransactions]);
    }

    setIsModalOpen(false);
    // Reset Form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      itemId: items[0]?.id || '',
      auditType: 'Mingguan',
      actualQty: '',
      notes: '',
      operator: ''
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-card">
      <div className="page-card-header">
        <div className="page-card-title">
          <Scale size={20} style={{ color: 'var(--primary)' }} />
          <span>Audit & Rekonsiliasi Stok Opname</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Cetak Laporan</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Audit Stok Opname Baru</span>
          </button>
        </div>
      </div>

      {/* Audit List Table */}
      <div className="table-responsive">
        <table className="table-sppg">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Tanggal</th>
              <th style={{ width: '90px' }}>Jenis Audit</th>
              <th>Bahan / Material</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Stok Sistem</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Stok Fisik</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Selisih Audit</th>
              <th>Pemeriksa</th>
              <th>Keterangan Selisih</th>
            </tr>
          </thead>
          <tbody>
            {stockOpname.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  Belum ada log stok opname tercatat.
                </td>
              </tr>
            ) : (
              stockOpname.map((log) => {
                const item = items.find(i => i.id === log.itemId);
                return (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>
                      <span className="badge badge-neutral">{log.auditType}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{item ? item.name : 'Item Terhapus'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {log.systemQty} {item?.unit}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {log.actualQty} {item?.unit}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {log.discrepancy === 0 ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} /> Cocok (0)
                        </span>
                      ) : (
                        <span className={`badge ${log.discrepancy > 0 ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={10} /> {log.discrepancy > 0 ? `+${log.discrepancy}` : log.discrepancy} {item?.unit}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px' }}>{log.operator}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{log.notes}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>BADAN GIZI NASIONAL</h2>
          <h3>LAPORAN AUDIT & REKONSILIASI STOK OPNAME SPPG {profile.name.toUpperCase()}</h3>
          <p>Mencakup pengecekan silang jumlah fisik bahan gudang vs jumlah saldo tercatat di sistem.</p>
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

      {/* Log Opname Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Input Audit Stok Opname Baru</span>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddOpname}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Tanggal Audit</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Bahan Makanan</label>
                    <select
                      className="form-control"
                      value={formData.itemId}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                      required
                    >
                      {items.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Jenis Audit</label>
                    <select
                      className="form-control"
                      value={formData.auditType}
                      onChange={(e) => setFormData(prev => ({ ...prev, auditType: e.target.value }))}
                    >
                      <option value="Harian">Harian (Daily)</option>
                      <option value="Mingguan">Mingguan (Weekly)</option>
                      <option value="Bulanan">Bulanan (Monthly)</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Nama Pemeriksa</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Petugas Logistik / Admin"
                      value={formData.operator}
                      onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-muted)' }}>Stok di Sistem</label>
                    <div style={{ padding: '8px 12px', background: 'var(--primary-light)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                      {currentSystemQty} {items.find(i => i.id === formData.itemId)?.unit}
                    </div>
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Jumlah Fisik Sebenarnya</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Masukkan jumlah riil"
                      value={formData.actualQty}
                      onChange={(e) => setFormData(prev => ({ ...prev, actualQty: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group form-group-full">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Sebab Selisih (Jika ada)</label>
                    <textarea
                      className="form-control"
                      placeholder="Contoh: Susut penyimpanan kelembaban udara"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
