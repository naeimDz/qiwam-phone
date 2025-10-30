"use client"
import { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { 
  getAccessoriesAction, 
  addAccessoryAction,
  updateAccessoryAction,
  adjustStockAction,
  getLowStockAccessoriesAction,
  getAccessoriesInventoryStatsAction
} from '@/lib/actions/accessories';
import {
  getPhonesAction,
  getAvailablePhonesAction,
  addPhoneAction,
  updatePhoneAction,
  searchPhoneByImeiAction,
  getPhonesStatsAction
} from '@/lib/actions/phones';
import { Accessory, AccessoryWithDetails, Phone, PhoneWithDetails } from '@/lib/types';

type TestResult = {
  id: number;
  actionName: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
};

export default function ActionsTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (actionName: string, actionResult: any) => {
    const result: TestResult = {
      id: Date.now(),
      actionName,
      success: actionResult.success,
      data: actionResult.success ? actionResult.data : undefined,
      error: !actionResult.success ? actionResult.error : undefined,
      timestamp: new Date().toLocaleTimeString('ar')
    };
    setResults(prev => [result, ...prev]);
  };

  // ========== Accessories Actions ==========
  const testGetAccessories = async () => {
    setLoading(true);
    try {
      const result = await getAccessoriesAction(false);
      addResult('getAccessoriesAction', result);
    } catch (err: any) {
      addResult('getAccessoriesAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetLowStockAccessories = async () => {
    setLoading(true);
    try {
      const result = await getLowStockAccessoriesAction();
      addResult('getLowStockAccessoriesAction', result);
    } catch (err: any) {
      addResult('getLowStockAccessoriesAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testAddAccessory = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', 'شاشة حماية تجريبية');
      //formData.append('categoryid', null);
      formData.append('sku', `SKU-${Date.now()}`);
      formData.append('quantity', '10');
      formData.append('minqty', '2');
      formData.append('buyprice', '5.50');
      formData.append('sellprice', '9.99');

      const result = await addAccessoryAction(formData);
      addResult('addAccessoryAction', result);
    } catch (err: any) {
      addResult('addAccessoryAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetAccessoriesStats = async () => {
    setLoading(true);
    try {
      const result = await getAccessoriesInventoryStatsAction();
      addResult('getAccessoriesInventoryStatsAction', result);
    } catch (err: any) {
      addResult('getAccessoriesInventoryStatsAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ========== Phones Actions ==========
  const testGetPhones = async () => {
    setLoading(true);
    try {
      const result = await getPhonesAction();
      addResult('getPhonesAction', result);
    } catch (err: any) {
      addResult('getPhonesAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetAvailablePhones = async () => {
    setLoading(true);
    try {
      const result = await getAvailablePhonesAction();
      addResult('getAvailablePhonesAction', result);
    } catch (err: any) {
      addResult('getAvailablePhonesAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testAddPhone = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', 'iPhone 15 Pro');
      //formData.append('brandid', null);
      formData.append('model', 'Pro Max');
      formData.append('imei', `12345678901234517`);
      formData.append('buyprice', '850');
      formData.append('sellprice', '999');
      formData.append('warranty_months', '12');

      const result = await addPhoneAction(formData);
      addResult('addPhoneAction', result);
    } catch (err: any) {
      addResult('addPhoneAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testSearchPhoneByImei = async () => {
    setLoading(true);
    try {
      const result = await searchPhoneByImeiAction('123456789012345');
      addResult('searchPhoneByImeiAction', result);
    } catch (err: any) {
      addResult('searchPhoneByImeiAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetPhonesStats = async () => {
    setLoading(true);
    try {
      const result = await getPhonesStatsAction();
      addResult('getPhonesStatsAction', result);
    } catch (err: any) {
      addResult('getPhonesStatsAction', { success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🧪 اختبار Server Actions الحقيقية</h1>
        <p className="text-gray-600 mb-8">استدعاء المtions من الـ backend مع الـ Types الصحيحة</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Accessories Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">📦 Accessories</h2>
            <div className="space-y-3">
              <button
                onClick={testGetAccessories}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                getAccessoriesAction()
              </button>
              <button
                onClick={testGetLowStockAccessories}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                getLowStockAccessoriesAction()
              </button>
              <button
                onClick={testAddAccessory}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                addAccessoryAction()
              </button>
              <button
                onClick={testGetAccessoriesStats}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                getAccessoriesInventoryStatsAction()
              </button>
            </div>
          </div>

          {/* Phones Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-600 mb-4">📱 Phones</h2>
            <div className="space-y-3">
              <button
                onClick={testGetPhones}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                getPhonesAction()
              </button>
              <button
                onClick={testGetAvailablePhones}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                getAvailablePhonesAction()
              </button>
              <button
                onClick={testAddPhone}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                addPhoneAction()
              </button>
              <button
                onClick={testSearchPhoneByImei}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                searchPhoneByImeiAction()
              </button>
              <button
                onClick={testGetPhonesStats}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                {loading && <Loader className="animate-spin" size={16} />}
                getPhonesStatsAction()
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">📋 النتائج ({results.length})</h3>
            {results.length > 0 && (
              <button
                onClick={clearResults}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition"
              >
                مسح
              </button>
            )}
          </div>
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">اضغط على أي زر لاستدعاء action</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map(result => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    ) : (
                      <X className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-mono text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.actionName}
                      </p>
                      {result.error && (
                        <p className="text-red-600 text-xs mt-1">❌ {result.error}</p>
                      )}
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                            📊 عرض البيانات
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto max-w-full">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{result.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}