import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function IslamicPensionPlanner() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    current_age: '',
    retirement_age: '',
    monthly_contribution: '',
    expected_return_rate: '',
    inflation_rate: ''
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
      current_age: parseInt(form.current_age),
      retirement_age: parseInt(form.retirement_age),
      monthly_contribution: parseFloat(form.monthly_contribution),
      expected_return_rate: parseFloat(form.expected_return_rate),
      inflation_rate: parseFloat(form.inflation_rate)
    };

    try {
      const response = await axios.post('http://localhost:8000/pension-planner', backendData);
      const calculationResult = response.data;
      setResult(calculationResult);

      // Insert into Supabase with the actual result data
      const { data, error: insertError } = await supabase
        .from("calculation_history")
        .insert([
          {
            user_id: user.id,
            calculator: "Pension Planner",
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
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Islamic Pension Planner</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Current Age</label>
            <input
              type="number"
              name="current_age"
              value={form.current_age}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Retirement Age</label>
            <input
              type="number"
              name="retirement_age"
              value={form.retirement_age}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Monthly Contribution (PKR)</label>
            <input
              type="number"
              name="monthly_contribution"
              value={form.monthly_contribution}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Expected Return Rate (%)</label>
            <input
              type="number"
              name="expected_return_rate"
              value={form.expected_return_rate}
              onChange={handleChange}
              step="0.01"
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Inflation Rate (%)</label>
            <input
              type="number"
              name="inflation_rate"
              value={form.inflation_rate}
              onChange={handleChange}
              step="0.01"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
        >
          {loading ? "Calculating..." : "Calculate Pension Value"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Projected Retirement Fund</h2>
          <p className="text-3xl font-bold text-green-900">PKR {result.future_value?.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Adjusted for {result.inflation_rate}% inflation rate.</p>
        </div>
      )}
    </div>
  );
}