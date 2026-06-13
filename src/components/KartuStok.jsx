import React, { useState } from 'react';
import { RefreshCw, Plus, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';

export default function KartuStok({ items, stockTransactions, setStockTransactions }) {
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stock-In Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    qty: '',
    price: '',
    supplier: '',
    batchCode: '',
    expiryDate: '',
    qcPackaging: 'OK',
    qcPhysical: 'OK',
    qcTemp: '-'
  });

  const formatIDR = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Filter transactions for this item
  const itemTransactions = stockTransactions
    .filter(tx => tx.itemId === selectedItemId)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Chronological sort

  // Calculate Running stock balance
  let runningQty = 0;
  const transactionsWithBalance = itemTransactions.map((tx) => {
    if (tx.type === 'masuk') {
      runningQty += tx.qty;
    } else {
      runningQty -= tx.qty;
    }
    return { ...tx, balance: runningQty };
  });

  // Reverse back to newest first for table display
  const displayTransactions = [...transactionsWithBalance].reverse();

  const handleAddStockIn = (e) => {
    e.preventDefault();
    if (!selectedItemId) return;

    const newStockIn = {
      id: 'st-' + Date.now(),
      itemId: selectedItemId,
      date: formData.date,
      type: 'masuk',
      qty: parseFloat(formData.qty),
      price: parseFloat(formData.price),
      supplier: formData.supplier,
      batchCode: formData.batchCode || `BGN-${selectedItem.name.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      expiryDate: formData.expiryDate,
      qc: {
        packaging: formData.qcPackaging,
        physical: formData.qcPhysical,
        temp: formData.qcTemp,
        checked: true
      }
    };

    setStockTransactions([newStockIn, ...stockTransactions]);
    setIsModalOpen(false);
    // Reset Form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      qty: '',
      price: '',
      supplier: '',
      batchCode: '',
      expiryDate: '',
      qcPackaging: 'OK',
      qcPhysical: 'OK',
      qcTemp: '-'
    });
  };

  return (
    <div className="page-card">
      <div className="page-card-header">
        <div className="page-card-title">
          <RefreshCw size={20} style={{ color: 'var(--primary)' }} />
          <span>Buku Kartu Kontrol Stok Barang</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} disabled={!selectedItemId}>
            <Plus size={16} />
            <span>Pasok Bahan Masuk (QC)</span>
          </button>
        </div>
      </div>

      {/* Select Item Filter */}
      <div className="filters-bar">
        <div className="filter-group" style={{ flexGrow: 1 }}>
          <span className="filter-label">Pilih Item Barang / Bahan Baku</span>
          <select
            className="form-control"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          >
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.unit}) - [{item.category}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedItem ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>NAMA BAHAN</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedItem.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>SATUAN</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedItem.unit}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>SAFETY STOCK LEVEL</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--warning)' }}>{selectedItem.safetyStock} {selectedItem.unit}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>STOK AKHIR HARI INI</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: runningQty < selectedItem.safetyStock ? 'var(--danger)' : 'var(--success)' }}>
                {runningQty} {selectedItem.unit}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table-sppg">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Tanggal</th>
                  <th style={{ width: '90px' }}>Jenis</th>
                  <th>Uraian / Detail Transaksi</th>
                  <th style={{ width: '120px' }}>Pemasok / Batch</th>
                  <th style={{ width: '120px' }}>Tgl Kadaluwarsa</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Masuk (+)</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Keluar (-)</th>
                  <th style={{ width: '125px', textAlign: 'center' }}>Saldo Stok</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Status QC</th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Belum ada kartu riwayat transaksi untuk item ini.
                    </td>
                  </tr>
                ) : (
                  displayTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>
                        <span className={`badge ${tx.type === 'masuk' ? 'badge-success' : 'badge-danger'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{tx.notes || (tx.type === 'masuk' ? 'Pasokan bahan masuk' : `Produksi: ${tx.menuName}`)}</div>
                        {tx.price > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Harga: {formatIDR(tx.price)}/{selectedItem.unit}</span>}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {tx.type === 'masuk' ? (
                          <div>
                            <div><strong>{tx.supplier || 'Umum'}</strong></div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Batch: {tx.batchCode}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {tx.type === 'masuk' ? (
                          <span style={{ fontWeight: '500', color: tx.expiryDate ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {tx.expiryDate || 'N/A'}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>
                        {tx.type === 'masuk' ? `${tx.qty} ${selectedItem.unit}` : '-'}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 'bold' }}>
                        {tx.type === 'keluar' ? `${tx.qty} ${selectedItem.unit}` : '-'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>
                        {tx.balance} {selectedItem.unit}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {tx.type === 'masuk' && tx.qc ? (
                          <span 
                            className="badge badge-success"
                            style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title={`Kemasan: ${tx.qc.packaging}\nKondisi: ${tx.qc.physical}\nSuhu: ${tx.qc.temp}`}
                          >
                            <ShieldCheck size={12} /> OK
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Silakan buat master item terlebih dahulu di Settings.
        </div>
      )}

      {/* Add Stock-In Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Pasok Bahan Masuk - QC Log ({selectedItem?.name})</span>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStockIn}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Tanggal Penerimaan</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Kuantitas Masuk</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder={`Jumlah (${selectedItem?.unit})`}
                      value={formData.qty}
                      onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Harga Satuan (Rupiah)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Harga beli per unit"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Nama Pemasok (Supplier)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: PT Beras Makmur"
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Kode Batch (Opsional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Kosongkan untuk auto-generate"
                      value={formData.batchCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchCode: e.target.value }))}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Tanggal Kadaluwarsa</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group form-group-full" style={{ borderTop: '1px solid var(--border-color)', pt: '12px', mt: '12px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                      📋 Form Pemeriksaan Kualitas (QC Check)
                    </h4>
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Keutuhan Kemasan</label>
                    <select
                      className="form-control"
                      value={formData.qcPackaging}
                      onChange={(e) => setFormData(prev => ({ ...prev, qcPackaging: e.target.value }))}
                    >
                      <option value="OK">Utuh / Bagus (OK)</option>
                      <option value="Rusak/Bocor">Bocor / Sobek / Rusak</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Kondisi Fisik Bahan</label>
                    <select
                      className="form-control"
                      value={formData.qcPhysical}
                      onChange={(e) => setFormData(prev => ({ ...prev, qcPhysical: e.target.value }))}
                    >
                      <option value="OK">Segar / Kering Sesuai Standar (OK)</option>
                      <option value="Busuk/Kotor">Busuk / Layu / Kotor</option>
                    </select>
                  </div>
                  <div className="filter-group form-group-full">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Suhu Penyimpanan Penerimaan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Chiller 4°C, Freezer -18°C, atau '-' untuk suhu ruang"
                      value={formData.qcTemp}
                      onChange={(e) => setFormData(prev => ({ ...prev, qcTemp: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
