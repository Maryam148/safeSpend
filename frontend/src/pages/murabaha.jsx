import { useState } from 'react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function MurabahaCalculator() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    asset_cost: '',
    profit_margin_percentage: '',
    profit_margin_amount: '',
    payment_term_months: '',
    down_payment: '',
    processing_fee: '',
    documentation_fee: '',
    insurance_cost: '',
    payment_frequency: 'monthly',
    grace_period_months: '',
    early_settlement_discount: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Move backendData declaration outside try block
    const backendData = {
      asset_cost: parseFloat(form.asset_cost) || 0,
      profit_margin_percentage: parseFloat(form.profit_margin_percentage) || 0,
      profit_margin_amount: parseFloat(form.profit_margin_amount) || 0,
      payment_term_months: parseInt(form.payment_term_months) || 12,
      down_payment: parseFloat(form.down_payment) || 0,
      processing_fee: parseFloat(form.processing_fee) || 0,
      documentation_fee: parseFloat(form.documentation_fee) || 0,
      insurance_cost: parseFloat(form.insurance_cost) || 0,
      payment_frequency: form.payment_frequency,
      grace_period_months: parseInt(form.grace_period_months) || 0,
      early_settlement_discount: parseFloat(form.early_settlement_discount) || 0
    };

    try {
      const res = await api.post('/murabaha', backendData);
      const calculationResult = res.data;
      setResult(calculationResult);

      // Only save to history if user is logged in
      if (user) {
        const { error: insertError } = await supabase
          .from("calculation_history")
          .insert([
            {
              user_id: user.id,
              calculator: "Murabaha",
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
      console.error('Error:', err);
      setError('Failed to calculate Murabaha. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Murabaha Calculator</h1>
        <p className="text-gray-600 mb-8">Calculate payments for Islamic cost-plus profit financing</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Asset Details */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Asset Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Cost (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="asset_cost"
                  value={form.asset_cost}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Original cost of asset"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit Margin (%)
                </label>
                <input
                  type="number"
                  name="profit_margin_percentage"
                  value={form.profit_margin_percentage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Profit percentage"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit Amount (PKR)
                </label>
                <input
                  type="number"
                  name="profit_margin_amount"
                  value={form.profit_margin_amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Fixed profit amount"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Payment Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Term (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="payment_term_months"
                  value={form.payment_term_months}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="Repayment period"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment (PKR)
                </label>
                <input
                  type="number"
                  name="down_payment"
                  value={form.down_payment}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="Initial payment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Frequency
                </label>
                <select
                  name="payment_frequency"
                  value={form.payment_frequency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">Additional Costs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Fee (PKR)
                </label>
                <input
                  type="number"
                  name="processing_fee"
                  value={form.processing_fee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="Processing charges"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documentation Fee (PKR)
                </label>
                <input
                  type="number"
                  name="documentation_fee"
                  value={form.documentation_fee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="Documentation charges"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Cost (PKR)
                </label>
                <input
                  type="number"
                  name="insurance_cost"
                  value={form.insurance_cost}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="Insurance premium"
                />
              </div>
            </div>
          </div>

          {/* Special Terms */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Special Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grace Period (Months)
                </label>
                <input
                  type="number"
                  name="grace_period_months"
                  value={form.grace_period_months}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-gray-500"
                  placeholder="Payment grace period"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Early Settlement Discount (%)
                </label>
                <input
                  type="number"
                  name="early_settlement_discount"
                  value={form.early_settlement_discount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-gray-500"
                  placeholder="Early payment discount"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Murabaha Payment'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">Installment Payment</h2>
              <p className="text-4xl font-bold">PKR {result.installment_amount?.toLocaleString()}</p>
              <p className="text-lg opacity-90">per {result.payment_frequency}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Asset Cost:</span>
                    <span>PKR {result.asset_cost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Amount:</span>
                    <span>PKR {result.total_profit?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span>PKR {result.processing_fee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation Fee:</span>
                    <span>PKR {result.documentation_fee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance Cost:</span>
                    <span>PKR {result.insurance_cost?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Sale Price:</span>
                    <span>PKR {result.total_sale_price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Down Payment:</span>
                    <span>PKR {result.down_payment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Financed Amount:</span>
                    <span>PKR {result.financed_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Payments:</span>
                    <span>{result.number_of_payments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Frequency:</span>
                    <span className="capitalize">{result.payment_frequency}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Installment Amount:</span>
                    <span>PKR {result.installment_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Cost Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Asset Cost</p>
                  <p className="text-xl font-bold text-blue-600">PKR {result.asset_cost?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-xl font-bold text-green-600">PKR {result.total_of_payments?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-xl font-bold text-purple-600">PKR {result.total_cost?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-xl font-bold text-orange-600">{result.effective_profit_rate?.toFixed(2)}%</p>
                </div>
              </div>
            </div>

            {result.early_settlement_discount > 0 && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Early Settlement Option</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Settlement Amount (with discount)</p>
                    <p className="text-2xl font-bold text-green-600">PKR {result.early_settlement_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Savings from Early Settlement</p>
                    <p className="text-2xl font-bold text-green-600">PKR {result.early_settlement_savings?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-yellow-800 mb-2">Murabaha Principles</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• The financier purchases the asset and sells it at a disclosed profit margin</li>
                <li>• The sale price is fixed and cannot be changed during the contract period</li>
                <li>• Payment schedule is predetermined and agreed upon by both parties</li>
                <li>• Early settlement discounts are permissible and encouraged in Islamic finance</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}