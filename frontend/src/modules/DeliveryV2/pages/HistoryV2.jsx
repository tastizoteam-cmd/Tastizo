import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, ChevronDown, Loader2, Gift, X, 
  CheckCircle2, Clock, Search, History,
  ArrowDownRight, ArrowUpRight, XCircle, Wallet, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { deliveryAPI } from '@food/api';
import { formatCurrency } from '@food/utils/currency';
import { toast } from 'sonner';
import useDeliveryBackNavigation from '../hooks/useDeliveryBackNavigation';

/**
 * HistoryV2 - EXACT 1:1 Match with User Screenshot + Cash Deposit & Withdrawal History.
 * Theme: Clean White
 * Accent: Emerald Green (#10B981)
 * Font: Poppins
 */
export const HistoryV2 = () => {
  const goBack = useDeliveryBackNavigation();
  const [activeCategory, setActiveCategory] = useState("trips"); // 'trips' | 'deposits' | 'withdrawals'
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTripType, setSelectedTripType] = useState("ALL TRIPS");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTripTypePicker, setShowTripTypePicker] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusTransactions, setBonusTransactions] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const formatMoney = (value) =>
    formatCurrency(Number(value) || 0, "\u20B9").replace("\u20B9 ", "\u20B9");
  const getTripEarning = (trip) =>
    Number(
      trip?.deliveryEarning ??
        trip?.earningAmount ??
        trip?.amount ??
        trip?.riderEarning ??
        trip?.earnings ??
        trip?.deliveryFee ??
        trip?.pricing?.deliveryFee ??
        0,
    );

  const tripTypes = ["ALL TRIPS", "Completed", "Cancelled", "Pending"];

  // Fetch Trips Logic
  useEffect(() => {
    if (activeCategory !== "trips") return;
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const params = {
          period: activeTab,
          date: dateStr,
          status: selectedTripType !== "ALL TRIPS" ? selectedTripType : undefined,
          limit: 1000
        };
        
        const response = await deliveryAPI.getTripHistory(params);
        if (response.data?.success) {
          setTrips(response.data.data.trips || []);
        }
      } catch (error) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [selectedDate, activeTab, selectedTripType, activeCategory]);

  // Fetch Deposits Logic
  useEffect(() => {
    if (activeCategory === "deposits") {
      const fetchDeposits = async () => {
        setDepositsLoading(true);
        try {
          const res = await deliveryAPI.getWalletTransactions({ type: "deposit", limit: 100 });
          if (res.data?.success) {
            setDeposits((res.data.data.transactions || []).filter(t => String(t.type || '').toLowerCase() === 'deposit'));
          }
        } catch (error) {
          toast.error("Failed to load cash deposit history");
        } finally {
          setDepositsLoading(false);
        }
      };
      fetchDeposits();
    }
  }, [activeCategory]);

  // Fetch Withdrawals Logic
  useEffect(() => {
    if (activeCategory === "withdrawals") {
      const fetchWithdrawals = async () => {
        setWithdrawalsLoading(true);
        try {
          const res = await deliveryAPI.getWalletTransactions({ type: "withdrawal", limit: 100 });
          if (res.data?.success) {
            setWithdrawals((res.data.data.transactions || []).filter(t => String(t.type || '').toLowerCase() === 'withdrawal'));
          }
        } catch (error) {
          toast.error("Failed to load withdrawal history");
        } finally {
          setWithdrawalsLoading(false);
        }
      };
      fetchWithdrawals();
    }
  }, [activeCategory]);

  // Bonus Logic
  useEffect(() => {
     if (showBonusModal) {
        const fetchBonus = async () => {
           setBonusLoading(true);
           try {
              const res = await deliveryAPI.getWalletTransactions({ type: 'bonus', limit: 50 });
              if (res.data?.success) setBonusTransactions(res.data.data.transactions || []);
           } catch (e) { toast.error("Failed to load bonuses"); }
           finally { setBonusLoading(false); }
        };
        fetchBonus();
     }
  }, [showBonusModal]);

  const getWeekDisplayRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const format = (dateObj) => dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return `${format(start)} - ${format(end)}`;
  };

  const formatDateDisplay = (date) => {
    if (activeTab === 'monthly') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (activeTab === 'weekly') {
      return getWeekDisplayRange(date);
    }
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const day = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    if (date.toDateString() === today.toDateString()) return `Today: ${day}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday: ${day}`;
    return day;
  };

  const dateOptions = useMemo(() => {
    if (activeTab === 'monthly') {
      return [...Array(6)].map((_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        return d;
      });
    }
    if (activeTab === 'weekly') {
      return [...Array(8)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        return d;
      });
    }
    return [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });
  }, [activeTab]);

  useEffect(() => {
    setSelectedDate(new Date());
  }, [activeTab]);

  const metrics = useMemo(() => {
     return trips.reduce((acc, trip) => {
        if (trip.status === 'Completed') {
           acc.earnings += getTripEarning(trip);
           const isCOD = (trip.paymentMethod || '').toLowerCase() === 'cash' || (trip.paymentMethod || '').toLowerCase() === 'cod';
           if (isCOD) acc.cod += Number(trip.codCollectedAmount || trip.orderTotal || 0);
        }
        return acc;
     }, { earnings: 0, cod: 0 });
  }, [trips]);

  const depositsMetrics = useMemo(() => {
     return deposits.reduce((acc, tx) => {
        const s = (tx.status || '').toLowerCase();
        if (s === 'completed' || s === 'approved' || s === 'success') {
           acc.total += Number(tx.amount || 0);
           acc.count += 1;
        }
        return acc;
     }, { total: 0, count: 0 });
  }, [deposits]);

  const withdrawalsMetrics = useMemo(() => {
     return withdrawals.reduce((acc, tx) => {
        const s = (tx.status || '').toLowerCase();
        if (s === 'completed' || s === 'approved' || s === 'success' || s === 'processed') {
           acc.completed += Number(tx.amount || 0);
        } else if (s === 'pending' || s === 'processing' || s === 'requested') {
           acc.pending += Number(tx.amount || 0);
        }
        return acc;
     }, { completed: 0, pending: 0 });
  }, [withdrawals]);

  const extractItems = (trip) => {
    const items = trip.items || trip.orderItems || [];
    if (items.length === 0) return 'Standard Delivery';
    const first = items[0];
    const qty = first.quantity || first.qty || 1;
    const name = first.name || first.itemName || 'Item';
    return `${qty}x ${name}${items.length > 1 ? ` +${items.length - 1} more` : ''}`;
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed' || s === 'approved' || s === 'success' || s === 'processed') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {status || 'Completed'}
        </span>
      );
    }
    if (s === 'pending' || s === 'processing' || s === 'requested') {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Clock className="w-3 h-3 text-blue-600" />
          {status || 'Pending'}
        </span>
      );
    }
    if (s === 'denied' || s === 'rejected' || s === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <XCircle className="w-3 h-3 text-red-600" />
          {status || 'Rejected'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
        <Clock className="w-3 h-3 text-gray-500" />
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-poppins pb-32">
       {/* 1. Header (Clean White / Minimal) */}
       <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100 active:scale-90 transition-all">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <h1 className="text-xl font-bold text-gray-950 uppercase tracking-tight">History</h1>
               <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Your delivery & wallet records</p>
            </div>
          </div>
          <button onClick={() => setShowBonusModal(true)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100 relative active:scale-90 transition-all">
             <Gift className="w-5 h-5" />
             {bonusTransactions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                   {bonusTransactions.length}
                </span>
             )}
          </button>
       </div>

       {/* Category Switcher: Trips / Deposits / Withdrawals */}
       <div className="bg-white px-4 pt-2 pb-3 sticky top-[73px] z-[95] border-b border-gray-100 shadow-xs">
          <div className="flex bg-gray-100/80 p-1 rounded-xl">
            {[
              { id: 'trips', label: 'Trips', icon: Clock },
              { id: 'deposits', label: 'Cash Deposits', icon: ArrowDownRight },
              { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isActive ? 'bg-white text-gray-950 shadow-sm font-extrabold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (item.id === 'deposits' ? 'text-emerald-600' : item.id === 'withdrawals' ? 'text-blue-600' : 'text-black') : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
       </div>

       {/* 2. Selection Tabs (Trips Only) */}
       {activeCategory === "trips" && (
         <>
           <div className="bg-white px-4 flex items-center gap-8 sticky top-[126px] z-[90] border-b border-gray-100">
              {['daily', 'weekly', 'monthly'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`py-4 text-base font-semibold capitalize relative ${activeTab === tab ? 'text-black font-bold' : 'text-gray-400'}`}
                 >
                    {tab}
                    {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                 </button>
              ))}
           </div>

           {/* 3. Filter Controls (Trips Only) */}
           <div className="bg-[#F8F9FA] px-4 py-4 flex gap-3 sticky top-[183px] z-[80]">
              <button 
                 onClick={() => { setShowDatePicker(!showDatePicker); setShowTripTypePicker(false); }}
                 className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-gray-800 shadow-sm active:scale-[0.98] transition-all"
              >
                 <span className="text-sm font-semibold">{formatDateDisplay(selectedDate)}</span>
                 <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
              </button>
              <button 
                 onClick={() => { setShowTripTypePicker(!showTripTypePicker); setShowDatePicker(false); }}
                 className="w-[140px] px-4 py-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-gray-800 shadow-sm active:scale-[0.98] transition-all"
              >
                 <span className="text-sm font-semibold">{selectedTripType}</span>
                 <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${showTripTypePicker ? 'rotate-180' : ''}`} />
              </button>
           </div>

           {/* Dropdowns */}
           <AnimatePresence>
              {showDatePicker && (
                 <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="fixed left-4 right-4 top-[245px] z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[300px] overflow-y-auto p-2">
                    {dateOptions.map((date, idx) => {
                       let isSelected = false;
                       if (activeTab === 'monthly') {
                          isSelected = date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth();
                       } else if (activeTab === 'weekly') {
                          const getStartOfWeekString = (d) => {
                             const temp = new Date(d);
                             temp.setDate(temp.getDate() - temp.getDay());
                             return temp.toDateString();
                          };
                          isSelected = getStartOfWeekString(date) === getStartOfWeekString(selectedDate);
                       } else {
                          isSelected = date.toDateString() === selectedDate.toDateString();
                       }

                       return (
                          <button 
                             key={idx} 
                             onClick={() => { setSelectedDate(date); setShowDatePicker(false); }}
                             className={`w-full text-left p-4 rounded-xl text-sm font-medium ${isSelected ? 'bg-gray-100 text-black font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                             {formatDateDisplay(date)}
                          </button>
                       );
                    })}
                 </motion.div>
              )}
              {showTripTypePicker && (
                 <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="fixed right-4 top-[245px] w-48 z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
                    {tripTypes.map((type, idx) => (
                       <button 
                          key={idx} 
                          onClick={() => { setSelectedTripType(type); setShowTripTypePicker(false); }}
                          className={`w-full text-left p-4 rounded-xl text-sm font-medium ${type === selectedTripType ? 'bg-gray-100 text-black font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                       >
                          {type}
                       </button>
                    ))}
                 </motion.div>
              )}
           </AnimatePresence>
         </>
       )}

       {/* 4. Page Content */}
       <div className="px-4 py-3 space-y-5">
          {activeCategory === "trips" && (
            <>
              {/* Performance Summary Banner */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">COD Collected</p>
                    <h3 className="text-xl font-bold text-gray-900">{formatMoney(metrics.cod)}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Earnings</p>
                    <h3 className="text-xl font-bold text-gray-900">{formatMoney(metrics.earnings)}</h3>
                 </div>
              </div>

              {/* Trip List */}
              {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-gray-400 text-xs font-medium">Fetching trips...</p>
                 </div>
              ) : trips.length > 0 ? (
                 <div className="space-y-4">
                    {trips.map((trip, idx) => {
                       const isCompleted = (trip.status || '').toLowerCase() === 'completed';
                       const isCancelled = (trip.status || '').toLowerCase() === 'cancelled';
                       const isPending = !isCompleted && !isCancelled;
                       const payout = getTripEarning(trip);
                       const isQR = (trip.paymentMethod || '').toLowerCase() === 'razorpay_qr';
                       const isCOD = (trip.paymentMethod || '').toLowerCase() === 'cash' || (trip.paymentMethod || '').toLowerCase() === 'cod';
                       const collection = Number(trip.codCollectedAmount || trip.orderTotal || trip.amount || 0);

                       return (
                          <div key={trip.orderId || idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.99] transition-all">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h4 className="text-base font-bold text-gray-900">{trip.orderId || 'ORDER-ID'}</h4>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">{trip.restaurant || trip.restaurantName || 'Sayaji'}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1">{extractItems(trip)}</p>
                                 </div>
                                 <span className={`text-sm font-bold ${isCompleted ? 'text-green-600' : isCancelled ? 'text-red-500' : 'text-orange-500'}`}>
                                    {trip.status || 'Status'}
                                 </span>
                             </div>
                             
                             <div className="flex gap-2 mb-4 mt-3">
                                 <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100">
                                    {isQR ? 'COD (QR)' : isCOD ? 'COD' : 'Online'}
                                 </span>
                             </div>

                             <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                 <div>
                                    <p className="text-[11px] font-medium text-gray-400 mb-1">Time</p>
                                    <p className="text-sm font-bold text-gray-900">{trip.time || '--:--'}</p>
                                 </div>
                                 <div className="text-center">
                                    <p className="text-[11px] font-medium text-gray-400 mb-1">{isCOD || isQR ? "COD" : "Online"}</p>
                                    <p className="text-sm font-bold text-gray-900">{formatMoney(collection)}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[11px] font-medium text-gray-400 mb-1">Earning</p>
                                    <p className="text-sm font-bold text-gray-900">{formatMoney(payout)}</p>
                                 </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              ) : (
                 <div className="py-20 text-center flex flex-col items-center">
                    <Clock className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Trips Recorded</p>
                 </div>
              )}
            </>
          )}

          {activeCategory === "deposits" && (
            <>
              {/* Deposits Summary Banner */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Deposited</p>
                    <h3 className="text-xl font-bold text-emerald-600">{formatMoney(depositsMetrics.total)}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Successful Deposits</p>
                    <h3 className="text-xl font-bold text-gray-900">{depositsMetrics.count}</h3>
                 </div>
              </div>

              {/* Deposits List */}
              {depositsLoading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-gray-400 text-xs font-medium">Fetching deposit history...</p>
                 </div>
              ) : deposits.length > 0 ? (
                 <div className="space-y-4">
                    {deposits.map((tx, idx) => {
                       const amount = Number(tx.amount || 0);
                       const desc = tx.description || 'Cash limit settlement';
                       const dateStr = new Date(tx.date || tx.createdAt || Date.now()).toLocaleDateString('en-IN', {
                         day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                       });
                       const refId = tx._id || tx.id || tx.referenceId || `DEP-${idx+1000}`;

                       return (
                          <div key={refId || idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.99] transition-all">
                             <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3">
                                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                                      <ArrowDownRight className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <h4 className="text-base font-bold text-gray-900">{formatMoney(amount)}</h4>
                                      <p className="text-xs font-medium text-gray-600 mt-0.5">{desc}</p>
                                      <p className="text-[11px] text-gray-400 font-medium mt-1">Ref: #{String(refId).slice(-8).toUpperCase()}</p>
                                   </div>
                                </div>
                                <div>
                                   {getStatusBadge(tx.status)}
                                </div>
                             </div>
                             <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400 font-medium">
                                <span>Date</span>
                                <span className="text-gray-700 font-semibold">{dateStr}</span>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              ) : (
                 <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                       <ArrowDownRight className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Cash Deposits Recorded</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[240px]">Whenever you deposit cash to settle your COD hand dues, they will appear here.</p>
                 </div>
              )}
            </>
          )}

          {activeCategory === "withdrawals" && (
            <>
              {/* Withdrawals Summary Banner */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Withdrawn</p>
                    <h3 className="text-xl font-bold text-gray-900">{formatMoney(withdrawalsMetrics.completed)}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Pending Payouts</p>
                    <h3 className="text-xl font-bold text-blue-600">{formatMoney(withdrawalsMetrics.pending)}</h3>
                 </div>
              </div>

              {/* Withdrawals List */}
              {withdrawalsLoading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-gray-400 text-xs font-medium">Fetching withdrawal history...</p>
                 </div>
              ) : withdrawals.length > 0 ? (
                 <div className="space-y-4">
                    {withdrawals.map((tx, idx) => {
                       const amount = Number(tx.amount || 0);
                       const reqDateStr = new Date(tx.date || tx.createdAt || Date.now()).toLocaleDateString('en-IN', {
                         day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                       });
                       const procDateStr = tx.processedAt ? new Date(tx.processedAt).toLocaleDateString('en-IN', {
                         day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                       }) : null;
                       const refId = tx._id || tx.id || `WTH-${idx+1000}`;

                       return (
                          <div key={refId || idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.99] transition-all">
                             <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3">
                                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                                      <ArrowUpRight className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <h4 className="text-base font-bold text-gray-900">{formatMoney(amount)}</h4>
                                      <p className="text-xs font-medium text-gray-600 mt-0.5">{tx.description || (tx.payoutMethod === 'cash_settlement' ? 'Cash Limit Settlement' : 'Bank Payout Request')}</p>
                                      <p className="text-[11px] text-gray-400 font-medium mt-1">Ref: #{String(refId).slice(-8).toUpperCase()}</p>
                                   </div>
                                </div>
                                <div>
                                   {getStatusBadge(tx.status)}
                                </div>
                             </div>
                             <div className="pt-3 border-t border-gray-100 space-y-1 text-[11px] text-gray-400 font-medium">
                                <div className="flex justify-between items-center">
                                   <span>Requested</span>
                                   <span className="text-gray-700 font-semibold">{reqDateStr}</span>
                                </div>
                                {procDateStr && (
                                   <div className="flex justify-between items-center">
                                      <span>Processed</span>
                                      <span className="text-emerald-600 font-semibold">{procDateStr}</span>
                                   </div>
                                )}
                                {tx.failureReason && (
                                   <div className="mt-2 bg-red-50 text-red-600 border border-red-100 p-2 rounded-lg font-semibold text-xs">
                                      Reason: {tx.failureReason}
                                   </div>
                                )}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              ) : (
                 <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                       <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Withdrawals Recorded</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[240px]">Your bank withdrawal requests and payouts will appear here.</p>
                 </div>
              )}
            </>
          )}
       </div>

       {/* Bonus Drawer (The Gift Modal) */}
       <AnimatePresence>
          {showBonusModal && (
             <div className="fixed inset-0 z-[1000] flex items-end">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBonusModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full bg-white rounded-t-[2.5rem] p-8 max-h-[85vh] flex flex-col shadow-2xl">
                   <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-8 shrink-0" />
                   <div className="flex items-center justify-between mb-8 shrink-0">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black border border-gray-100">
                            <Gift className="w-6 h-6" />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-gray-900">Incentive Records</h3>
                            <p className="text-xs text-gray-400 font-medium">Extra bonuses credited by team</p>
                         </div>
                      </div>
                      <button onClick={() => setShowBonusModal(false)} className="p-2 text-gray-400"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                      {bonusLoading ? (
                         <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>
                      ) : bonusTransactions.length > 0 ? bonusTransactions.map((tx, i) => (
                         <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
                            <div>
                               <p className="text-lg font-bold text-gray-900 mb-0.5">{formatMoney(tx.amount)}</p>
                               <p className="text-sm font-medium text-gray-600 line-clamp-1">{tx.description || 'Bonus Payout'}</p>
                               <p className="text-[10px] text-gray-400 font-medium mt-1">{new Date(tx.createdAt || tx.date).toLocaleDateString()}</p>
                            </div>
                            <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-gray-200">DELIVERED</span>
                         </div>
                      )) : (
                         <div className="py-20 text-center flex flex-col items-center">
                             <Search className="w-12 h-12 text-gray-200 mb-4" />
                             <p className="text-sm font-bold text-gray-400">Nothing to show</p>
                          </div>
                      )}
                   </div>
                   
                   <button onClick={() => setShowBonusModal(false)} className="w-full py-5 bg-black text-white rounded-2xl font-bold text-base mt-8 shrink-0 active:scale-95 transition-all">Okay, Got it</button>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default HistoryV2;
