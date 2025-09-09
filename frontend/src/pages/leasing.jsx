import { useState } from 'react';
import api from '../api';

export default function LeasingCalculator() {
  const [form, setForm] = useState({
    // Vehicle Information
    vehicle_price: '',
    down_payment: '',
    trade_in_value: '',
    
    // Lease Terms
    lease_term_months: '',
    annual_mileage: '',
    residual_value_percentage: '',
    
    // Financial Details
    money_factor: '',
    interest_rate: '',
    sales_tax_rate: '',
    
    // Additional Costs
    acquisition_fee: '',
    disposition_fee: '',
    security_deposit: '',
    first_month_payment: '',
    
    // Insurance & Other
    gap_insurance: '',
    extended_warranty: '',
    maintenance_package: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Transform frontend data to match backend expectations
      const backendData = {
        vehicle_price: parseFloat(form.vehicle_price) || 0,
        down_payment: parseFloat(form.down_payment) || 0,
        trade_in_value: parseFloat(form.trade_in_value) || 0,
        lease_term_months: parseInt(form.lease_term_months) || 36,
        annual_mileage: parseInt(form.annual_mileage) || 12000,
        residual_value_percentage: parseFloat(form.residual_value_percentage) || 60,
        money_factor: parseFloat(form.money_factor) || 0,
        interest_rate: parseFloat(form.interest_rate) || 0,
        sales_tax_rate: parseFloat(form.sales_tax_rate) || 0,
        acquisition_fee: parseFloat(form.acquisition_fee) || 0,
        disposition_fee: parseFloat(form.disposition_fee) || 0,
        security_deposit: parseFloat(form.security_deposit) || 0,
        first_month_payment: form.first_month_payment === 'true',
        gap_insurance: parseFloat(form.gap_insurance) || 0,
        extended_warranty: parseFloat(form.extended_warranty) || 0,
        maintenance_package: parseFloat(form.maintenance_package) || 0
      };

      const res = await api.post('/leasing', backendData);
      setResult(res.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to calculate lease. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      vehicle_price: '',
      down_payment: '',
      trade_in_value: '',
      lease_term_months: '',
      annual_mileage: '',
      residual_value_percentage: '',
      money_factor: '',
      interest_rate: '',
      sales_tax_rate: '',
      acquisition_fee: '',
      disposition_fee: '',
      security_deposit: '',
      first_month_payment: '',
      gap_insurance: '',
      extended_warranty: '',
      maintenance_package: ''
    });
    setResult(null);
    setError(null);
  };

  const formSections = [
    {
      title: "Vehicle Information",
      fields: [
        { name: 'vehicle_price', label: 'Vehicle Price (PKR)', type: 'number', required: true },
        { name: 'down_payment', label: 'Down Payment (PKR)', type: 'number' },
        { name: 'trade_in_value', label: 'Trade-in Value (PKR)', type: 'number' }
      ]
    },
    {
      title: "Lease Terms",
      fields: [
        { name: 'lease_term_months', label: 'Lease Term (Months)', type: 'number', required: true, placeholder: '36' },
        { name: 'annual_mileage', label: 'Annual Mileage Limit', type: 'number', placeholder: '12000' },
        { name: 'residual_value_percentage', label: 'Residual Value (%)', type: 'number', placeholder: '60' }
      ]
    },
    {
      title: "Financial Details",
      fields: [
        { name: 'money_factor', label: 'Money Factor', type: 'number', step: '0.0001', placeholder: '0.0025' },
        { name: 'interest_rate', label: 'Interest Rate (%)', type: 'number', step: '0.01', placeholder: '6.0' },
        { name: 'sales_tax_rate', label: 'Sales Tax Rate (%)', type: 'number', step: '0.01', placeholder: '8.25' }
      ]
    },
    {
      title: "Additional Costs",
      fields: [
        { name: 'acquisition_fee', label: 'Acquisition Fee (PKR)', type: 'number' },
        { name: 'disposition_fee', label: 'Disposition Fee (PKR)', type: 'number' },
        { name: 'security_deposit', label: 'Security Deposit (PKR)', type: 'number' }
      ]
    },
    {
      title: "Insurance & Extras",
      fields: [
        { name: 'gap_insurance', label: 'GAP Insurance (PKR)', type: 'number' },
        { name: 'extended_warranty', label: 'Extended Warranty (PKR)', type: 'number' },
        { name: 'maintenance_package', label: 'Maintenance Package (PKR)', type: 'number' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Lease Calculator</h1>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {formSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-3 focus:border-transparent"
                      placeholder={field.placeholder || "0"}
                      step={field.step || "0"}
                      min="0"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Payment Options */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              Payment Options
            </h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="first_month_payment"
                  checked={form.first_month_payment === 'true'}
                  onChange={(e) => setForm({...form, first_month_payment: e.target.checked ? 'true' : 'false'})}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Include first month payment upfront</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Lease Payment'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Monthly Payment Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">Monthly Lease Payment</h2>
              <p className="text-4xl font-bold">PKR {result.monthly_payment?.toLocaleString()}</p>
            </div>

            {/* Payment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Depreciation Payment:</span>
                    <span>PKR {result.depreciation_payment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finance Payment:</span>
                    <span>PKR {result.finance_payment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax:</span>
                    <span>PKR {result.monthly_tax?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Monthly Payment:</span>
                    <span>PKR {result.monthly_payment?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lease Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vehicle Price:</span>
                    <span>PKR {result.vehicle_price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Residual Value:</span>
                    <span>PKR {result.residual_value?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depreciation:</span>
                    <span>PKR {result.total_depreciation?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capitalized Cost:</span>
                    <span>PKR {result.capitalized_cost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Costs */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Lease Costs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Due at Signing</p>
                  <p className="text-2xl font-bold text-blue-600">PKR {result.due_at_signing?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total of Payments</p>
                  <p className="text-2xl font-bold text-green-600">PKR {result.total_of_payments?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Lease Cost</p>
                  <p className="text-2xl font-bold text-purple-600">PKR {result.total_lease_cost?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-yellow-800 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Monthly mileage limit: {Math.round(result.monthly_mileage_limit)} miles</li>
                <li>• Excess mileage charges may apply beyond the annual limit</li>
                <li>• Disposition fee of PKR {result.disposition_fee?.toLocaleString()} due at lease end</li>
                <li>• All calculations are estimates and may vary based on final lease terms</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}