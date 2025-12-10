import { useState } from 'react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function QardHasanPlanner() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    loan_amount: '',
    repayment_term_months: '',
    repayment_frequency: 'monthly',
    optional_donation: ''
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
    setResult(null);

    // Prepare backend data outside try block
    const backendData = {
      loan_amount: parseFloat(form.loan_amount),
      repayment_term_months: parseInt(form.repayment_term_months),
      repayment_frequency: form.repayment_frequency,
      optional_donation: parseFloat(form.optional_donation) || 0
    };

    try {
      const res = await api.post('/qard-hasan', backendData);
      const calculationResult = res.data;
      setResult(calculationResult);

      // Only save to history if user is logged in
      if (user) {
        const { error: insertError } = await supabase
          .from("calculation_history")
          .insert([
            {
              user_id: user.id,
              calculator: "Qard-e-Hasan",
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
      console.error(err);
      setError('Something went wrong. Please check your input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Qard-e-Hasan Planner</h1>
        <p className="text-gray-600 mb-8">
          Estimate repayment plan for an interest-free Islamic loan with optional donation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Loan Amount (PKR)</label>
              <input
                type="number"
                name="loan_amount"
                value={form.loan_amount}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3"
                placeholder="Enter loan amount"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Repayment Term (Months)</label>
              <input
                type="number"
                name="repayment_term_months"
                value={form.repayment_term_months}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3"
                placeholder="e.g. 12"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Repayment Frequency</label>
              <select
                name="repayment_frequency"
                value={form.repayment_frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Optional Donation (PKR)</label>
              <input
                type="number"
                name="optional_donation"
                value={form.optional_donation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3"
                placeholder="If any"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? 'Calculating...' : 'Calculate Repayment Plan'}
          </button>
        </form>

        {error && (
          <div className="mt-6 text-red-600 bg-red-100 border border-red-400 rounded-md p-4">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-green-700">Repayment Plan Summary</h2>
            <p>
              <strong>Installment Amount:</strong>{' '}
              PKR {result.installment_amount.toLocaleString()}
            </p>
            <p>
              <strong>Total Donation (if any):</strong>{' '}
              PKR {result.total_donation.toLocaleString()}
            </p>
            <p>
              <strong>Total Payable:</strong>{' '}
              PKR {result.total_payable.toLocaleString()}
            </p>
            <p>
              <strong>Number of Installments:</strong> {result.number_of_installments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}