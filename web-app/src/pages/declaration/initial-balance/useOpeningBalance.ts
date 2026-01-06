import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';

export interface OpeningPeriod {
  id: string;
  periodName: string;
  openingDate: string;
  description?: string;
  isLocked: boolean;
}

export interface AccountInfo {
  accountNumber: string;
  accountName: string;
}

// Cache for account lookups
const accountCache: Record<string, AccountInfo> = {};

export function useOpeningBalance() {
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or get existing period
  useEffect(() => {
    const savedPeriodId = localStorage.getItem('currentOpeningPeriodId');
    if (savedPeriodId) {
      setCurrentPeriodId(savedPeriodId);
    }
  }, []);

  // Get or create opening period
  const getOrCreatePeriod = async (): Promise<string> => {
    console.log('[useOpeningBalance] getOrCreatePeriod called, currentPeriodId:', currentPeriodId);
    
    // Check if we have tenant token
    const tenantToken = localStorage.getItem('tenantAccessToken');
    const accessToken = localStorage.getItem('accessToken');
    console.log('[useOpeningBalance] tenantAccessToken:', tenantToken ? 'EXISTS' : 'MISSING');
    console.log('[useOpeningBalance] accessToken:', accessToken ? 'EXISTS' : 'MISSING');
    
    if (!tenantToken && !accessToken) {
      const error = 'No authentication token found. Please login again.';
      setError(error);
      throw new Error(error);
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Check if period already exists
      const periods = await apiService.getOpeningPeriods();
      console.log('[useOpeningBalance] Fetched periods:', periods);
      if (periods && periods.length > 0) {
        const period = periods[0];
        console.log('[useOpeningBalance] Using existing period:', period);
        setCurrentPeriodId(period.id);
        localStorage.setItem('currentOpeningPeriodId', period.id);
        return period.id;
      }

      // Create new period
      const today = new Date().toISOString().split('T')[0];
      console.log('[useOpeningBalance] Creating new period with date:', today);
      const period = await apiService.createOpeningPeriod({
        periodName: 'Số dư đầu kỳ',
        openingDate: today,
        description: 'Khai báo số dư ban đầu',
      });

      console.log('[useOpeningBalance] Created period response:', period);
      console.log('[useOpeningBalance] Period ID:', period.id);
      setCurrentPeriodId(period.id);
      localStorage.setItem('currentOpeningPeriodId', period.id);
      return period.id;
    } catch (err: any) {
      console.error('[useOpeningBalance] Error in getOrCreatePeriod:', err);
      console.error('[useOpeningBalance] Error response:', err.response);
      
      // Check if it's an auth error
      if (err.response?.status === 401) {
        const authError = 'Authentication failed. Please login again.';
        setError(authError);
        // Redirect to login
        window.location.href = '/login';
        throw new Error(authError);
      }
      
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to create period';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Get account info by account number (with caching)
  const getAccountInfo = async (accountNumber: string): Promise<AccountInfo> => {
    if (accountCache[accountNumber]) {
      return accountCache[accountNumber];
    }

    try {
      const account = await apiService.getAccountByNumber(accountNumber);
      if (!account) {
        throw new Error(`Account ${accountNumber} not found`);
      }

      const accountInfo: AccountInfo = {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
      };

      accountCache[accountNumber] = accountInfo;
      return accountInfo;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to get account';
      throw new Error(errorMsg);
    }
  };

  // Save cash and bank balances (Step 1)
  const saveCashAndBankBalances = async (
    cashBalance: number,
    bankDeposits: Array<{ balance: number; note?: string }>,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const periodId = await getOrCreatePeriod();
      console.log('[useOpeningBalance] saveCashAndBankBalances - periodId:', periodId);
      
      // Use VND currency code
      const currencyId = 'VND';

      // Backend uses upsert pattern - no need to delete existing balances
      const balances = [];

      // Account 1111 - Tiền mặt (Cash)
      if (cashBalance > 0) {
        balances.push({
          accountNumber: '1111',
          debitBalance: cashBalance,
          creditBalance: 0,
          hasDetails: false,
          note: 'Tiền mặt đầu kỳ',
        });
      }

      // Account 1121 - Tiền gửi ngân hàng (Bank deposits)
      for (const deposit of bankDeposits) {
        if (deposit.balance > 0) {
          balances.push({
            accountNumber: '1121',
            debitBalance: deposit.balance,
            creditBalance: 0,
            hasDetails: false,
            note: deposit.note || 'Tiền gửi ngân hàng',
          });
        }
      }

      if (balances.length > 0) {
        console.log('[useOpeningBalance] Calling batchCreateOpeningBalances with:', { periodId, currencyId, balances });
        await apiService.batchCreateOpeningBalances({
          periodId,
          currencyId,
          balances,
        });
      }

      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save balances';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Save customer receivables (Step 2)
  const saveCustomerReceivables = async (
    customerDebts: Array<{ customerId: string; amount: number; note?: string }>,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const periodId = await getOrCreatePeriod();
      const currencyId = 'VND';

      const totalDebt = customerDebts.reduce((sum, debt) => sum + debt.amount, 0);
      if (totalDebt === 0) {
        return { success: true };
      }

      // Account 131 - Phải thu của khách hàng (backend uses upsert pattern)
      // Create parent balance with details
      const balance = await apiService.createOpeningBalance({
        periodId,
        currencyId,
        accountNumber: '131',
        debitBalance: totalDebt,
        creditBalance: 0,
        hasDetails: true,
        note: 'Phải thu khách hàng đầu kỳ',
      });

      // Create details for each customer
      const details = customerDebts.map((debt) => ({
        accountObjectId: debt.customerId,
        debitBalance: debt.amount,
        creditBalance: 0,
        description: debt.note,
      }));

      await apiService.batchCreateOpeningBalanceDetails(balance.id, { details });

      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save receivables';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Save supplier payables (Step 3)
  const saveSupplierPayables = async (
    supplierDebts: Array<{ supplierId: string; amount: number; note?: string }>,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const periodId = await getOrCreatePeriod();
      const currencyId = 'VND';

      const totalDebt = supplierDebts.reduce((sum, debt) => sum + debt.amount, 0);
      if (totalDebt === 0) {
        return { success: true };
      }

      // Account 331 - Phải trả cho người bán (backend uses upsert pattern)
      // Create parent balance with details
      const balance = await apiService.createOpeningBalance({
        periodId,
        currencyId,
        accountNumber: '331',
        debitBalance: 0,
        creditBalance: totalDebt,
        hasDetails: true,
        note: 'Phải trả nhà cung cấp đầu kỳ',
      });

      // Create details for each supplier
      const details = supplierDebts.map((debt) => ({
        accountObjectId: debt.supplierId,
        debitBalance: 0,
        creditBalance: debt.amount,
        description: debt.note,
      }));

      await apiService.batchCreateOpeningBalanceDetails(balance.id, { details });

      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save payables';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Lock the period after completing all steps
  const lockPeriod = async () => {
    if (!currentPeriodId) {
      throw new Error('No period to lock');
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiService.lockOpeningPeriod(currentPeriodId);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to lock period';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentPeriodId,
    isLoading,
    error,
    getOrCreatePeriod,
    getAccountInfo,
    saveCashAndBankBalances,
    saveCustomerReceivables,
    saveSupplierPayables,
    lockPeriod,
  };
}
