import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

/**
 * Custom Hook: Quản lý logic Sổ Quỹ (Cash Book)
 * Tách biệt hoàn toàn Business Logic ra khỏi giao diện hiển thị (Clean Code / SRP)
 */
export function useCashBook() {
  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State bộ lọc
  const [fundType, setFundType] = useState('all'); // 'all', 'cash', 'bank'
  const [dateFilterMode, setDateFilterMode] = useState('preset'); // 'preset' | 'custom'
  const [presetOption, setPresetOption] = useState('thismonth');
  
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return getLocalDateString(d);
  });
  const [toDate, setToDate] = useState(() => getLocalDateString());

  const [includeReceipt, setIncludeReceipt] = useState(true);
  const [includePayment, setIncludePayment] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [businessFilter, setBusinessFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // State dữ liệu
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    opening_balance: 0,
    total_receipt: 0,
    total_payment: 0,
    closing_balance: 0,
    cash: { opening: 0, receipt: 0, payment: 0, closing: 0 },
    bank: { opening: 0, receipt: 0, payment: 0, closing: 0 }
  });

  // Tính toán khoảng thời gian theo preset
  const calculateDateRange = useCallback(() => {
    if (dateFilterMode === 'custom') {
      return { queryFrom: fromDate, queryTo: toDate };
    }

    const today = new Date();
    const todayStr = getLocalDateString(today);

    switch (presetOption) {
      case 'today':
        return { queryFrom: todayStr, queryTo: todayStr };
      case 'yesterday': {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = getLocalDateString(y);
        return { queryFrom: yStr, queryTo: yStr };
      }
      case 'last7days': {
        const l7 = new Date();
        l7.setDate(l7.getDate() - 6);
        return { queryFrom: getLocalDateString(l7), queryTo: todayStr };
      }
      case 'thismonth': {
        const m1 = new Date();
        m1.setDate(1);
        return { queryFrom: getLocalDateString(m1), queryTo: todayStr };
      }
      case 'all':
      default:
        return { queryFrom: '2020-01-01', queryTo: todayStr };
    }
  }, [dateFilterMode, presetOption, fromDate, toDate]);

  // Fetch danh sách phiếu thu/chi
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let docType = 'all';
      if (includeReceipt && !includePayment) docType = 'receipt';
      else if (!includeReceipt && includePayment) docType = 'payment';
      else if (!includeReceipt && !includePayment) docType = 'none';

      const { queryFrom, queryTo } = calculateDateRange();

      const res = await api.getCashTransactions({
        fund_type: fundType,
        doc_type: docType,
        category: categoryFilter,
        search: searchTerm,
        from_date: queryFrom,
        to_date: queryTo,
        is_business_result: businessFilter
      });

      if (res && res.success) {
        setTransactions(res.transactions || []);
        setSummary(res.summary || {});
      }
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu sổ quỹ:', err);
    } finally {
      setLoading(false);
    }
  }, [fundType, includeReceipt, includePayment, categoryFilter, searchTerm, businessFilter, calculateDateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Xóa phiếu
  const deleteTransaction = async (id) => {
    try {
      const res = await api.deleteCashTransaction(id);
      if (res && res.success) {
        await fetchTransactions();
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend delete error, falling back locally:', err);
    }
    setTransactions(prev => prev.filter(tx => String(tx.id) !== String(id)));
    return { success: true };
  };

  return {
    // Filter states & setters
    fundType, setFundType,
    dateFilterMode, setDateFilterMode,
    presetOption, setPresetOption,
    fromDate, setFromDate,
    toDate, setToDate,
    includeReceipt, setIncludeReceipt,
    includePayment, setIncludePayment,
    categoryFilter, setCategoryFilter,
    businessFilter, setBusinessFilter,
    searchTerm, setSearchTerm,

    // Data states
    loading,
    transactions,
    summary,

    // Actions
    fetchTransactions,
    deleteTransaction,
    getLocalDateString
  };
}

