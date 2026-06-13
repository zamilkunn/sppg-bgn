import React, { useState } from 'react';
import { Thermometer, Plus, ShieldCheck, AlertTriangle, Printer } from 'lucide-react';

export default function KontrolSuhu({ tempLogs, setTempLogs, profile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    chiller: '',
    freezer: '',
    dryStorage: '',
    notes: '',
    operator: ''
  });

  const handleAddTempLog = (e) => {
    e.preventDefault();
    const newLog = {
      id: 'temp-' + Date.now(),
      date: formData.date,
      chiller: parseFloat(formData.chiller),
      freezer: parseFloat(formData.freezer),
      dryStorage: parseFloat(formData.dryStorage),
      notes: formData.notes || 'Pengukuran suhu normal',
      operator: formData.operator || 'Toni Wijaya'
    };

    setTempLogs([newLog, ...tempLogs]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      chiller: '',
      freezer: '',
      dryStorage: '',
      notes: '',
      operator: ''
    });
  };

  // Standards check
  const isChillerOK = (temp) => temp >= 0 && temp <= 4;
  const isFreezerOK = (temp) => temp <= -18;
  const isDryStorageOK = (temp) => temp >= 15 && temp <= 28;

  const latestLog = tempLogs[0] || { chiller: '-', freezer: '-', dryStorage: '-', date: 'Belum ada data', operator: '-' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Latest Temperature Gauges */}
      <div className="temp-gauge-grid">
        {/* Chiller Gauge */}
        <div className="temp-gauge-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>
            <Thermometer size={18} />
            <span>KULKAS / CHILLER (Bahan Basah)</span>
          </div>
          <div className="temp-value-large" style={{ color: latestLog.chiller !== '-' && isChillerOK(latestLog.chiller) ? 'var(--success)' : 'var(--danger)' }}>
            {latestLog.chiller} <span className="temp-unit">°C</span>
          </div>
          <div className="temp-limits">Standar: 0°C s.d 4°C</div>
          <div style={{ marginTop: '12px' }}>
            {latestLog.chiller === '-' ? (
              <span className="badge badge-neutral">No Data</span>
            ) : isChillerOK(latestLog.chiller) ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={10} /> Sesuai Standar
              </span>
            ) : (
              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={10} /> Diluar Batas!
              </span>
            )}
          </div>
        </div>

        {/* Freezer Gauge */}
        <div className="temp-gauge-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>
            <Thermometer size={18} />
            <span>FREEZER (Daging/Baku)</span>
          </div>
          <div className="temp-value-large" style={{ color: latestLog.freezer !== '-' && isFreezerOK(latestLog.freezer) ? 'var(--success)' : 'var(--danger)' }}>
            {latestLog.freezer} <span className="temp-unit">°C</span>
          </div>
          <div className="temp-limits">Standar: &lt;= -18°C</div>
          <div style={{ marginTop: '12px' }}>
            {latestLog.freezer === '-' ? (
              <span className="badge badge-neutral">No Data</span>
            ) : isFreezerOK(latestLog.freezer) ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={10} /> Sesuai Standar
              </span>
            ) : (
              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={10} /> Suhu Terlalu Panas!
              </span>
            )}
          </div>
        </div>

        {/* Dry Storage Gauge */}
        <div className="temp-gauge-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>
            <Thermometer size={18} />
            <span>GUDANG KERING (Beras/Sembako)</span>
          </div>
          <div className="temp-value-large" style={{ color: latestLog.dryStorage !== '-' && isDryStorageOK(latestLog.dryStorage) ? 'var(--success)' : 'var(--danger)' }}>
            {latestLog.dryStorage} <span className="temp-unit">°C</span>
          </div>
          <div className="temp-limits">Standar: 15°C s.d 28°C</div>
          <div style={{ marginTop: '12px' }}>
            {latestLog.dryStorage === '-' ? (
              <span className="badge badge-neutral">No Data</span>
            ) : isDryStorageOK(latestLog.dryStorage) ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={10} /> Sesuai Standar
              </span>
            ) : (
              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={10} /> Lembab / Panas!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Temp Logs List Card */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title">
            <span>Log Pemantauan Harian Kartu Suhu</span>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Cetak Kartu Suhu</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Catat Pengukuran Baru</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table-sppg">
            <thead>
              <tr>
                <th>Tanggal Pengukuran</th>
                <th style={{ textAlign: 'center' }}>Suhu Chiller</th>
                <th style={{ textAlign: 'center' }}>Suhu Freezer</th>
                <th style={{ textAlign: 'center' }}>Suhu Gudang Kering</th>
                <th>Pemeriksa (Operator)</th>
                <th>Catatan Keadaan</th>
                <th style={{ textAlign: 'center' }}>Status Kelayakan</th>
              </tr>
            </thead>
            <tbody>
              {tempLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Belum ada pencatatan suhu gudang harian.
                  </td>
                </tr>
              ) : (
                tempLogs.map((log) => {
                  const checkChiller = isChillerOK(log.chiller);
                  const checkFreezer = isFreezerOK(log.freezer);
                  const checkDry = isDryStorageOK(log.dryStorage);
                  const overallOK = checkChiller && checkFreezer && checkDry;

                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '600' }}>{log.date}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: checkChiller ? 'var(--success)' : 'var(--danger)' }}>
                        {log.chiller} °C
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: checkFreezer ? 'var(--success)' : 'var(--danger)' }}>
                        {log.freezer} °C
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: checkDry ? 'var(--success)' : 'var(--danger)' }}>
                        {log.dryStorage} °C
                      </td>
                      <td>{log.operator}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{log.notes}</td>
                      <td style={{ textAlign: 'center' }}>
                        {overallOK ? (
                          <span className="badge badge-success">SANGAT LAYAK</span>
                        ) : (
                          <span className="badge badge-danger">⚠️ PERLU PENGECEKAN</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="print-only-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>BADAN GIZI NASIONAL</h2>
          <h3>KARTU KONTROL SUHU FASILITAS PENYIMPANAN SPPG {profile.name.toUpperCase()}</h3>
          <p>Kartu kendali pemantauan suhu harian pendingin makanan dan gudang sembako sesuai regulasi gizi nasional.</p>
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

      {/* Log Temp Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Catat Pengukuran Suhu Baru</span>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTempLog}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Tanggal Cek</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Nama Pemeriksa</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Toni Wijaya"
                      value={formData.operator}
                      onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Suhu Chiller (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="Kulkas Basah (0 - 4)"
                      value={formData.chiller}
                      onChange={(e) => setFormData(prev => ({ ...prev, chiller: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Suhu Freezer (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="Freezer Beku (<= -18)"
                      value={formData.freezer}
                      onChange={(e) => setFormData(prev => ({ ...prev, freezer: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Suhu Gudang Kering (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="Gudang Sembako (15 - 28)"
                      value={formData.dryStorage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dryStorage: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="filter-group form-group-full">
                    <label className="input-label" style={{ color: 'var(--text-main)' }}>Keterangan / Kondisi Fisik Alat</label>
                    <textarea
                      className="form-control"
                      placeholder="Contoh: Lampu kulkas mati, kelistrikan normal, kompresor halus"
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
                  Simpan Catatan Suhu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
