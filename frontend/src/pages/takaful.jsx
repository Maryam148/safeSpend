import { useState } from 'react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function TakafulEstimator() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    age: '',
    coverage_amount: '',
    term_years: '',
    health_status: 'average',
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

    // Prepare backend data outside try block
    const backendData = {
      age: parseInt(form.age),
      coverage_amount: parseFloat(form.coverage_amount),
      term_years: parseInt(form.term_years),
      health_status: form.health_status,
    };

    try {
      const res = await api.post('/api/takaful', backendData);
      const calculationResult = res.data;
      setResult(calculationResult);

      // Insert into Supabase with the actual result data
      const { data, error: insertError } = await supabase
        .from("calculation_history")
        .insert([
          {
            user_id: user.id,
            calculator: "Takaful",
            inputs: JSON.stringify(backendData),
            output: JSON.stringify(calculationResult),
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error("Insert error:", insertError.message);
        // Optional: Show error to user but don't interrupt the main flow
        setError('Calculation completed but failed to save to history.');
      }

    } catch (err) {
      console.error(err);
      setError('Failed to estimate Takaful contribution. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Takaful Contribution Estimator</h1>
        <p className="text-gray-600 mb-6">Estimate your expected contributions for Islamic cooperative insurance</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Amount (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="coverage_amount"
                value={form.coverage_amount}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="Desired coverage amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="term_years"
                value={form.term_years}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="Coverage duration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Status
              </label>
              <select
                name="health_status"
                value={form.health_status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            {loading ? 'Calculating...' : 'Estimate Contribution'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-300">
            <h2 className="text-xl font-bold text-green-800 mb-2">Estimated Annual Contribution</h2>
            <p className="text-3xl font-bold text-green-700">PKR {result.annual_contribution?.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">Based on a {form.term_years}-year term and health status: {form.health_status}</p>
          </div>
        )}
      </div>
    </div>
  );
}