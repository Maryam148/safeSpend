import { useState } from 'react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function IstisnaCalculator() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    manufacturing_cost: '',
    profit_margin_percentage: '',
    delivery_period_months: '',
    payment_schedule: 'monthly',
    advance_payment: '',
    additional_costs: '',
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
      manufacturing_cost: parseFloat(form.manufacturing_cost) || 0,
      profit_margin_percentage: parseFloat(form.profit_margin_percentage) || 0,
      delivery_period_months: parseInt(form.delivery_period_months) || 12,
      payment_schedule: form.payment_schedule,
      advance_payment: parseFloat(form.advance_payment) || 0,
      additional_costs: parseFloat(form.additional_costs) || 0,
    };

    try {
      const res = await api.post('/istisna', backendData);
      const calculationResult = res.data;
      setResult(calculationResult);

      // Insert into Supabase with the actual result data
      const { data, error: insertError } = await supabase
        .from("calculation_history")
        .insert([
          {
            user_id: user.id,
            calculator: "Istisna",
            inputs: JSON.stringify(backendData),
            output: JSON.stringify(calculationResult), // Use the actual result
            created_at: new Date().toISOString() // Explicitly set created_at
          }
        ]);

      if (insertError) {
        console.error("Insert error:", insertError.message);
        // Optional: Show error to user
        setError('Calculation completed but failed to save to history.');
      }

    } catch (err) {
      console.error(err);
      setError('Failed to calculate Istisna. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Istisna Calculator</h1>
        <p className="text-gray-600 mb-6">Estimate cost and payment plans for Islamic manufacturing contracts</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Manufacturing Cost (PKR)</label>
              <input
                type="number"
                name="manufacturing_cost"
                value={form.manufacturing_cost}
                onChange={handleChange}
                className="w-full border rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Profit Margin (%)</label>
              <input
                type="number"
                name="profit_margin_percentage"
                value={form.profit_margin_percentage}
                onChange={handleChange}
                className="w-full border rounded p-3"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Delivery Period (Months)</label>
              <input
                type="number"
                name="delivery_period_months"
                value={form.delivery_period_months}
                onChange={handleChange}
                className="w-full border rounded p-3"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Payment Schedule</label>
              <select
                name="payment_schedule"
                value={form.payment_schedule}
                onChange={handleChange}
                className="w-full border rounded p-3"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annual">Semi-Annual</option>
                <option value="lump-sum">Lump Sum</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Advance Payment (PKR)</label>
              <input
                type="number"
                name="advance_payment"
                value={form.advance_payment}
                onChange={handleChange}
                className="w-full border rounded p-3"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Additional Costs (PKR)</label>
              <input
                type="number"
                name="additional_costs"
                value={form.additional_costs}
                onChange={handleChange}
                className="w-full border rounded p-3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg"
          >
            {loading ? 'Calculating...' : 'Calculate Istisna Plan'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>
        )}

        {result && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Istisna Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
              <div className="flex justify-between">
                <span>Total Sale Price:</span>
                <span>PKR {result.total_sale_price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Advance Payment:</span>
                <span>PKR {result.advance_payment?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Financed Amount:</span>
                <span>PKR {result.financed_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Installment Amount:</span>
                <span>PKR {result.installment_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of Payments:</span>
                <span>{result.number_of_payments}</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Amount:</span>
                <span>PKR {result.profit_amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}