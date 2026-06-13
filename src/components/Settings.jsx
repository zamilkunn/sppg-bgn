import React, { useState } from 'react';
import { Sliders, Save, ShieldCheck, Download, Upload, Plus, Trash2 } from 'lucide-react';

export default function Settings({ 
  profile, setProfile, 
  credentials, setCredentials, 
  budgets, setBudgets, 
  items, setItems, 
  fullDB, onImportDB 
}) {
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [credForm, setCredForm] = useState({ ...credentials });
  const [budgetForm, setBudgetForm] = useState({ ...budgets });

  // New Item Master State
  const [newItem, setNewItem] = useState({
    name: '',
    unit: 'kg',
    safetyStock: '',
    category: 'Bahan Kering'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(profileForm);
    alert('Informasi SPPG berhasil disimpan!');
  };

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    setCredentials(credForm);
    alert('Kredensial keamanan berhasil diperbarui!');
  };

  const handleSaveBudgets = (e) => {
    e.preventDefault();
    setBudgets(budgetForm);
    alert('Pagu anggaran berhasil diperbarui!');
  };

  const handleAddMasterItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.safetyStock) return;

    const created = {
      id: 'item-' + Date.now(),
      name: newItem.name,
      unit: newItem.unit,
      safetyStock: parseFloat(newItem.safetyStock),
      category: newItem.category
    };

    setItems([...items, created]);
    setNewItem({
      name: '',
      unit: 'kg',
      safetyStock: '',
      category: 'Bahan Kering'
    });
  };

  const handleDeleteMasterItem = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini? Transaksi stok lama item ini tidak akan terhapus namun item tidak dapat dipilih lagi.')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleExportDB = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDB, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SPPG_BGN_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleImportDB = (e) => {
    const fileReader = new FileReader();
    if (e.target.files.length === 0) return;
    
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.profile && parsed.credentials && parsed.bukuKas && parsed.items) {
          onImportDB(parsed);
          alert('Database berhasil di-import! Halaman akan dimuat ulang.');
          window.location.reload();
        } else {
          alert('Format berkas backup JSON tidak cocok/tidak valid!');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON!');
      }
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. SPPG Profile Details */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title">
            <Sliders size={18} style={{ color: 'var(--primary)' }} />
            <span>Informasi Satuan Pelayanan (SPPG)</span>
          </div>
        </div>
        <form onSubmit={handleSaveProfile}>
          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Nama SPPG</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Kelurahan / Desa</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.kelurahan}
                onChange={(e) => setProfileForm(prev => ({ ...prev, kelurahan: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Kecamatan</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.kecamatan}
                onChange={(e) => setProfileForm(prev => ({ ...prev, kecamatan: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Kabupaten / Kota</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.kabupaten}
                onChange={(e) => setProfileForm(prev => ({ ...prev, kabupaten: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Provinsi</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.provinsi}
                onChange={(e) => setProfileForm(prev => ({ ...prev, provinsi: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group form-group-full">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Alamat Resmi Lembaga (Untuk Cetakan PDF)</label>
              <textarea
                className="form-control"
                value={profileForm.address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                rows="2"
                required
              ></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            <span>Simpan Informasi SPPG</span>
          </button>
        </form>
      </div>

      {/* 2. Security Login Credentials */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title">
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
            <span>Pengaturan Kredensial Keamanan Admin</span>
          </div>
        </div>
        <form onSubmit={handleSaveCredentials}>
          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Username Baru</label>
              <input
                type="text"
                className="form-control"
                value={credForm.username}
                onChange={(e) => setCredForm(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Password Baru</label>
              <input
                type="password"
                className="form-control"
                value={credForm.password}
                onChange={(e) => setCredForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            <span>Perbarui Sandi</span>
          </button>
        </form>
      </div>

      {/* 3. Budget Limits Configurations */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title">
            <span>Konfigurasi Pagu Anggaran Pagu SPPG</span>
          </div>
        </div>
        <form onSubmit={handleSaveBudgets}>
          <div className="form-grid" style={{ marginBottom: '20px' }}>
            {Object.keys(budgets).map((cat) => (
              <div key={cat} className="filter-group">
                <label className="input-label" style={{ color: 'var(--text-main)' }}>{cat}</label>
                <input
                  type="number"
                  className="form-control"
                  value={budgetForm[cat]}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, [cat]: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            <span>Simpan Pagu Anggaran</span>
          </button>
        </form>
      </div>

      {/* 4. Master Inventory Items Editor */}
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-card-title">
            <span>Daftar Master Barang & Bahan Dapur</span>
          </div>
        </div>
        
        {/* Add new master item inline form */}
        <form onSubmit={handleAddMasterItem} style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Tambah Master Item Baru</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="filter-group" style={{ flex: '2 1 180px' }}>
              <span className="filter-label">Nama Bahan Baku</span>
              <input
                type="text"
                placeholder="Contoh: Sayur Bayam"
                className="form-control"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group" style={{ flex: '1 1 80px' }}>
              <span className="filter-label">Satuan Ukur</span>
              <input
                type="text"
                placeholder="kg, liter, pcs"
                className="form-control"
                value={newItem.unit}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group" style={{ flex: '1 1 100px' }}>
              <span className="filter-label">Safety Stock</span>
              <input
                type="number"
                placeholder="Limit aman"
                className="form-control"
                value={newItem.safetyStock}
                onChange={(e) => setNewItem(prev => ({ ...prev, safetyStock: e.target.value }))}
                required
              />
            </div>
            <div className="filter-group" style={{ flex: '1 1 120px' }}>
              <span className="filter-label">Kategori</span>
              <select
                className="form-control"
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Bahan Kering">Bahan Kering (Sembako)</option>
                <option value="Bahan Basah">Bahan Basah (Segar)</option>
                <option value="Lain-lain">Lain-lain / Tabung Gas</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 16px' }}>
              <Plus size={16} />
              <span>Tambah</span>
            </button>
          </div>
        </form>

        {/* List of master items */}
        <div className="table-responsive">
          <table className="table-sppg">
            <thead>
              <tr>
                <th>Nama Bahan Makanan</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'center' }}>Satuan</th>
                <th style={{ textAlign: 'center' }}>Limit Safety Stock</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td><span className="badge badge-neutral">{item.category}</span></td>
                  <td style={{ textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.safetyStock} {item.unit}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteMasterItem(item.id)}
                      className="btn btn-secondary btn-icon-only"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      title="Hapus Master Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Database Management (Backup & Restore) */}
      <div className="page-card" style={{ background: 'var(--primary-light)', border: '1px dashed var(--primary)' }}>
        <div className="page-card-header">
          <div className="page-card-title" style={{ color: 'var(--primary)' }}>
            <span>Penyimpanan Backup & Pemulihan Database SPPG</span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Karena seluruh data Anda disimpan secara lokal di dalam browser web komputer ini, menghapus histori browser dapat menghapus seluruh data pencatatan kas & stok. Gunakan alat ekspor di bawah ini secara teratur untuk membackup database SPPG Anda ke harddisk komputer Anda dalam format file berkas `.json`.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={handleExportDB}>
            <Download size={16} />
            <span>Ekspor & Unduh Backup (JSON)</span>
          </button>
          
          <label className="btn btn-secondary" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Impor & Pulihkan Database</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportDB}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

    </div>
  );
}
