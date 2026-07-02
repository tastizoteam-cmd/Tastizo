import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertTriangle, Loader2, IndianRupee,
  HelpCircle, ChevronRight, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { deliveryAPI } from '@food/api';
import { toast } from 'sonner';
import { formatCurrency } from '@food/utils/currency';
import useDeliveryBackNavigation from '../../hooks/useDeliveryBackNavigation';

/**
 * PocketBalanceV2 - Simple, Clean, and Grayscale (Black & White).
 * Asks for withdrawal amount first inside a bottom drawer modal.
 */
export const PocketBalanceV2 = () => {
  const navigate = useNavigate();
  const goBack = useDeliveryBackNavigation();
  const [loading, setLoading] = useState(true);
  const [walletState, setWalletState] = useState({
     pocketBalance: 0,
     weeklyEarnings: 0,
     totalBonus: 0,
     totalWithdrawn: 0,
     cashCollected: 0,
     deductions: 0,
     withdrawalLimit: 100,
     withdrawableAmount: 0,
     canWithdraw: false
  });
  const [withdrawalStatus, setWithdrawalStatus] = useState({
     status: 'No request',
     updatedAt: null
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  const formatMoney = (value) =>
    formatCurrency(Number(value) || 0, "₹").replace("₹ ", "₹");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, earningsRes, walletRes, withdrawalRes] = await Promise.all([
          deliveryAPI.getProfile(),
          deliveryAPI.getEarnings({ period: 'week' }),
          deliveryAPI.getWallet(),
          deliveryAPI.getWalletTransactions({ type: 'withdrawal', limit: 1 })
        ]);
        
        const profile = profileRes?.data?.data?.profile || {};
        const summary = earningsRes?.data?.data?.summary || {};
        const wallet = walletRes?.data?.data?.wallet || {};
        const withdrawalTx = withdrawalRes?.data?.data?.transactions?.[0] || null;
        
        const pocketBalance = Number(wallet.pocketBalance) || 0;
        const withdrawalLimit = Number(wallet.deliveryWithdrawalLimit) || 100;
        const withdrawableAmount = pocketBalance; 

        setWalletState({
           pocketBalance: pocketBalance,
           weeklyEarnings: Number(summary.totalEarnings) || 0,
           totalBonus: Number(wallet.totalBonus) || 0,
           totalWithdrawn: Number(wallet.totalWithdrawn) || 0,
           cashCollected: Number(wallet.cashInHand) || 0,
           deductions: 0, 
           withdrawalLimit,
           withdrawableAmount,
           canWithdraw: withdrawableAmount >= withdrawalLimit
        });

        if (withdrawalTx) {
           const rawStatus = String(withdrawalTx.status || 'Pending').toLowerCase();
           const statusLabel = rawStatus === 'approved' || rawStatus === 'completed'
              ? 'Approved'
              : rawStatus === 'rejected' || rawStatus === 'denied'
                 ? 'Rejected'
                 : 'Pending';
           const updatedAt = withdrawalTx.processedAt || withdrawalTx.updatedAt || withdrawalTx.createdAt || null;
           setWithdrawalStatus({
              status: statusLabel,
              updatedAt: updatedAt ? new Date(updatedAt).toLocaleString('en-IN', {
                 day: '2-digit',
                 month: 'short',
                 year: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit'
              }) : null
           });
        } else {
           setWithdrawalStatus({ status: 'No request', updatedAt: null });
        }
      } catch (err) {
        toast.error('Failed to load pocket details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWithdrawClick = async () => {
     // Verify bank details first
     const profileRes = await deliveryAPI.getProfile();
     const profile = profileRes?.data?.data?.profile || {};
     const bank = profile?.documents?.bankDetails;
     
     if (!bank?.accountNumber) {
        toast.error("Please add bank details first");
        navigate("/food/delivery/profile/details");
        return;
     }

     // Open withdraw popup
     setWithdrawAmount(walletState.withdrawableAmount.toString());
     setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
     const amt = parseFloat(withdrawAmount);
     if (isNaN(amt) || amt < walletState.withdrawalLimit) {
        toast.error(`Minimum withdrawal amount is ${formatMoney(walletState.withdrawalLimit)}`);
        return;
     }
     if (amt > walletState.withdrawableAmount) {
        toast.error(`Cannot withdraw more than ${formatMoney(walletState.withdrawableAmount)}`);
        return;
     }

     setWithdrawSubmitting(true);
     try {
        const res = await deliveryAPI.createWithdrawalRequest({
           amount: amt,
           paymentMethod: 'bank_transfer'
        });
        if (res?.data?.success) {
           toast.success("Withdrawal request submitted");
           setShowWithdrawModal(false);
           window.location.reload();
        }
     } catch (err) {
        toast.error("Withdrawal failed");
     } finally {
        setWithdrawSubmitting(false);
     }
  };

  const DetailRow = ({ label, value, subLabel }) => (
     <div className="py-4 flex justify-between items-start border-b border-gray-100">
        <div className="flex-1 pr-4">
           <p className="text-sm font-semibold text-gray-800">{label}</p>
           {subLabel && <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{subLabel}</p>}
        </div>
        <p className="text-sm font-bold text-gray-900">{value}</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-poppins pb-32">
       {/* Header */}
       <div className="bg-white border-b border-gray-100 px-6 py-4 safe-top flex items-center gap-4 sticky top-0 z-[100] shadow-sm">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100 active:scale-90 transition-all">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-950 leading-none">Pocket balance</h1>
       </div>

       {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-black" />
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading Balance...</p>
          </div>
       ) : (
          <>
             {/* Warning Banner */}
             {!walletState.canWithdraw && (
               <div className="bg-yellow-50/85 p-4 flex items-start gap-3 border-b border-yellow-100/50">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-600" />
                  <div>
                     <p className="text-xs font-bold text-yellow-800">Withdraw currently disabled</p>
                     <p className="text-[10px] font-medium text-yellow-700 leading-tight mt-1">
                        {walletState.withdrawableAmount <= 0 
                           ? 'Withdrawable amount is ₹0' 
                           : `Minimum withdrawal requirement is ${formatMoney(walletState.withdrawalLimit)}`}
                     </p>
                  </div>
               </div>
             )}

             {/* Top Withdraw Section */}
             <div className="bg-white p-8 text-center border-b border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Withdrawable Amount</p>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">{formatMoney(walletState.withdrawableAmount)}</h2>
                
                <button 
                  onClick={handleWithdrawClick}
                  disabled={!walletState.canWithdraw}
                  className={`w-full py-4 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-[0.98] ${
                     walletState.canWithdraw 
                     ? 'bg-black text-white hover:bg-gray-900' 
                     : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50'
                  } flex items-center justify-center gap-2`}
                >
                   Withdraw
                </button>
             </div>

             {/* Details Section */}
             <div className="px-5 py-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="bg-gray-50/50 py-3 px-4 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Pocket Details</p>
                   </div>

                   <div className="px-4">
                      <DetailRow label="Earnings" value={formatMoney(walletState.weeklyEarnings)} />
                      <DetailRow label="Bonus" value={formatMoney(walletState.totalBonus)} />
                      <DetailRow label="Amount withdrawn" value={formatMoney(walletState.totalWithdrawn)} />
                      <DetailRow label="Cash collected" value={formatMoney(walletState.cashCollected)} />
                      <DetailRow label="Deductions" value={formatMoney(walletState.deductions)} />
                      <DetailRow label="Pocket balance" value={formatMoney(walletState.pocketBalance)} />
                      <DetailRow
                         label="Withdrawal status"
                         value={withdrawalStatus.status}
                         subLabel={withdrawalStatus.updatedAt ? `Updated: ${withdrawalStatus.updatedAt}` : 'Admin approval status'}
                      />
                      <DetailRow 
                         label="Min. withdrawal amount" 
                         value={formatMoney(walletState.withdrawalLimit)} 
                         subLabel="Withdrawal allowed only when withdrawable amount reaches this limit."
                      />
                      <DetailRow label="Withdrawable amount" value={formatMoney(walletState.withdrawableAmount)} />
                   </div>
                </div>
             </div>
          </>
       )}

       {/* WITHDRAW MODAL */}
       <AnimatePresence>
          {showWithdrawModal && (
             <div className="fixed inset-0 z-[1000] flex items-end">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWithdrawModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full bg-white rounded-t-[2rem] p-6 pb-10 shadow-2xl z-10 border-t border-gray-50">
                   <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                   
                   <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-700">
                         <IndianRupee className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-950 mb-1">Withdraw Cash</h3>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Settle Hand Dues</p>
                   </div>
                   
                   <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                         <span className="text-[13px] font-medium text-gray-500">Withdrawable Balance</span>
                         <span className="text-sm font-bold text-gray-900">{formatMoney(walletState.withdrawableAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                         <span className="text-[13px] font-medium text-gray-500">Min. Withdrawal Limit</span>
                         <span className="text-sm font-bold text-gray-900">{formatMoney(walletState.withdrawalLimit)}</span>
                      </div>
                      <div className="relative pt-2">
                         <span className="absolute left-4 top-1/2 translate-y-[-10%] text-gray-400 font-bold text-lg">₹</span>
                         <input 
                            type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 text-lg font-bold text-gray-900 focus:bg-white focus:border-black outline-none transition-all"
                         />
                      </div>
                      <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">{`Minimum amount ${formatMoney(walletState.withdrawalLimit)}`}</p>
                   </div>
                   
                    <div className="space-y-2">
                       <button 
                          onClick={handleConfirmWithdraw}
                          disabled={withdrawSubmitting}
                          className="w-full py-4 bg-black hover:bg-gray-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400"
                       >
                          {withdrawSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <ShieldCheck className="w-4 h-4" />}
                          {withdrawSubmitting ? 'Processing...' : 'Confirm Withdraw'}
                       </button>
                       
                       <button onClick={() => setShowWithdrawModal(false)} className="w-full py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider hover:text-gray-900 transition-colors">Cancel</button>
                    </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default PocketBalanceV2;
