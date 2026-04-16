import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, FileText } from 'lucide-react';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    case_id: '',
    case_title: '',
    convicted_party: '',
    amount: '',
    description: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchFines();
    fetchCases();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/fines`);
      const data = await response.json();
      setFines(data);
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cases`);
      const data = await response.json();
      setCases(data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/fines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });
      
      if (response.ok) {
        await fetchFines();
        setShowForm(false);
        setFormData({
          case_id: '',
          case_title: '',
          convicted_party: '',
          amount: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating fine:', error);
    }
  };

  const handleCaseSelect = (e) => {
    const selectedCase = cases.find(c => c.id === e.target.value);
    if (selectedCase) {
      setFormData({
        ...formData,
        case_id: selectedCase.id,
        case_title: selectedCase.title
      });
    }
  };

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
  const totalRewardFund = fines.reduce((sum, fine) => sum + (fine.allocation?.reward_fund || 0), 0);
  const totalGovernment = fines.reduce((sum, fine) => sum + (fine.allocation?.government || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading fines...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-5xl font-bold text-[#0B192C] mb-4">
                Fine Management
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Record fines collected from convictions. 30% automatically allocated to reward fund for prisoners with good behavior.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0B192C] text-white px-6 py-3 rounded-none border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Record Fine
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border-2 border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-[#0B192C]" size={24} />
              <span className="text-sm font-medium text-slate-600">TOTAL FINES COLLECTED</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-[#0B192C]">
              ₹{totalFines.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="border-2 border-green-500 p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-700" size={24} />
              <span className="text-sm font-medium text-green-700">REWARD FUND (30%)</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-green-700">
              ₹{totalRewardFund.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="border-2 border-slate-300 p-6 bg-slate-50">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-slate-600" size={24} />
              <span className="text-sm font-medium text-slate-600">GOVERNMENT (70%)</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-slate-600">
              ₹{totalGovernment.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Fine Entry Form */}
        {showForm && (
          <div className="border-2 border-[#0B192C] p-8 mb-12">
            <h2 className="font-playfair text-2xl font-bold text-[#0B192C] mb-6">
              Record New Fine
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Case
                  </label>
                  <select
                    required
                    value={formData.case_id}
                    onChange={handleCaseSelect}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                  >
                    <option value="">-- Select a case --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Convicted Party Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.convicted_party}
                    onChange={(e) => setFormData({...formData, convicted_party: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                    placeholder="Enter name of convicted individual/entity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fine Amount (₹)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                    placeholder="Enter amount"
                  />
                  {formData.amount && (
                    <div className="mt-2 text-sm">
                      <span className="text-green-600 font-medium">Reward Fund: ₹{(parseFloat(formData.amount) * 0.30).toFixed(2)}</span>
                      {' | '}
                      <span className="text-slate-600">Government: ₹{(parseFloat(formData.amount) * 0.70).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#0B192C] text-white px-8 py-3 border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all"
                >
                  Submit Fine
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white text-slate-600 px-8 py-3 border-2 border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fines List */}
        <div>
          <h2 className="font-playfair text-3xl font-bold text-[#0B192C] mb-6">
            Recorded Fines
          </h2>
          
          {fines.length === 0 ? (
            <div className="border-2 border-slate-200 p-12 text-center">
              <p className="text-lg text-slate-500">No fines recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fines.map((fine) => (
                <div key={fine.id} className="border-2 border-slate-200 p-6 hover:border-slate-400 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-playfair text-xl font-bold text-[#0B192C] mb-2">
                        {fine.case_title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Convicted Party:</span>
                          <span className="ml-2 font-medium text-[#0B192C]">{fine.convicted_party}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Date Collected:</span>
                          <span className="ml-2 font-medium text-[#0B192C]">
                            {new Date(fine.date_collected).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {fine.description && (
                          <div className="md:col-span-2">
                            <span className="text-slate-600">Description:</span>
                            <span className="ml-2 text-slate-800">{fine.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-8 text-right">
                      <div className="font-playfair text-3xl font-bold text-[#0B192C] mb-2">
                        ₹{fine.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="text-green-600 font-medium">
                          Reward Fund: ₹{(fine.allocation?.reward_fund || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-slate-500">
                          Government: ₹{(fine.allocation?.government || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FineManagement;
