import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Award, Users, Sparkles, AlertCircle } from 'lucide-react';

const RewardFundDashboard = () => {
  const [fundStatus, setFundStatus] = useState(null);
  const [eligiblePrisoners, setEligiblePrisoners] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lotteryLoading, setLotteryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fundRes, eligibleRes, distRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/reward-fund/status`),
        fetch(`${BACKEND_URL}/api/prisoners/eligible`),
        fetch(`${BACKEND_URL}/api/reward-distributions`)
      ]);

      const fundData = await fundRes.json();
      const eligibleData = await eligibleRes.json();
      const distData = await distRes.json();

      setFundStatus(fundData);
      setEligiblePrisoners(eligibleData);
      setDistributions(distData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load reward fund data');
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  const runLottery = async () => {
    if (eligiblePrisoners.length < 3) {
      setError(`Cannot run lottery: Need at least 3 eligible prisoners, but only ${eligiblePrisoners.length} found.`);
      return;
    }

    if (!fundStatus || fundStatus.total_balance <= 0) {
      setError('Cannot run lottery: Reward fund balance is zero.');
      return;
    }

    setLotteryLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/reward-distributions/lottery`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Lottery complete! 3 winners selected. Each received ₹${result.amount_per_prisoner.toLocaleString('en-IN')}`);
        await fetchData(); // Refresh all data
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to run lottery');
      }
    } catch (error) {
      console.error('Error running lottery:', error);
      setError('Error running lottery. Please try again.');
    } finally {
      setLotteryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading reward fund dashboard...</div>
      </div>
    );
  }

  const amountPerWinner = eligiblePrisoners.length >= 3 && fundStatus?.total_balance > 0
    ? fundStatus.total_balance / 3
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="font-playfair text-5xl font-bold text-[#0B192C] mb-4">
            Reward Fund Dashboard
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Lottery-based reward distribution for prisoners released with good behavior. 
            Every lottery round randomly selects 3 winners who share the fund equally.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Alerts */}
        {error && (
          <div className="mb-6 border-2 border-red-500 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-red-800">{error}</div>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 border-2 border-green-500 bg-green-50 p-4 flex items-start gap-3">
            <Award className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-green-800 font-medium">{success}</div>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {/* Fund Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-green-500 bg-green-50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-700" size={28} />
              <span className="text-xs font-medium text-green-700">CURRENT BALANCE</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-green-700">
              ₹{fundStatus?.total_balance?.toLocaleString('en-IN') || '0'}
            </div>
          </div>

          <div className="border-2 border-slate-300 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-slate-600" size={28} />
              <span className="text-xs font-medium text-slate-600">TOTAL COLLECTED</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-[#0B192C]">
              ₹{fundStatus?.total_collected_from_fines?.toLocaleString('en-IN') || '0'}
            </div>
          </div>

          <div className="border-2 border-[#C5A059] bg-yellow-50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-[#C5A059]" size={28} />
              <span className="text-xs font-medium text-[#C5A059]">TOTAL DISTRIBUTED</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-[#C5A059]">
              ₹{fundStatus?.total_distributed?.toLocaleString('en-IN') || '0'}
            </div>
          </div>

          <div className="border-2 border-slate-300 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-slate-600" size={28} />
              <span className="text-xs font-medium text-slate-600">ELIGIBLE PRISONERS</span>
            </div>
            <div className="font-playfair text-4xl font-bold text-[#0B192C]">
              {eligiblePrisoners.length}
            </div>
          </div>
        </div>

        {/* Lottery Section */}
        <div className="border-2 border-[#C5A059] bg-gradient-to-r from-yellow-50 to-white p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-[#C5A059]" size={32} />
            <h2 className="font-playfair text-3xl font-bold text-[#0B192C]">
              Run Lottery Draw
            </h2>
          </div>
          
          <p className="text-slate-700 mb-6 max-w-3xl">
            The lottery system randomly selects <strong>3 prisoners</strong> from the eligible pool and distributes the current fund balance equally among them. 
            Each winner receives one-third of the total balance as support for their second life livelihood.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Current Fund Balance</div>
              <div className="font-playfair text-2xl font-bold text-green-600">
                ₹{fundStatus?.total_balance?.toLocaleString('en-IN') || '0'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Winners Per Draw</div>
              <div className="font-playfair text-2xl font-bold text-[#0B192C]">
                3 Prisoners
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Amount Per Winner</div>
              <div className="font-playfair text-2xl font-bold text-[#C5A059]">
                ₹{amountPerWinner.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            onClick={runLottery}
            disabled={lotteryLoading || eligiblePrisoners.length < 3 || !fundStatus || fundStatus.total_balance <= 0}
            className="bg-[#C5A059] text-white px-8 py-4 text-lg font-medium border-2 border-[#C5A059] hover:bg-white hover:text-[#C5A059] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {lotteryLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Running Lottery...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Run Lottery & Select 3 Winners
              </>
            )}
          </button>

          {eligiblePrisoners.length < 3 && (
            <div className="mt-4 text-sm text-orange-600">
              ⚠ Need at least 3 eligible prisoners to run lottery. Currently: {eligiblePrisoners.length}
            </div>
          )}
          {fundStatus && fundStatus.total_balance <= 0 && (
            <div className="mt-4 text-sm text-orange-600">
              ⚠ Fund balance is zero. Collect more fines to build the reward pool.
            </div>
          )}
        </div>

        {/* Eligible Prisoners List */}
        <div className="mb-12">
          <h2 className="font-playfair text-3xl font-bold text-[#0B192C] mb-6">
            Eligible Prisoners ({eligiblePrisoners.length})
          </h2>
          
          {eligiblePrisoners.length === 0 ? (
            <div className="border-2 border-slate-200 p-12 text-center">
              <p className="text-lg text-slate-500">
                No eligible prisoners yet. Prisoners must be released and certified for good behavior to be eligible.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligiblePrisoners.map((prisoner) => (
                <div key={prisoner.id} className="border-2 border-slate-200 p-4 hover:border-green-500 hover:bg-green-50 transition-all">
                  <h3 className="font-playfair text-xl font-bold text-[#0B192C] mb-2">
                    {prisoner.name}
                  </h3>
                  <div className="text-sm space-y-1">
                    <div className="text-slate-600">
                      ID: <span className="font-medium text-[#0B192C]">{prisoner.prisoner_id_number}</span>
                    </div>
                    <div className="text-green-600 font-medium">
                      ✓ Released & Certified
                    </div>
                    {prisoner.actual_release_date && (
                      <div className="text-xs text-slate-500">
                        Released: {new Date(prisoner.actual_release_date).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribution History */}
        <div>
          <h2 className="font-playfair text-3xl font-bold text-[#0B192C] mb-6">
            Lottery Distribution History
          </h2>
          
          {distributions.length === 0 ? (
            <div className="border-2 border-slate-200 p-12 text-center">
              <p className="text-lg text-slate-500">No lottery draws have been conducted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {distributions.map((dist) => (
                <div key={dist.id} className="border-2 border-[#C5A059] p-6 bg-yellow-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="text-[#C5A059]" size={24} />
                        <h3 className="font-playfair text-2xl font-bold text-[#0B192C]">
                          Lottery Round #{dist.lottery_round}
                        </h3>
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(dist.distribution_date).toLocaleString('en-IN', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 mb-1">Total Distributed</div>
                      <div className="font-playfair text-3xl font-bold text-[#C5A059]">
                        ₹{dist.amount_distributed.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        ₹{dist.amount_per_prisoner.toLocaleString('en-IN')} per winner
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-[#C5A059] pt-4">
                    <h4 className="font-medium text-[#0B192C] mb-3">Winners:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {dist.selected_prisoners.map((winner, idx) => (
                        <div key={idx} className="bg-white border-2 border-[#C5A059] p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="text-[#C5A059]" size={20} />
                            <span className="font-medium text-[#0B192C]">Winner {idx + 1}</span>
                          </div>
                          <div className="font-playfair text-lg font-bold text-[#0B192C] mb-1">
                            {winner.prisoner_name}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Received: ₹{winner.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
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

export default RewardFundDashboard;
