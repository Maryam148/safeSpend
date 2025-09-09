import { useState } from 'react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function ZakatCalculator() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    cash: '',
    gold_grams: '',
    silver_grams: '',
    business_assets: '',
    liabilities: '',
    gold_price: '',
    silver_price: '',
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
      cash: parseFloat(form.cash) || 0,
      gold: parseFloat(form.gold_grams) || 0,
      silver: parseFloat(form.silver_grams) || 0,
      business_assets: parseFloat(form.business_assets) || 0,
      liabilities: parseFloat(form.liabilities) || 0,
      gold_rate_per_gram: parseFloat(form.gold_price) || 0,
      silver_rate_per_gram: parseFloat(form.silver_price) || 0,
    };

    try {
      const res = await api.post('/zakat', backendData);
      const calculationResult = res.data;
      setResult(calculationResult);

      // Insert into Supabase with the actual result data
      const { data, error: insertError } = await supabase
        .from("calculation_history")
        .insert([
          {
            user_id: user.id,
            calculator: "Zakat",
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
      console.error('Error:', err);
      setError('Failed to calculate zakat. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Zakat Calculator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { name: 'cash', label: 'Cash (PKR)' },
          { name: 'gold_grams', label: 'Gold (grams)' },
          { name: 'gold_price', label: 'Gold price per gram (PKR)' },
          { name: 'silver_grams', label: 'Silver (grams)' },
          { name: 'silver_price', label: 'Silver price per gram (PKR)' },
          { name: 'business_assets', label: 'Business Assets (PKR)' },
          { name: 'liabilities', label: 'Liabilities (PKR)' }
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">
              {label}
            </label>
            <input
              type="number"
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>
        ))}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {loading ? 'Calculating...' : 'Calculate Zakat'}
        </button>
      </form>

      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Zakat Calculation Results</h2>
          <div className="space-y-2">
            <p><strong>Total Assets:</strong> PKR {result.total_assets?.toLocaleString()}</p>
            <p><strong>Zakatable Amount:</strong> PKR {result.zakatable_amount?.toLocaleString()}</p>
            <p><strong>Nisab Threshold:</strong> PKR {result.nisab?.toLocaleString()}</p>
            <p><strong>Zakat Applicable:</strong> 
              <span className={`ml-2 font-semibold ${result.zakatable_amount >= result.nisab ? 'text-green-600' : 'text-red-600'}`}>
                {result.zakatable_amount >= result.nisab ? 'Yes' : 'No'}
              </span>
            </p>
            <p className="text-lg"><strong>Zakat Due:</strong> 
              <span className="ml-2 font-bold text-green-600">
                PKR {result.zakat_due?.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}