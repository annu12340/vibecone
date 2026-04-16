import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, UserX, Calendar, FileText, CheckCircle } from 'lucide-react';

const PrisonerManagement = () => {
  const [prisoners, setPrisoners] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBehaviorForm, setShowBehaviorForm] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [newPrisoner, setNewPrisoner] = useState({
    name: '',
    prisoner_id_number: '',
    case_id: '',
    admission_date: '',
    expected_release_date: ''
  });

  const [behaviorRecord, setBehaviorRecord] = useState({
    recorded_by: '',
    description: '',
    type: 'positive'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPrisoners();
    fetchCases();
  }, []);

  const fetchPrisoners = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prisoners`);
      const data = await response.json();
      setPrisoners(data);
    } catch (error) {
      console.error('Error fetching prisoners:', error);
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

  const handleAddPrisoner = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/prisoners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrisoner)
      });
      
      if (response.ok) {
        await fetchPrisoners();
        setShowAddForm(false);
        setNewPrisoner({
          name: '',
          prisoner_id_number: '',
          case_id: '',
          admission_date: '',
          expected_release_date: ''
        });
      }
    } catch (error) {
      console.error('Error adding prisoner:', error);
    }
  };

  const handleAddBehaviorRecord = async (prisonerId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prisoners/${prisonerId}/behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(behaviorRecord)
      });
      
      if (response.ok) {
        await fetchPrisoners();
        setShowBehaviorForm(null);
        setBehaviorRecord({
          recorded_by: '',
          description: '',
          type: 'positive'
        });
      }
    } catch (error) {
      console.error('Error adding behavior record:', error);
    }
  };

  const handleReleasePrisoner = async (prisonerId) => {
    const actualReleaseDate = new Date().toISOString();
    try {
      const response = await fetch(`${BACKEND_URL}/api/prisoners/${prisonerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'released',
          actual_release_date: actualReleaseDate
        })
      });
      
      if (response.ok) {
        await fetchPrisoners();
      }
    } catch (error) {
      console.error('Error releasing prisoner:', error);
    }
  };

  const handleCertifyGoodBehavior = async (prisonerId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prisoners/${prisonerId}/certify`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        await fetchPrisoners();
      }
    } catch (error) {
      console.error('Error certifying good behavior:', error);
    }
  };

  const filteredPrisoners = filterStatus === 'all' 
    ? prisoners 
    : prisoners.filter(p => p.status === filterStatus);

  const imprisonedCount = prisoners.filter(p => p.status === 'imprisoned').length;
  const releasedCount = prisoners.filter(p => p.status === 'released').length;
  const certifiedCount = prisoners.filter(p => p.good_behavior_certified).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading prisoners...</div>
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
                Prisoner Management
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Manage prisoner records, track behavior, certify good conduct, and mark releases.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#0B192C] text-white px-6 py-3 rounded-none border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add Prisoner
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border-2 border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserX className="text-orange-600" size={24} />
              <span className="text-sm font-medium text-slate-600">IMPRISONED</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-[#0B192C]">
              {imprisonedCount}
            </div>
          </div>

          <div className="border-2 border-green-500 p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="text-green-700" size={24} />
              <span className="text-sm font-medium text-green-700">RELEASED</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-green-700">
              {releasedCount}
            </div>
          </div>

          <div className="border-2 border-[#C5A059] p-6 bg-yellow-50">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-[#C5A059]" size={24} />
              <span className="text-sm font-medium text-[#C5A059]">CERTIFIED GOOD BEHAVIOR</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-[#C5A059]">
              {certifiedCount}
            </div>
          </div>
        </div>

        {/* Add Prisoner Form */}
        {showAddForm && (
          <div className="border-2 border-[#0B192C] p-8 mb-12">
            <h2 className="font-playfair text-2xl font-bold text-[#0B192C] mb-6">
              Add New Prisoner
            </h2>
            <form onSubmit={handleAddPrisoner} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prisoner Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newPrisoner.name}
                    onChange={(e) => setNewPrisoner({...newPrisoner, name: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prisoner ID Number
                  </label>
                  <input
                    required
                    type="text"
                    value={newPrisoner.prisoner_id_number}
                    onChange={(e) => setNewPrisoner({...newPrisoner, prisoner_id_number: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                    placeholder="e.g., PID-2026-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Related Case (Optional)
                  </label>
                  <select
                    value={newPrisoner.case_id}
                    onChange={(e) => setNewPrisoner({...newPrisoner, case_id: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                  >
                    <option value="">-- No case linked --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admission Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newPrisoner.admission_date}
                    onChange={(e) => setNewPrisoner({...newPrisoner, admission_date: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Release Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newPrisoner.expected_release_date}
                    onChange={(e) => setNewPrisoner({...newPrisoner, expected_release_date: e.target.value})}
                    className="w-full border-2 border-slate-300 p-3 focus:border-[#0B192C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#0B192C] text-white px-8 py-3 border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all"
                >
                  Add Prisoner
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-white text-slate-600 px-8 py-3 border-2 border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-slate-200">
          {['all', 'imprisoned', 'released'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 font-medium transition-all ${
                filterStatus === status
                  ? 'border-b-2 border-[#0B192C] text-[#0B192C]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Prisoners List */}
        <div className="space-y-6">
          {filteredPrisoners.length === 0 ? (
            <div className="border-2 border-slate-200 p-12 text-center">
              <p className="text-lg text-slate-500">No prisoners found.</p>
            </div>
          ) : (
            filteredPrisoners.map((prisoner) => (
              <div key={prisoner.id} className="border-2 border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-[#0B192C] mb-2">
                      {prisoner.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">ID: <span className="font-medium text-[#0B192C]">{prisoner.prisoner_id_number}</span></span>
                      <span className={`px-3 py-1 text-xs font-medium border-2 ${
                        prisoner.status === 'imprisoned'
                          ? 'bg-orange-50 text-orange-700 border-orange-300'
                          : 'bg-green-50 text-green-700 border-green-300'
                      }`}>
                        {prisoner.status.toUpperCase()}
                      </span>
                      {prisoner.good_behavior_certified && (
                        <span className="px-3 py-1 text-xs font-medium border-2 bg-[#C5A059] text-white border-[#C5A059]">
                          CERTIFIED GOOD BEHAVIOR
                        </span>
                      )}
                      {prisoner.rewarded && (
                        <span className="px-3 py-1 text-xs font-medium border-2 bg-green-600 text-white border-green-600">
                          REWARDED: ₹{prisoner.reward_received.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {prisoner.status === 'imprisoned' && (
                      <button
                        onClick={() => handleReleasePrisoner(prisoner.id)}
                        className="bg-green-600 text-white px-4 py-2 text-sm border-2 border-green-600 hover:bg-white hover:text-green-600 transition-all"
                      >
                        Mark Released
                      </button>
                    )}
                    {prisoner.status === 'released' && !prisoner.good_behavior_certified && (
                      <button
                        onClick={() => handleCertifyGoodBehavior(prisoner.id)}
                        className="bg-[#C5A059] text-white px-4 py-2 text-sm border-2 border-[#C5A059] hover:bg-white hover:text-[#C5A059] transition-all"
                      >
                        Certify Good Behavior
                      </button>
                    )}
                    <button
                      onClick={() => setShowBehaviorForm(showBehaviorForm === prisoner.id ? null : prisoner.id)}
                      className="bg-[#0B192C] text-white px-4 py-2 text-sm border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all"
                    >
                      Add Behavior Record
                    </button>
                  </div>
                </div>

                {/* Prisoner Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-slate-600">Admission:</span>
                    <span className="ml-2 font-medium">{new Date(prisoner.admission_date).toLocaleDateString('en-IN')}</span>
                  </div>
                  {prisoner.expected_release_date && (
                    <div>
                      <span className="text-slate-600">Expected Release:</span>
                      <span className="ml-2 font-medium">{new Date(prisoner.expected_release_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {prisoner.actual_release_date && (
                    <div>
                      <span className="text-slate-600">Actual Release:</span>
                      <span className="ml-2 font-medium text-green-600">{new Date(prisoner.actual_release_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Behavior Records */}
                {prisoner.behavior_records && prisoner.behavior_records.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="font-medium text-[#0B192C] mb-3">Behavior Records ({prisoner.behavior_records.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {prisoner.behavior_records.map((record, idx) => (
                        <div key={idx} className={`p-3 border-l-4 ${
                          record.type === 'positive' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                        }`}>
                          <div className="flex items-start justify-between text-sm">
                            <div className="flex-1">
                              <span className={`font-medium ${record.type === 'positive' ? 'text-green-700' : 'text-red-700'}`}>
                                [{record.type.toUpperCase()}]
                              </span>
                              <span className="ml-2 text-slate-700">{record.description}</span>
                            </div>
                            <div className="text-xs text-slate-500 ml-4">
                              <div>{new Date(record.date).toLocaleDateString('en-IN')}</div>
                              <div>By: {record.recorded_by}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Behavior Record Form */}
                {showBehaviorForm === prisoner.id && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="font-medium text-[#0B192C] mb-3">Add Behavior Record</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Recorded By (Jailer Name)</label>
                        <input
                          type="text"
                          value={behaviorRecord.recorded_by}
                          onChange={(e) => setBehaviorRecord({...behaviorRecord, recorded_by: e.target.value})}
                          className="w-full border border-slate-300 p-2 text-sm focus:border-[#0B192C] focus:outline-none"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Type</label>
                        <select
                          value={behaviorRecord.type}
                          onChange={(e) => setBehaviorRecord({...behaviorRecord, type: e.target.value})}
                          className="w-full border border-slate-300 p-2 text-sm focus:border-[#0B192C] focus:outline-none"
                        >
                          <option value="positive">Positive</option>
                          <option value="negative">Negative</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs text-slate-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={behaviorRecord.description}
                          onChange={(e) => setBehaviorRecord({...behaviorRecord, description: e.target.value})}
                          className="w-full border border-slate-300 p-2 text-sm focus:border-[#0B192C] focus:outline-none"
                          placeholder="Describe the behavior"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAddBehaviorRecord(prisoner.id)}
                        disabled={!behaviorRecord.recorded_by || !behaviorRecord.description}
                        className="bg-[#0B192C] text-white px-4 py-2 text-sm border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Record
                      </button>
                      <button
                        onClick={() => setShowBehaviorForm(null)}
                        className="bg-white text-slate-600 px-4 py-2 text-sm border-2 border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrisonerManagement;
