import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

/**
 * Custom Hook: Quản lý danh sách tài khoản ngân hàng & Cổng SePay
 */
export function useBankAccounts() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBankAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBankAccounts();
      if (res && res.success) {
        setBankAccounts(res.bank_accounts || []);
      }
    } catch (err) {
      console.error('Lỗi khi nạp danh sách tài khoản ngân hàng:', err);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const setDefaultAccount = async (id) => {
    try {
      const res = await api.setDefaultBankAccount(id);
      if (res && res.success) {
        await fetchBankAccounts();
        return { success: true };
      }
      return { success: false, message: res?.message };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || err.message };
    }
  };

  const deleteAccount = async (id) => {
    try {
      const res = await api.deleteBankAccount(id);
      if (res && res.success) {
        await fetchBankAccounts();
        return { success: true };
      }
      return { success: false, message: res?.message };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || err.message };
    }
  };

  const defaultAccount = bankAccounts.find(acc => acc.is_default) || bankAccounts[0] || null;

  return {
    bankAccounts,
    defaultAccount,
    loading,
    error,
    fetchBankAccounts,
    setDefaultAccount,
    deleteAccount,
  };
}

