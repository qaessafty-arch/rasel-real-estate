import { Property, Contract, FinancialTransaction, SystemStats } from '@/types';
import { INITIAL_PROPERTIES, INITIAL_CONTRACTS, INITIAL_TRANSACTIONS } from './mockData';
import { getSupabase, getSupabaseConfig } from './supabase';

const STORAGE_KEYS = {
  PROPERTIES: 'rasel_real_estate_properties_v1',
  CONTRACTS: 'rasel_real_estate_contracts_v1',
  TRANSACTIONS: 'rasel_real_estate_transactions_v1',
  AUTH: 'rasel_auth_session_v1',
  SETTINGS: 'rasel_settings_v1',
};

// Safe localStorage access helper
function isStorageInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('rasel_storage_initialized_v2') === 'true';
}

function markStorageInitialized(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rasel_storage_initialized_v2', 'true');
}

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error reading localStorage key', key, e);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage key', key, e);
  }
}

export const dataService = {
  // -------------------------------------------------------------
  // PROPERTIES
  // -------------------------------------------------------------
  async getProperties(): Promise<Property[]> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Keep local cache synced
          setLocal(STORAGE_KEYS.PROPERTIES, data);
          return data as Property[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    // Local fallback
    let list = getLocal<Property[]>(STORAGE_KEYS.PROPERTIES, []);
    if (!list || list.length === 0) {
      list = INITIAL_PROPERTIES;
      setLocal(STORAGE_KEYS.PROPERTIES, list);
      markStorageInitialized();
    }
    return list || [];
  },

  async saveProperty(property: Property): Promise<Property> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('properties')
          .upsert(property)
          .select()
          .single();

        if (error) throw error;
        // Also sync local cache
        const local = getLocal<Property[]>(STORAGE_KEYS.PROPERTIES, []);
        const idx = local.findIndex((p) => p.id === property.id);
        if (idx >= 0) local[idx] = data;
        else local.unshift(data);
        setLocal(STORAGE_KEYS.PROPERTIES, local);
        return data;
      } catch (err) {
        console.warn('Supabase save failed, saving locally:', err);
      }
    }

    // Local storage save
    const list = getLocal<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const existingIndex = list.findIndex((p) => p.id === property.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...property, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...property, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setLocal(STORAGE_KEYS.PROPERTIES, list);
    return property;
  },

  async deleteProperty(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('properties').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    const list = getLocal<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const filtered = list.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.PROPERTIES, filtered);
    return true;
  },

  // -------------------------------------------------------------
  // CONTRACTS
  // -------------------------------------------------------------
  async getContracts(): Promise<Contract[]> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocal(STORAGE_KEYS.CONTRACTS, data);
          return data as Contract[];
        }
      } catch (err) {
        console.warn('Supabase contracts fetch failed:', err);
      }
    }

    let list = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, []);
    if (!list || list.length === 0) {
      list = INITIAL_CONTRACTS;
      setLocal(STORAGE_KEYS.CONTRACTS, list);
      markStorageInitialized();
    }
    return list || [];
  },

  async saveContract(contract: Contract): Promise<Contract> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('contracts').upsert(contract).select().single();
        if (!error && data) {
          const local = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, []);
          const idx = local.findIndex((c) => c.id === contract.id);
          if (idx >= 0) local[idx] = data;
          else local.unshift(data);
          setLocal(STORAGE_KEYS.CONTRACTS, local);
          return data;
        }
      } catch (err) {
        console.warn('Supabase contract save failed:', err);
      }
    }

    const list = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACTS);
    const idx = list.findIndex((c) => c.id === contract.id);
    if (idx >= 0) list[idx] = contract;
    else list.unshift(contract);
    setLocal(STORAGE_KEYS.CONTRACTS, list);
    return contract;
  },

  async deleteContract(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('contracts').delete().eq('id', id);
      } catch (err) {}
    }
    const list = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACTS);
    setLocal(STORAGE_KEYS.CONTRACTS, list.filter((c) => c.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // FINANCIAL TRANSACTIONS
  // -------------------------------------------------------------
  async getTransactions(): Promise<FinancialTransaction[]> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('financial_transactions')
          .select('*')
          .order('date', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocal(STORAGE_KEYS.TRANSACTIONS, data);
          return data as FinancialTransaction[];
        }
      } catch (err) {
        console.warn('Supabase transactions fetch failed:', err);
      }
    }

    let list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    if (!list || list.length === 0) {
      list = INITIAL_TRANSACTIONS;
      setLocal(STORAGE_KEYS.TRANSACTIONS, list);
      markStorageInitialized();
    }
    return list || [];
  },

  async saveTransaction(tx: FinancialTransaction): Promise<FinancialTransaction> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('financial_transactions')
          .upsert(tx)
          .select()
          .single();
        if (!error && data) {
          const local = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
          const idx = local.findIndex((t) => t.id === tx.id);
          if (idx >= 0) local[idx] = data;
          else local.unshift(data);
          setLocal(STORAGE_KEYS.TRANSACTIONS, local);
          return data;
        }
      } catch (err) {}
    }

    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const idx = list.findIndex((t) => t.id === tx.id);
    if (idx >= 0) list[idx] = tx;
    else list.unshift(tx);
    setLocal(STORAGE_KEYS.TRANSACTIONS, list);
    return tx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('financial_transactions').delete().eq('id', id);
      } catch (err) {}
    }
    const list = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocal(STORAGE_KEYS.TRANSACTIONS, list.filter((t) => t.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // SYNC LOCAL DATA TO SUPABASE
  // -------------------------------------------------------------
  async syncLocalToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    const config = getSupabaseConfig();
    if (!config) {
      return { success: false, count: 0, error: 'تکایە سەرەتا زانیارییەکانی Supabase بنووسە و پاشەکەوتی بکە.' };
    }

    try {
      const localProperties = getLocal<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
      const localContracts = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACTS);
      const localTransactions = getLocal<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);

      // Call backend route which handles UUID validation, formatting, and bypasses browser adblockers
      const res = await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: config.url,
          key: config.key,
          properties: localProperties,
          contracts: localContracts,
          transactions: localTransactions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'شکستی هێنا لە پەیوەندی بە سێرڤەر');
      }

      if (data.updatedProperties && data.updatedProperties.length > 0) {
        setLocal(STORAGE_KEYS.PROPERTIES, data.updatedProperties);
      }

      return {
        success: true,
        count: data.count || (localProperties.length + localContracts.length + localTransactions.length),
      };
    } catch (e: any) {
      return {
        success: false,
        count: 0,
        error: e?.message || 'هەڵە لە سینککردنی داتاکان',
      };
    }
  },

  // -------------------------------------------------------------
  // STATS CALCULATION
  // -------------------------------------------------------------
  calculateStats(
    properties: Property[],
    transactions: FinancialTransaction[]
  ): SystemStats {
    const totalProperties = properties.length;
    const availableProperties = properties.filter((p) => p.status === 'available').length;
    const rentedProperties = properties.filter((p) => p.status === 'rented').length;
    const soldProperties = properties.filter((p) => p.status === 'sold').length;

    let monthlyRentalIncomeUSD = 0;
    let monthlyRentalIncomeIQD = 0;

    properties.forEach((p) => {
      if (p.status === 'rented' && p.purpose === 'rent') {
        if (p.currency === 'USD') {
          monthlyRentalIncomeUSD += p.price;
        } else {
          monthlyRentalIncomeIQD += p.price;
        }
      }
    });

    let totalExpensesUSD = 0;
    let totalExpensesIQD = 0;
    let totalIncomeUSD = 0;
    let totalIncomeIQD = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        if (tx.currency === 'USD') totalExpensesUSD += Number(tx.amount);
        else totalExpensesIQD += Number(tx.amount);
      } else {
        if (tx.currency === 'USD') totalIncomeUSD += Number(tx.amount);
        else totalIncomeIQD += Number(tx.amount);
      }
    });

    const IQD_RATE = 1520;
    const netProfitUSD = (totalIncomeUSD + totalIncomeIQD / IQD_RATE) - (totalExpensesUSD + totalExpensesIQD / IQD_RATE);

    const totalInvestmentValueUSD = properties.reduce((acc, p) => {
      const val = p.currency === 'USD' ? p.price : p.price / IQD_RATE;
      return acc + val;
    }, 0);

    return {
      totalProperties,
      availableProperties,
      rentedProperties,
      soldProperties,
      monthlyRentalIncomeUSD,
      monthlyRentalIncomeIQD,
      totalExpensesUSD,
      totalExpensesIQD,
      netProfitUSD,
      totalInvestmentValueUSD,
    };
  },

  // -------------------------------------------------------------
  // BACKUP & RESTORE
  // -------------------------------------------------------------
  exportBackup(): string {
    const properties = getLocal(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const contracts = getLocal(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACTS);
    const transactions = getLocal(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);

    const backup = {
      system: 'Rasel Real Estate Management',
      version: '1.0',
      exported_at: new Date().toISOString(),
      properties,
      contracts,
      transactions,
    };

    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.properties && Array.isArray(parsed.properties)) {
        setLocal(STORAGE_KEYS.PROPERTIES, parsed.properties);
      }
      if (parsed.contracts && Array.isArray(parsed.contracts)) {
        setLocal(STORAGE_KEYS.CONTRACTS, parsed.contracts);
      }
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setLocal(STORAGE_KEYS.TRANSACTIONS, parsed.transactions);
      }
      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      return false;
    }
  },

  async clearAllData(clearSupabase: boolean = false): Promise<void> {
    setLocal(STORAGE_KEYS.PROPERTIES, []);
    setLocal(STORAGE_KEYS.CONTRACTS, []);
    setLocal(STORAGE_KEYS.TRANSACTIONS, []);
    markStorageInitialized();

    if (clearSupabase) {
      const sb = getSupabase();
      if (sb) {
        try {
          await sb.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await sb.from('contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await sb.from('financial_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (e) {
          console.warn('Could not clear Supabase tables completely:', e);
        }
      }
    }
  },

  resetDemoData(): void {
    setLocal(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    setLocal(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACTS);
    setLocal(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    markStorageInitialized();
  },
};
