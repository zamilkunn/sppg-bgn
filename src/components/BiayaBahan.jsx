import React, { useState } from 'react';
import { FileText, Plus, Calendar, Coffee, Tag } from 'lucide-react';

export default function BiayaBahan({ items, stockTransactions, setStockTransactions, profile }) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'production-sheet'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Food Production Sheet
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: items[0]?.id || '',
    qty: '',
    menuName: '',
    notes: ''
  });

  const formatIDR = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const handleAddProductionUsage = (e) => {
    e.preventDefault();
    const selectedItem = items.find(i => i.id === formData.itemId);
    if (!selectedItem) return;

    const newUsage = {
      id: 'st-' + Date.now(),
      itemId: formData.itemId,
      date: formData.date,
      type: 'keluar',
      qty: parseFloat(formData.qty),
      price: 0, // Usage doesn't have an purchase price in stock-out, but we track qty
      notes: formData.notes || `Produksi Menu: ${formData.menuName}`,
      menuName: formData.menuName
    };

    setStockTransactions([newUsage, ...stockTransactions]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      itemId: items[0]?.id || '',
      qty: '',
      menuName: '',
      notes: ''
    });
  };

  // Get only food items (exclude others if needed, but let's take items whose category is 'Bahan Kering' or 'Bahan Basah')
  const foodItems = items.filter(i => i.category === 'Bahan Kering' || i.category === 'Bahan Basah');
  const foodItemIds = foodItems.map(i => i.id);

  // Purchases (Stock In of food items)
  const purchases = stockTransactions.filter(tx => 
    tx.type === 'masuk' && foodItemIds.includes(tx.itemId)
  );

  // Usages (Stock Out of food items for menus)
  const usages = stockTransactions.filter(tx => 
    tx.type === 'keluar' && foodItemIds.includes(tx.itemId)
  );

  // Group purchases by Item
  const itemPurchaseSummary = foodItems.map(item => {
    const itemPurchases = purchases.filter(p => p.itemId === item.id);
    const totalQty = itemPurchases.reduce((sum, p) => sum + p.qty, 0);
    const totalVal = itemPurchases.reduce((sum, p) => sum + (p.qty * p.price), 0);
    const avgPrice = totalQty ? totalVal / totalQty : 0;

    return {
      ...item,
      totalQty,
      totalVal,
      avgPrice
    };
  }).filter(item => item.totalQty > 0);

  const totalFoodExpenses = itemPurchaseSummary.reduce((sum, item) => sum + item.totalVal, 0);

  return (
    <div>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('summary')}
          style={{ flex: 1 }}
        >
          🥩 Analisis Biaya Bahan
        </button>
        <button
          className={`btn ${activeTab === 'production-sheet' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('production-sheet')}
          style={{ flex: 1 }}
        >
          📝 Food Production Sheet (Pengeluaran Menu)
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className="page-card">
          <div className="page-card-header">
            <div className="page-card-title">
              <Tag size={18} style={{ color: 'var(--primary)' }} />
              <span>Rangkuman Belanja Bahan Baku Dapur</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-light)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
              Total Belanja Bahan: {formatIDR(totalFoodExpenses)}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table-sppg">
              <thead>
                <tr>
                  <th>Nama Bahan Makanan</th>
                  <th>Kategori</th>
                  <th style={{ textAlign: 'center' }}>Total Vol Pembelian</th>
                  <th style={{ textAlign: 'right' }}>Rata-rata Harga / Unit</th>
                  <th style={{ textAlign: 'right' }}>Total Pengeluaran Bahan</th>
                </tr>
              </thead>
              <tbody>
                {itemPurchaseSummary.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Belum ada transaksi pembelian bahan makanan tercatat.
                    </td>
                  </tr>
                ) : (
                  itemPurchaseSummary.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.name}</td>
                      <td><span className="badge badge-neutral">{item.category}</span></td>
                      <td style={{ textAlign: 'center' }}>{item.totalQty} {item.unit}</td>
                      <td style={{ textAlign: 'right' }}>{formatIDR(item.avgPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--danger)' }}>
                        {formatIDR(item.totalVal)}
                      </td>
                    </tr>
                  ))
                )}
                {itemPurchaseSummary.length > 0 && (
                  <tr className="table-total-row">
                    <td colSpan="4" style={{ textAlign: 'right' }}>TOTAL BELANJA BAHAN MAKANAN:</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatIDR(totalFoodExpenses)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Food Production Sheet Tab */
        <div className="page-card">
          <div className="page-card-header">
            <div className="page-card-title">
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              <span>Lembar Pengeluaran Bahan Harian</span>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Catat Pengeluaran Menu</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="table-sppg">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Tanggal</th>
                  <th>Menu Makanan MBG</th>
                  <th>Nama Bahan</th>
                  <th style={{ textAlign: 'center' }}>Jumlah Keluar</th>
                  <th>Keterangan / Ref</th>
                </tr>
              </thead>
              <tbody>
                {usages.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Belum ada pencatatan bahan keluar untuk menu harian.
                    </td>
                  </tr>
                ) : (
                  usages.map((tx) => {
                    const item = items.find(i => i.id === tx.itemId);
                    return (
                      <tr key={tx.id}>
                        <td>{tx.date}</td>
                        <td>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Coffee size={14} /> {tx.menuName || 'Umum'}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{item ? item.name : 'Item Terhapus'}</td>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--danger)' }}>
                          {tx.qty} {item ? item.unit : ''}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tx.notes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Usage Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Catat Penggunaan Bahan Harian (Menu)</span>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddProductionUsage}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Tanggal Produksi</label>
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
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Nama Menu MBG</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Nasi Goreng Telur, Bubur Gizi"
                      value={formData.menuName}
                      onChange={(e) => setFormData(prev => ({ ...prev, menuName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Kuantitas Digunakan</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Jumlah kuantitas"
                      value={formData.qty}
                      onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group form-group-full">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Keterangan Tambahan</label>
                    <textarea
                      className="form-control"
                      placeholder="Contoh: Produksi porsi 200 anak"
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
                  Simpan ke Log Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
