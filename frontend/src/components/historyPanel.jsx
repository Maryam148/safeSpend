import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function HistoryPanel({ isOpen, onClose, userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory();
    }
  }, [isOpen, userId]);

  async function fetchHistory() {
    const { data, error } = await supabase
      .from("calculation_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  }

  // Toggle expanded state for an item
  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Helper function to render key-value pairs in a readable format
  const renderKeyValuePairs = (obj, isOutput = false) => {
    console.log("🔍 renderKeyValuePairs called with:", obj, "Type:", typeof obj);
    if (!obj || typeof obj !== "object") {
      console.log("⚠️ Not an object:", obj);
      return <span className="text-gray-500">No data</span>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium text-gray-700">
              {key.replace(/_/g, ' ')}:
            </span>
            {Array.isArray(value) ? (
              value.every(v => typeof v === "object") ? (
                <div className="ml-4 mt-1">
                  {value.map((item, idx) => (
                    <div key={idx} className="p-2 border rounded bg-gray-50 mb-2">
                      {renderKeyValuePairs(item, isOutput)}
                    </div>
                  ))}
                </div>
              ) : (
                <span className={`ml-2 ${isOutput ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                  {value.join(", ")}
                </span>
              )
            ) : typeof value === "object" && value !== null ? (
              <div className="ml-4 mt-1">{renderKeyValuePairs(value, isOutput)}</div>
            ) : (
              <span className={`ml-2 ${isOutput ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                {typeof value === 'number'
                  ? (key.includes('ratio') || key.includes('percent')
                      ? `${value.toFixed(2)}%`
                      : `PKR ${value.toLocaleString()}`)
                  : String(value)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper function to parse JSON safely
  const parseJSON = (jsonString) => {
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  // Helper function to render summary for collapsed view
  const renderSummary = (item) => {
    const inputs = parseJSON(item.inputs);
    const outputs = parseJSON(item.output);

    
    switch (item.calculator) {
      case 'Zakat':
        return (
          <div className="text-sm text-gray-600">
            <span>Cash: PKR {inputs?.cash?.toLocaleString() || 0}</span>
            {outputs?.zakat_due && (
              <span className="ml-4 text-green-600 font-semibold">
                Zakat Due: PKR {outputs.zakat_due.toLocaleString()}
              </span>
            )}
          </div>
        );
      
      case 'Takaful':
        return (
          <div className="text-sm text-gray-600">
            <span>Coverage: PKR {inputs?.coverage_amount?.toLocaleString() || 0}</span>
            {outputs?.annual_contribution && (
              <span className="ml-4 text-blue-600 font-semibold">
                Annual: PKR {outputs.annual_contribution.toLocaleString()}
              </span>
            )}
          </div>
        );

        case 'Murabaha':
        return (
          <div className="text-sm text-gray-600">
            <span>Asset cost: PKR {inputs?.asset_cost?.toLocaleString() || 0}</span>
            {outputs?.installment_amount && (
              <span className="ml-4 text-purple-600 font-semibold">
                Installment: PKR {outputs.installment_amount.toLocaleString()}
              </span>
            )}
          </div>
        );

        case 'Leasing':
        return (
          <div className="text-sm text-gray-600">
            <span>Vehicle price: PKR {inputs?.vehicle_price?.toLocaleString() || 0}</span>
            {outputs?.monthly_payment && (
              <span className="ml-4 text-purple-600 font-semibold">
                Installment: PKR {outputs.monthly_payment.toLocaleString()}
              </span>
            )}
          </div>
        );

        case 'Istisna':
        return (
          <div className="text-sm text-gray-600">
            <span>Manufacturing cost: PKR {inputs?.manufacturing_cost?.toLocaleString() || 0}</span>
            {outputs?.installment_amount && (
              <span className="ml-4 text-purple-600 font-semibold">
                Installment: PKR {outputs.installment_amount.toLocaleString()}
              </span>
            )}
          </div>
        );

        case 'Pension Planner':
        return (
          <div className="text-sm text-gray-600">
            <span>Current age: {inputs?.current_age?.toLocaleString() || 0}</span>
            {outputs?.future_value && (
              <span className="ml-4 text-yellow-600 font-semibold">
                Retirement Fund: PKR {outputs.future_value.toLocaleString()}
              </span>
            )}
          </div>
        );
      
      case 'Qard-e-Hasan':
        return (
          <div className="text-sm text-gray-600">
            <span>Loan: PKR {inputs?.loan_amount?.toLocaleString() || 0}</span>
            {outputs?.installment_amount && (
              <span className="ml-4 text-purple-600 font-semibold">
                Installment: PKR {outputs.installment_amount.toLocaleString()}
              </span>
            )}
          </div>
        );
      
      case 'Mudarabah':
        return (
          <div className="text-sm text-gray-600">
            <span>Investment: PKR {inputs?.rabbul_mal_investment?.toLocaleString() || 0}</span>
            {outputs?.net_profit !== undefined && (
              <span className={`ml-4 font-semibold ${outputs.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {outputs.net_profit >= 0 ? 'Profit' : 'Loss'}: PKR {Math.abs(outputs.net_profit).toLocaleString()}
              </span>
            )}
          </div>
        );
      
      default:
        return <div className="text-sm text-gray-500">View details for more information</div>;
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-120 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-100 sticky top-0">
        <h2 className="text-lg font-semibold">Calculation History</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-lg font-bold"
        >
          ✖
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Loading...
        </div>
      ) : history.length === 0 ? (
        <div className="p-4 text-gray-500 text-center">
          <div className="text-4xl mb-2">📊</div>
          No calculation history found
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {history.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const inputs = parseJSON(item.inputs);
            const outputs = parseJSON(item.output);
            
            return (
              <div
                key={item.id}
                className="border border-gray-300 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                {/* Header - Always visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-lg">
                          {item.calculator || item.calculator_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(item.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {!isExpanded && renderSummary(item)}
                    </div>
                    <div className="ml-2">
                      <span className={`transform transition-transform duration-200 inline-block ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-6">
                    {/* Inputs */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Inputs
                      </h4>
                      <div className="bg-white p-3 rounded border">
                        {inputs ? renderKeyValuePairs(inputs) : (
                          <span className="text-gray-500">No input data</span>
                        )}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Results
                      </h4>
                      <div className="bg-white p-3 rounded border">
                        {outputs ? renderKeyValuePairs(outputs, true) : (
                          <span className="text-gray-500">No output data</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}