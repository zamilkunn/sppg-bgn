import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, HelpCircle, Calendar, Printer } from 'lucide-react';

export default function SisaStok({ items, stockTransactions, profile }) {
  const formatIDR = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const getSystemQty = (itemId) => {
    const txs = stockTransactions.filter(tx => tx.itemId === itemId);
    let qty = 0;
    txs.forEach((tx) => {
      if (tx.type === 'masuk') qty += tx.qty;
      else qty -= tx.qty;
    });
    return qty;
  };

  const getAveragePrice = (itemId) => {
    const purchases = stockTransactions.filter(tx => tx.itemId === itemId && tx.type === 'masuk');
    const totalQty = purchases.reduce((sum, tx) => sum + tx.qty, 0);
    const totalVal = purchases.reduce((sum, tx) => sum + (tx.qty * tx.price), 0);
    return totalQty ? totalVal / totalQty : 0;
  };

  const inventorySummary = items.map(item => {
    const qty = getSystemQty(item.id);
    const avgPrice = getAveragePrice(item.id);
    const valuation = qty * avgPrice;
    
    let status = 'safe'; // safe, low, empty
    if (qty === 0) {
      status = 'empty';
    } else if (qty < item.safetyStock) {
      status = 'low';
    }

    return {
      ...item,
      qty,
      avgPrice,
      valuation,
      status
    };
  });

  const totalValuation = inventorySummary.reduce((sum, i) => sum + i.valuation, 0);

  // Expiry monitoring (list all active batches with qty > 0)
  // To do this simply and reliably:
  // We look at all "masuk" transactions. For each batch, we estimate if there's stock left.
  // A simple approximation: if the item's total current stock is X, we distribute X across the newest incoming batches of that item.
  // Or, we can just display all incoming batches sorted by expiry date, showing their original quantities, expiry dates, and highlights if they are nearing expiration!
  const today = new Date();
  const getBatchExpiryList = () => {
    const list = [];
    items.forEach(item => {
      const itemCurrentQty = getSystemQty(item.id);
      if (itemCurrentQty <= 0) return;

      const itemPurchases = stockTransactions
        .filter(tx => tx.itemId === item.id && tx.type === 'masuk' && tx.expiryDate)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // FEFO sort (oldest expiry first)
      
      // Distribute current qty across batches starting from oldest (FIFO/FEFO usage assumption)
      // Wait, if we use FEFO, we assume the oldest expiry batches are consumed first.
      // So the remaining stock belongs to the newest expiry batches.
      // Let's list the purchases and allocate the remaining current stock to the latest batches.
      let remainingToAllocate = itemCurrentQty;
      // Sort purchases in reverse (newest expiry first) to allocate stock
      const purchasesNewestFirst = [...itemPurchases].reverse();
      
      purchasesNewestFirst.forEach(purchase => {
        if (remainingToAllocate <= 0) return;
        
        const allocatedQty = Math.min(purchase.qty, remainingToAllocate);
        remainingToAllocate -= allocatedQty;

        const expDate = new Date(purchase.expiryDate);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let expStatus = 'fresh'; // fresh, soon, expired
        if (diffDays < 0) {
          expStatus = 'expired';
        } else if (diffDays <= 30) {
          expStatus = 'soon';
        }

        list.push({
          itemId: item.id,
          itemName: item.name,
          unit: item.unit,
          batchCode: purchase.batchCode,
          supplier: purchase.supplier,
          expiryDate: purchase.expiryDate,
          qty: allocatedQty,
          daysLeft: diffDays,
          expStatus
        });
      });
    });

    return list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  const activeBatches = getBatchExpiryList();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Overview Cards */}
      <div className="grid-stats" style={{ marginBottom: '24px' }}>
        <div className="stat-card primary">
          <div className="stat-header">
            <span className="stat-title">Jumlah Item Bahan Baku</span>
            <span>📦</span>
          </div>
          <div className="stat-value">{items.length} Item</div>
          <div className="stat-desc">Bahan basah, kering & gas dapur</div>
        </div>
        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-title">Total Nilai Aset Stok</span>
            <span>💰</span>
          </div>
          <div className="stat-value">{formatIDR(totalValuation)}</div>
          <div className="stat-desc">Valuasi stok berdasarkan harga beli</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-header">
            <span className="stat-title">Item Di Bawah Safety Stock</span>
            <span>⚠️</span>
          </div>
          <div className="stat-value">
            {inventorySummary.filter(i => i.status === 'low' || i.status === 'empty').length} Item
          </div>
          <div className="stat-desc">Perlu segera dilakukan pemesanan</div>
        </div>
      </div>

      {/* Main Stock Summary Card */}
      <div className="page-card" style={{ marginBottom: '32px' }}>
        <div className="page-card-header">
          <div className="page-card-title">
            <span>Posisi Sisa Stok & Valuasi Barang</span>
          </div>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Cetak Sisa Stok</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="table-sppg">
            <thead>
              <tr>
                <th>Nama Bahan Makanan</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'center' }}>Sisa Stok</th>
                <th style={{ textAlign: 'center' }}>Safety Level</th>
                <th style={{ textAlign: 'right' }}>Harga Rata-Rata</th>
                <th style={{ textAlign: 'right' }}>Nilai Valuasi Aset</th>
                <th style={{ textAlign: 'center' }}>Status Level</th>
              </tr>
            </thead>
            <tbody>
              {inventorySummary.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td><span className="badge badge-neutral">{item.category}</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {item.safetyStock} {item.unit}
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatIDR(item.avgPrice)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatIDR(item.valuation)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.status === 'empty' ? (
                      <span className="badge badge-danger">Kosong</span>
                    ) : item.status === 'low' ? (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={10} /> Tipis
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={10} /> Aman
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="table-total-row">
                <td colSpan="5" style={{ textAlign: 'right' }}>TOTAL KEKAYAAN ASET STOK:</td>
                <td style={{ textAlign: 'right', color: 'var(--primary)' }}>{formatIDR(totalValuation)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FEFO Batch Expiry Alerts Card */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title" style={{ color: 'var(--warning)' }}>
            <Calendar size={18} />
            <span>FEFO Tracker - Pemantauan Masa Kadaluwarsa Bahan</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table-sppg">
            <thead>
              <tr>
                <th>Nama Bahan Makanan</th>
                <th>Kode Batch</th>
                <th>Pemasok</th>
                <th style={{ textAlign: 'center' }}>Sisa Stok Batch</th>
                <th style={{ textAlign: 'center' }}>Tanggal Kedaluwarsa</th>
                <th style={{ textAlign: 'center' }}>Hari Tersisa</th>
                <th style={{ textAlign: 'center' }}>Status FEFO</th>
              </tr>
            </thead>
            <tbody>
              {activeBatches.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Tidak ada batch aktif dengan data kedaluwarsa.
                  </td>
                </tr>
              ) : (
                activeBatches.map((batch, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>{batch.itemName}</td>
                    <td><span className="badge badge-neutral">{batch.batchCode}</span></td>
                    <td style={{ fontSize: '13px' }}>{batch.supplier}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{batch.qty} {batch.unit}</td>
                    <td style={{ textAlign: 'center' }}>{batch.expiryDate}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>
                      {batch.expStatus === 'expired' ? (
                        <span style={{ color: 'var(--danger)' }}>Kedaluwarsa</span>
                      ) : (
                        <span>{batch.daysLeft} Hari</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {batch.expStatus === 'expired' ? (
                        <span className="badge badge-danger">⚠️ KADALUWARSA</span>
                      ) : batch.expStatus === 'soon' ? (
                        <span className="badge badge-warning">⏳ GUNAKAN SEGERA</span>
                      ) : (
                        <span className="badge badge-success">Fresh (Aman)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>BADAN GIZI NASIONAL</h2>
          <h3>LAPORAN SISA STOK BARANG & VALUASI SPPG {profile.name.toUpperCase()}</h3>
          <p>Laporan inventarisasi sisa kuantitas barang, batas minimum safety stock, dan nilai rupiah aset gudang.</p>
        </div>
      </div>
    </div>
  );
}
