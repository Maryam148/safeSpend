import { useState } from 'react';
import api from '../api';
import { supabase } from '../supabaseClient';
import { useAuth } from '../authContext';

export default function BusinessPartnershipSplitCalculator() {
  const { user } = useAuth();
  const [partners, setPartners] = useState([
    { name: '', investment: '' }
  ]);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePartnerChange = (index, field, value) => {
    const updatedPartners = [...partners];
    updatedPartners[index][field] = value;
    setPartners(updatedPartners);
  };

  const addPartner = () => {
    setPartners([...partners, { name: '', investment: '' }]);
  };

  const removePartner = (index) => {
    if (partners.length > 1) {
      const updated = partners.filter((_, i) => i !== index);
      setPartners(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult([]);

    // Move backendData declaration outside try block
    const backendData = {
      partners: partners.map(partner => ({
        name: partner.name.trim(),
        investment: parseFloat(partner.investment) || 0
      }))
    };

    try {
      const res = await api.post('/business-partnership-split', backendData);
      const calculationResult = res.data;
      setResult(calculationResult.split);

      // Insert into Supabase with the actual result data
      const { data, error: insertError } = await supabase
        .from("calculation_history")
        .insert([
          {
            user_id: user.id,
            calculator: "Partnership Split",
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
      setError("Failed to calculate profit split. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Partnership Split</h1>
        <p className="text-gray-600 mb-6">Distribute profits based on each partner's capital investment</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {partners.map((partner, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-blue-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                <input
                  type="text"
                  value={partner.name}
                  onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3"
                  placeholder={`Partner ${index + 1}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (PKR)</label>
                <input
                  type="number"
                  value={partner.investment}
                  onChange={(e) => handlePartnerChange(index, 'investment', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => removePartner(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPartner}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Add Partner
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-lg"
          >
            {loading ? 'Calculating...' : 'Calculate Split'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-100 text-red-700 border border-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {result.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Profit Split Summary</h2>
            <div className="space-y-2">
              {result.map((partner, index) => (
                <div key={index} className="flex justify-between text-gray-800 text-sm">
                  <span>{partner.name}</span>
                  <span>{partner.percentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}