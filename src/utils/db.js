import { createClient } from '@supabase/supabase-js';

const DB_KEY = 'sppg_bgn_db';
const SUPABASE_CONFIG_KEY = 'sppg_supabase_config';

// Initial Mock Data (Same as before)
const INITIAL_DATA = {
  profile: {
    name: 'Apri',
    kelurahan: 'Kel 1',
    kecamatan: 'Keca1',
    kabupaten: 'Kab 1',
    provinsi: 'Prov1',
    address: 'Gedung E Kompleks Kementerian Pertanian, Jalan Harsono RM No 3 Ragunan, Pasar Minggu Jakarta 12550',
    logoUrl: ''
  },
  credentials: {
    username: 'admin',
    password: 'admin'
  },
  budgets: {
    'Bahan Makanan': 500000000,
    'Sewa Tempat': 50000000,
    'Operasional & ATK': 30000000,
    'Gaji & Honor': 100000000,
    'Peralatan': 40000000,
    'BBM & Distribusi': 20000000
  },
  bukuKas: [
    {
      id: 'tx-001',
      date: '2025-10-01',
      proofNo: '001',
      description: 'Penerimaan dari dana BGN',
      type: 'pemasukan',
      amount: 329664000,
      source: 'Kas Umum',
      category: 'Penerimaan'
    },
    {
      id: 'tx-002',
      date: '2025-10-02',
      proofNo: '002',
      description: 'Belanja ATK Kantor',
      type: 'pengeluaran',
      amount: 115200,
      source: 'Kas Umum',
      category: 'Operasional & ATK'
    },
    {
      id: 'tx-003',
      date: '2025-10-02',
      proofNo: '003',
      description: 'Pembelian sabun cuci piring',
      type: 'pengeluaran',
      amount: 354984,
      source: 'Kas Umum',
      category: 'Operasional & ATK'
    },
    {
      id: 'tx-004',
      date: '2025-10-27',
      proofNo: '004',
      description: 'Belanja Plastik Perlengkapan Dapur',
      type: 'pengeluaran',
      amount: 217500,
      source: 'Kas Umum',
      category: 'Operasional & ATK'
    },
    {
      id: 'tx-005',
      date: '2025-10-27',
      proofNo: '005',
      description: 'Pembayaran sewa gedung bulan Oktober',
      type: 'pengeluaran',
      amount: 54432000,
      source: 'Kas Umum',
      category: 'Sewa Tempat'
    },
    {
      id: 'tx-006',
      date: '2025-10-27',
      proofNo: '006',
      description: 'Belanja Gas Elpiji 12kg (6 tabung)',
      type: 'pengeluaran',
      amount: 780000,
      source: 'Kas Umum',
      category: 'Operasional & ATK'
    },
    {
      id: 'tx-007',
      date: '2025-10-27',
      proofNo: '007',
      description: 'Belanja BBM Mobil Distribusi I',
      type: 'pengeluaran',
      amount: 50000,
      source: 'Kas Umum',
      category: 'BBM & Distribusi'
    },
    {
      id: 'tx-kk-001',
      date: '2025-10-03',
      proofNo: 'KK-001',
      description: 'Pembelian Cabai, Tomat & Sayuran Segar',
      type: 'pengeluaran',
      amount: 150000,
      source: 'Kas Kecil',
      category: 'Bahan Makanan'
    },
    {
      id: 'tx-kk-002',
      date: '2025-10-04',
      proofNo: 'KK-002',
      description: 'Pembelian Telur Ayam Ras 5kg',
      type: 'pengeluaran',
      amount: 140000,
      source: 'Kas Kecil',
      category: 'Bahan Makanan'
    }
  ],
  items: [
    { id: 'item-1', name: 'Beras Medium', unit: 'kg', safetyStock: 100, category: 'Bahan Kering' },
    { id: 'item-2', name: 'Minyak Goreng', unit: 'liter', safetyStock: 30, category: 'Bahan Kering' },
    { id: 'item-3', name: 'Telur Ayam Ras', unit: 'kg', safetyStock: 50, category: 'Bahan Basah' },
    { id: 'item-4', name: 'Daging Ayam Fillet', unit: 'kg', safetyStock: 40, category: 'Bahan Basah' },
    { id: 'item-5', name: 'Cabai Merah Keriting', unit: 'kg', safetyStock: 10, category: 'Bahan Basah' },
    { id: 'item-6', name: 'Gas LPG 12kg', unit: 'pcs', safetyStock: 5, category: 'Lain-lain' },
    { id: 'item-7', name: 'Sayur Wortel', unit: 'kg', safetyStock: 15, category: 'Bahan Basah' }
  ],
  stockTransactions: [
    {
      id: 'st-001',
      itemId: 'item-1',
      date: '2025-10-01',
      type: 'masuk',
      qty: 500,
      price: 14000,
      supplier: 'Bulog Divre 1',
      batchCode: 'BGN-BRS-001',
      expiryDate: '2026-10-01',
      qc: { packaging: 'OK', physical: 'OK', temp: '-', checked: true }
    },
    {
      id: 'st-002',
      itemId: 'item-2',
      date: '2025-10-02',
      type: 'masuk',
      qty: 100,
      price: 16000,
      supplier: 'Minyak Kita Distributor',
      batchCode: 'BGN-MYK-012',
      expiryDate: '2026-04-15',
      qc: { packaging: 'OK', physical: 'OK', temp: '-', checked: true }
    },
    {
      id: 'st-003',
      itemId: 'item-3',
      date: '2025-10-03',
      type: 'masuk',
      qty: 200,
      price: 28000,
      supplier: 'Peternakan Berkah',
      batchCode: 'BGN-TLR-098',
      expiryDate: '2025-10-25',
      qc: { packaging: 'OK', physical: 'OK', temp: '15°C', checked: true }
    },
    {
      id: 'st-004',
      itemId: 'item-1',
      date: '2025-10-04',
      type: 'keluar',
      qty: 50,
      price: 14000,
      notes: 'Penggunaan produksi menu Senin',
      menuName: 'Nasi Tim Ayam Kecap'
    },
    {
      id: 'st-005',
      itemId: 'item-3',
      date: '2025-10-04',
      type: 'keluar',
      qty: 15,
      price: 28000,
      notes: 'Penggunaan produksi menu Senin',
      menuName: 'Nasi Tim Ayam Kecap'
    }
  ],
  stockOpname: [
    {
      id: 'so-001',
      date: '2025-10-31',
      itemId: 'item-1',
      auditType: 'Bulanan',
      systemQty: 450,
      actualQty: 448,
      discrepancy: -2,
      notes: '2 kg susut penyimpanan (kelembaban udara)',
      operator: 'Budi Santoso'
    }
  ],
  tempLogs: [
    {
      id: 'temp-001',
      date: '2026-06-12',
      chiller: 3.2,
      freezer: -19.5,
      dryStorage: 25.8,
      notes: 'Pagi hari, kelistrikan stabil',
      operator: 'Toni Wijaya'
    },
    {
      id: 'temp-002',
      date: '2026-06-13',
      chiller: 4.0,
      freezer: -18.2,
      dryStorage: 26.1,
      notes: 'Siang hari, cuaca panas di luar',
      operator: 'Toni Wijaya'
    }
  ]
};

// Local storage helpers
export const getLocalDB = () => {
  const dbStr = localStorage.getItem(DB_KEY);
  if (!dbStr) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  try {
    const parsed = JSON.parse(dbStr);
    // Jika data tidak valid, kosong, atau tidak memiliki properti kunci (profile/credentials)
    // reset ke INITIAL_DATA agar aplikasi tidak crash karena data korup.
    if (!parsed || !parsed.profile || !parsed.credentials) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
};

export const saveLocalDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// Supabase config helpers (Prepopulated with User's Supabase credentials)
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://bwmeeeajnmmgzbocznun.supabase.co',
  anonKey: 'sb_publishable_YczwyCL_ufJnWynqmHF_fQ_t1Wig55r',
  isConnected: true
};

export const getSupabaseConfig = () => {
  const config = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (!config) {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(DEFAULT_SUPABASE_CONFIG));
    return DEFAULT_SUPABASE_CONFIG;
  }
  try {
    const parsed = JSON.parse(config);
    // Jika url kosong, otomatis gunakan default config agar langsung tersambung ke cloud
    if (!parsed.url || parsed.url.trim() === '') {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(DEFAULT_SUPABASE_CONFIG));
      return DEFAULT_SUPABASE_CONFIG;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_SUPABASE_CONFIG;
  }
};

export const saveSupabaseConfig = (config) => {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
};

// Initialize connection client
let supabaseClient = null;
const initSupabase = () => {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey && config.isConnected) {
    if (!supabaseClient) {
      supabaseClient = createClient(config.url, config.anonKey);
    }
    return supabaseClient;
  }
  return null;
};

// Fetch data from Supabase or fallback to LocalStorage
export const getDB = async () => {
  const client = initSupabase();
  const localData = getLocalDB();
  
  if (!client) {
    return localData;
  }

  try {
    const { data, error } = await client
      .from('sppg_state')
      .select('data')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        await client.from('sppg_state').insert({ id: 1, data: localData });
        return localData;
      }
      throw error;
    }

    if (data && data.data && Object.keys(data.data).length > 0 && data.data.credentials) {
      saveLocalDB(data.data);
      return data.data;
    }

    // Jika data di cloud masih kosong atau tidak valid (misal baru dibuat via SQL Editor),
    // isi database cloud dengan data lokal saat ini agar kredensial admin tidak hilang.
    if (data && data.data && (Object.keys(data.data).length === 0 || !data.data.credentials)) {
      await client.from('sppg_state').update({ data: localData, updated_at: new Date() }).eq('id', 1);
      return localData;
    }

    return localData;
  } catch (e) {
    console.error('Supabase fetch failed, falling back to LocalStorage:', e);
    return localData;
  }
};

// Save database state (Local and Cloud in background)
export const saveDB = async (data) => {
  saveLocalDB(data);
  window.dispatchEvent(new Event('sppg_db_update'));

  const client = initSupabase();
  if (client) {
    try {
      await client
        .from('sppg_state')
        .update({ data: data, updated_at: new Date() })
        .eq('id', 1);
    } catch (e) {
      console.error('Supabase upload failed:', e);
    }
  }
};
