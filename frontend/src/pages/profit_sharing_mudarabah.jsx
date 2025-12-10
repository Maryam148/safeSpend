import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';
import api from '../api';

export default function ProfitSharingCalculator() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    rabbul_mal_investment: '',
    mudarib_investment: '',
    total_revenue: '',
    total_expenses: '',
    rabbul_mal_profit_ratio: '',
    mudarib_profit_ratio: '',
    project_duration_months: '',
    management_fee: '',
    performance_bonus: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setDebugInfo(null);
    
    let backendData;
    
    try {
      // Validate required fields
      if (!form.rabbul_mal_investment || parseFloat(form.rabbul_mal_investment) <= 0) {
        throw new Error('Rabb-ul-Mal investment must be greater than 0');
      }
      if (!form.total_revenue || parseFloat(form.total_revenue) < 0) {
        throw new Error('Total revenue must be 0 or greater');
      }
      if (!form.total_expenses || parseFloat(form.total_expenses) < 0) {
        throw new Error('Total expenses must be 0 or greater');
      }
      if (!form.rabbul_mal_profit_ratio || !form.mudarib_profit_ratio) {
        throw new Error('Both profit sharing ratios are required');
      }

      // Validate and fix ratios
      const rabRatio = parseFloat(form.rabbul_mal_profit_ratio) || 0;
      const mudRatio = parseFloat(form.mudarib_profit_ratio) || 0;
      
      if (rabRatio < 0 || rabRatio > 100 || mudRatio < 0 || mudRatio > 100) {
        throw new Error('Profit ratios must be between 0 and 100');
      }
      
      if (Math.abs(rabRatio + mudRatio - 100) > 0.01) { // Allow small floating point differences
        throw new Error(`Profit ratios must sum to exactly 100%. Currently: ${(rabRatio + mudRatio).toFixed(2)}%`);
      }

      // Prepare backend data outside try block for Supabase storage
      backendData = {
        rabbul_mal_investment: parseFloat(form.rabbul_mal_investment),
        mudarib_investment: parseFloat(form.mudarib_investment) || 0,
        total_revenue: parseFloat(form.total_revenue),
        total_expenses: parseFloat(form.total_expenses),
        rabbul_mal_profit_ratio: rabRatio,
        mudarib_profit_ratio: mudRatio,
        project_duration_months: parseInt(form.project_duration_months) || 12,
        management_fee: parseFloat(form.management_fee) || 0,
        performance_bonus: parseFloat(form.performance_bonus) || 0
      };

      console.log('Sending request to backend:', backendData);
      setDebugInfo({ requestData: backendData });

      // Use fetch instead of axios for better error handling
      const response = await fetch(`${api}/mudarabah`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response:', errorData);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const calculationResult = await response.json();
      console.log('Success response:', calculationResult);
      
      setResult(calculationResult);
      setDebugInfo(prev => ({ ...prev, responseData: calculationResult }));

      // Only save to history if user is logged in
      if (user) {
        const { error: insertError } = await supabase
          .from("calculation_history")
          .insert([
            {
              user_id: user.id,
              calculator: "Mudarabah",
              inputs: JSON.stringify(backendData),
              output: JSON.stringify(calculationResult),
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error("Insert error:", insertError.message);
        }
      }

    } catch (err) {
      console.error('Error details:', err);
      const errorMessage = err.message || 'Failed to calculate profit sharing. Please check your inputs and try again.';
      setError(errorMessage);
      setDebugInfo(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to auto-adjust ratios
  const handleRatioChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    if (name === 'rabbul_mal_profit_ratio') {
      setForm({
        ...form,
        [name]: value,
        mudarib_profit_ratio: Math.max(0, 100 - numValue).toString()
      });
    } else if (name === 'mudarib_profit_ratio') {
      setForm({
        ...form,
        [name]: value,
        rabbul_mal_profit_ratio: Math.max(0, 100 - numValue).toString()
      });
    } else {
      handleChange(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mudarabah Profit Sharing Calculator</h1>
        
        
        
        <div className="space-y-8">
          {/* Investment Details */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Investment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rabb-ul-Mal Investment (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="rabbul_mal_investment"
                  value={form.rabbul_mal_investment}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Capital provider investment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mudarib Investment (PKR)
                </label>
                <input
                  type="number"
                  name="mudarib_investment"
                  value={form.mudarib_investment}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Manager investment (optional)"
                />
              </div>
            </div>
          </div>

          {/* Revenue & Expenses */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Revenue & Expenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Revenue (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_revenue"
                  value={form.total_revenue}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="Total business revenue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Expenses (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_expenses"
                  value={form.total_expenses}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="Total business expenses"
                />
              </div>
            </div>
          </div>

          {/* Profit Sharing Ratios */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">Profit Sharing Ratios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rabb-ul-Mal Profit Share (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="rabbul_mal_profit_ratio"
                  value={form.rabbul_mal_profit_ratio}
                  onChange={handleRatioChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="Capital provider profit %"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mudarib Profit Share (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="mudarib_profit_ratio"
                  value={form.mudarib_profit_ratio}
                  onChange={handleRatioChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="Manager profit %"
                />
              </div>
            </div>
            {(form.rabbul_mal_profit_ratio || form.mudarib_profit_ratio) && (
              <div className="mt-2 text-sm">
                <span className={`font-medium ${
                  Math.abs((parseFloat(form.rabbul_mal_profit_ratio) || 0) + (parseFloat(form.mudarib_profit_ratio) || 0) - 100) < 0.01
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  Total: {((parseFloat(form.rabbul_mal_profit_ratio) || 0) + (parseFloat(form.mudarib_profit_ratio) || 0)).toFixed(2)}%
                  {Math.abs((parseFloat(form.rabbul_mal_profit_ratio) || 0) + (parseFloat(form.mudarib_profit_ratio) || 0) - 100) >= 0.01 && ' (Must equal 100%)'}
                </span>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Duration (Months)
                </label>
                <input
                  type="number"
                  name="project_duration_months"
                  value={form.project_duration_months}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-gray-500"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Management Fee (PKR)
                </label>
                <input
                  type="number"
                  name="management_fee"
                  value={form.management_fee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-gray-500"
                  placeholder="Management fees"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Bonus (PKR)
                </label>
                <input
                  type="number"
                  name="performance_bonus"
                  value={form.performance_bonus}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-gray-500"
                  placeholder="Additional bonus"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Profit Distribution'}
          </button>
        </div>

        

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Profit/Loss Summary */}
            <div className={`p-6 rounded-lg text-white ${result.net_profit >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
              <h2 className="text-2xl font-bold mb-2">
                {result.net_profit >= 0 ? 'Net Profit' : 'Net Loss'}
              </h2>
              <p className="text-4xl font-bold">PKR {Math.abs(result.net_profit)?.toLocaleString()}</p>
            </div>

            {/* Distribution Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-100 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Rabb-ul-Mal (Capital Provider)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Initial Investment:</span>
                    <span>PKR {result.rabbul_mal_investment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Share:</span>
                    <span>PKR {result.rabbul_mal_profit_share?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loss Share:</span>
                    <span>PKR {result.rabbul_mal_loss_share?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total Return:</span>
                    <span className={result.rabbul_mal_total_return >= result.rabbul_mal_investment ? 'text-green-600' : 'text-red-600'}>
                      PKR {result.rabbul_mal_total_return?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-100 border border-purple-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Mudarib (Manager)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Initial Investment:</span>
                    <span>PKR {result.mudarib_investment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Share:</span>
                    <span>PKR {result.mudarib_profit_share?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Management Fee:</span>
                    <span>PKR {result.management_fee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Bonus:</span>
                    <span>PKR {result.performance_bonus?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total Return:</span>
                    <span className="text-purple-600">
                      PKR {result.mudarib_total_return?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Total Investment</p>
                  <p className="text-xl font-bold text-blue-600">PKR {result.total_investment?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">PKR {result.total_revenue?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">PKR {result.total_expenses?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">ROI</p>
                  <p className={`text-xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.roi?.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Islamic Finance Note */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-yellow-800 mb-2">Mudarabah Principles</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Profits are shared according to pre-agreed ratios</li>
                <li>• Losses are borne by the capital provider (Rabb-ul-Mal) only</li>
                <li>• The manager (Mudarib) loses their time and effort in case of loss</li>
                <li>• Management fees can be agreed upon separately</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}