import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const STORAGE_KEY = 'aura_pos_bank_accounts';

const INITIAL_BANK_ACCOUNTS = [
  {
    id: 1,
    bank_code: 'ACB',
    bank_name: 'Ngân hàng Á Châu (ACB)',
    bin: '970416',
    account_number: '28569967',
    account_name: 'MA GIA TUAN',
    branch: 'Chi nhánh Phú Quốc',
    is_default: true,
    is_active: true,
    qr_template: 'compact2',
    notes: 'Tài khoản chính nhận tiền VietQR'
  },
  {
    id: 2,
    bank_code: 'MB',
    bank_name: 'Ngân hàng TMCP Quân đội (MBBank)',
    bin: '970422',
    account_number: '0348974111',
    account_name: 'QUAN TRA',
    branch: 'Chi nhánh Phú Quốc',
    is_default: false,
    is_active: true,
    qr_template: 'compact2',
    notes: 'Hotline quán trà'
  }
];

/**
 * Custom Hook: Quản lý danh sách tài khoản ngân hàng & Cổng SePay
 * Hỗ trợ offline/local fallback khi MySQL chưa khởi động
 */
export function useBankAccounts() {
  const [bankAccounts, setBankAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_BANK_ACCOUNTS;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBankAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBankAccounts();
      if (res && res.success && Array.isArray(res.bank_accounts) && res.bank_accounts.length > 0) {
        setBankAccounts(res.bank_accounts);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(res.bank_accounts)); } catch (e) {}
      }
    } catch (err) {
      console.warn('Lỗi khi nạp danh sách từ backend, dùng bộ nhớ cục bộ:', err);
      // Fallback to localStorage or initial
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBankAccounts(parsed);
          }
        }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const setDefaultAccount = async (id) => {
    let apiSuccess = false;
    try {
      const res = await api.setDefaultBankAccount(id);
      if (res && res.success) {
        apiSuccess = true;
      }
    } catch (err) {
      console.warn('Backend setDefault error, using local fallback:', err);
    }

    setBankAccounts(prev => {
      const updated = prev.map(acc => ({
        ...acc,
        is_default: acc.id === id
      }));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    return { success: true };
  };

  const deleteAccount = async (id) => {
    try {
      await api.deleteBankAccount(id);
    } catch (err) {
      console.warn('Backend delete error, using local fallback:', err);
    }

    setBankAccounts(prev => {
      const updated = prev.filter(acc => acc.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    return { success: true };
  };

  const defaultAccount = bankAccounts.find(acc => acc.is_default) || bankAccounts[0] || null;

  return {
    bankAccounts,
    setBankAccounts,
    defaultAccount,
    loading,
    error,
    fetchBankAccounts,
    setDefaultAccount,
    deleteAccount,
  };
}
