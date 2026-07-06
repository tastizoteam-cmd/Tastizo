import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, IndianRupee, ArrowRight,
  ShieldCheck, AlertTriangle, HelpCircle,
  Receipt, FileText, LayoutGrid, X, ChevronRight,
  Loader2, Bell, Siren, User, CheckCircle2, Banknote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '@food/api';
import { toast } from 'sonner';
import { initRazorpayPayment } from "@food/utils/razorpay";
import { getCompanyNameAsync } from "@food/utils/businessSettings";
import { useDeliveryStore } from '@/modules/DeliveryV2/store/useDeliveryStore';
import useNotificationInbox from "@food/hooks/useNotificationInbox";

const INR_SYMBOL = "₹";

function BottomPopup({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full bg-white rounded-t-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
             <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export const PocketV2 = () => {
  const navigate = useNavigate();
  const { isOnline, toggleOnline } = useDeliveryStore();
  const { unreadCount: notificationUnreadCount } = useNotificationInbox("delivery", { limit: 20 });

  const [loading, setLoading] = useState(true);
  const [walletState, setWalletState] = useState({
    totalBalance: 0,
    cashInHand: 0,
    availableCashLimit: 0,
    totalCashLimit: 0,
    weeklyEarnings: 0,
    weeklyOrders: 0,
    payoutAmount: 0,
    payoutPeriod: 'Current Week',
    bankDetailsFilled: false,
    withdrawalLimit: 100,
    tipsBalance: 0,
    canWithdraw: false
  });

  const [activeOffer, setActiveOffer] = useState({
    targetAmount: 0,
    targetOrders: 0,
    currentOrders: 0,
    currentEarnings: 0,
    validTill: '',
    isLive: false
  });

  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  const [emergencyNumbers, setEmergencyNumbers] = useState({
    medicalEmergency: "",
    accidentHelpline: "",
    contactPolice: "",
    insurance: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, earningsRes, walletRes, emergencyRes] = await Promise.all([
          deliveryAPI.getProfile(),
          deliveryAPI.getEarnings({ period: 'week' }),
          deliveryAPI.getWallet(),
          deliveryAPI.getEmergencyHelp().catch(() => null)
        ]);

        const profile = profileRes?.data?.data?.profile || {};
        const summary = earningsRes?.data?.data?.summary || {};
        const wallet = walletRes?.data?.data?.wallet || {};
        
        const activeAddonsRes = await deliveryAPI.getActiveEarningAddons().catch(() => null);
        const activeOfferPayload =
          activeAddonsRes?.data?.data?.activeOffer ||
          activeAddonsRes?.data?.activeOffer ||
          null;
        
        const bankDetails = profile?.documents?.bankDetails;
        const isFilled = !!(bankDetails?.accountNumber);

        if (emergencyRes?.data?.success && emergencyRes.data.data) {
          setEmergencyNumbers(emergencyRes.data.data);
        }
        if (profile.profileImage?.url || profile.documents?.photo) {
          setProfileImage(profile.profileImage?.url || profile.documents?.photo);
        }

        const pocketBalance = Number(wallet.pocketBalance) || 0;
        const withdrawalLimit = Number(wallet.deliveryWithdrawalLimit) || 100;

        setWalletState({
          totalBalance: pocketBalance,
          cashInHand: Number(wallet.cashInHand) || 0,
          availableCashLimit: Number(wallet.availableCashLimit) || 0,
          totalCashLimit: Number(wallet.totalCashLimit) || 0,
          weeklyEarnings: Number(summary.totalEarnings) || 0,
          weeklyOrders: Number(summary.totalOrders) || 0,
          payoutAmount: Number(wallet.lastPayout?.amount || wallet.totalWithdrawn || 0),
          payoutPeriod: wallet.lastPayout ? new Date(wallet.lastPayout.date).toLocaleDateString() : 'No recent payout',
          bankDetailsFilled: isFilled,
          withdrawalLimit,
          tipsBalance: Number(wallet.tipsBalance) || 0,
          canWithdraw: pocketBalance >= withdrawalLimit
        });

        setActiveOffer({
           targetAmount: Number(activeOfferPayload?.targetAmount) || 0,
           targetOrders: Number(activeOfferPayload?.targetOrders) || 0,
           currentOrders: Number(activeOfferPayload?.currentOrders) || 0,
           currentEarnings: Number(activeOfferPayload?.currentEarnings) || 0,
           validTill: activeOfferPayload?.validTill || '',
           isLive: Boolean(activeOfferPayload)
        });

      } catch (err) {
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amt) || amt < 1) {
      toast.error(`Enter a valid amount (minimum ${INR_SYMBOL}1)`);
      return;
    }

    try {
      setDepositing(true);
      const orderRes = await deliveryAPI.createDepositOrder(amt);
      const data = orderRes?.data?.data;
      const rp = data?.razorpay;
      
      if (!rp?.orderId) {
        toast.error("Payment initialization failed");
        setDepositing(false);
        return;
      }

      const profileRes = await deliveryAPI.getProfile();
      const profile = profileRes?.data?.data?.profile || {};
      const companyName = await getCompanyNameAsync();

      await initRazorpayPayment({
        key: rp.key,
        amount: rp.amount,
        currency: rp.currency || "INR",
        order_id: rp.orderId,
        name: companyName,
        description: `Cash limit deposit - ${INR_SYMBOL}${amt}`,
        prefill: { 
           name: profile.name, 
           email: profile.email, 
           contact: profile.phone 
        },
        handler: async (res) => {
          try {
            const verifyRes = await deliveryAPI.verifyDepositPayment({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              amount: amt
            });
            if (verifyRes?.data?.success) {
              toast.success("Deposit successful");
              setShowDepositPopup(false);
              setDepositAmount("");
              window.location.reload();
            }
          } catch (err) {
            toast.error("Verification failed");
          } finally {
            setDepositing(false);
          }
        },
        onError: () => setDepositing(false),
        onClose: () => setDepositing(false)
      });
    } catch (err) {
      setDepositing(false);
      toast.error("Deposit failed to start");
    }
  };

  const getWeeklyPeriodRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const formatDate = (d) => {
      const dNum = d.getDate();
      const mStr = d.toLocaleString('en-US', { month: 'short' });
      return `${dNum} ${mStr}`;
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getPreviousWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const start = new Date(now.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const formatDate = (d) => {
      const dNum = d.getDate();
      const mStr = d.toLocaleString('en-US', { month: 'short' });
      return `${dNum} ${mStr}`;
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const emergencyOptions = [
    { title: "Medical Emergency", subtitle: "Call an ambulance", icon: <AlertTriangle className="text-red-600" />, phone: emergencyNumbers.medicalEmergency },
    { title: "Accident Helpline", subtitle: "Report an accident", icon: <AlertTriangle className="text-orange-600" />, phone: emergencyNumbers.accidentHelpline },
    { title: "Contact Police", subtitle: "Nearest police support", icon: <AlertTriangle className="text-blue-600" />, phone: emergencyNumbers.contactPolice },
    { title: "Insurance", subtitle: "Policy & claim help", icon: <AlertTriangle className="text-green-600" />, phone: emergencyNumbers.insurance },
  ];

  const ordersProgress = activeOffer.targetOrders > 0 ? Math.min(activeOffer.currentOrders / activeOffer.targetOrders, 1) : 0;
  const earningsProgress = activeOffer.targetAmount > 0 ? Math.min(activeOffer.currentEarnings / activeOffer.targetAmount, 1) : 0;
  const hasActiveOffer = activeOffer.isLive && (activeOffer.targetAmount > 0 || activeOffer.targetOrders > 0);

  const formatOfferValidTill = (validTill) => {
    if (!validTill) return '';
    const parsed = new Date(validTill);
    if (Number.isNaN(parsed.getTime())) return String(validTill);
    return parsed.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center font-poppins">
       <div className="w-10 h-10 border-4 border-[#ff8100] border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-xs font-semibold text-gray-500">Loading Pocket...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-poppins pb-32">
       
       {/* 1. CUSTOM LIGHT HEADER */}
       <div className="bg-white border-b border-gray-100 px-4 py-4 safe-top flex items-center justify-between">
          {/* Online/Offline Toggle */}
          <button 
            onClick={async () => {
              const nextState = !isOnline;
              toggleOnline();
              if (nextState) {
                 navigator.geolocation.getCurrentPosition((pos) => {
                     deliveryAPI.updateLocation(pos.coords.latitude, pos.coords.longitude, true).catch(() => {});
                 }, (err) => console.warn('Online sync position failed:', err), { enableHighAccuracy: true });
              } else {
                 deliveryAPI.updateOnlineStatus(false).catch(() => {});
              }
            }}
            className={`relative w-28 h-9 rounded-full transition-all duration-300 flex items-center justify-between px-2.5 shadow-sm ${
              isOnline ? 'bg-[#22C55E] shadow-[#22C55E]/30' : 'bg-gray-300'
            }`}
          >
            {isOnline && (
              <span className="text-[10px] font-black text-white uppercase tracking-wider z-10 select-none">Online</span>
            )}
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="w-6 h-6 bg-white rounded-full shadow-sm z-10" 
            />
            {!isOnline && (
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider z-10 select-none">Offline</span>
            )}
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-2.5">
             {/* Siren */}
             <button 
                onClick={() => setShowEmergencyPopup(true)}                 className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100 shadow-sm active:scale-90 transition-all"
             >
                <Siren className="w-4.5 h-4.5" />
             </button>
             {/* Notifications */}
             <button 
                onClick={() => navigate('/food/delivery/notifications')} 
                className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shadow-sm active:scale-90 transition-all"
             >
                <Bell className="w-4.5 h-4.5" />
                {notificationUnreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gray-900" />
                )}
             </button>
             {/* Help */}
             <button 
                onClick={() => toast.info('Support details will be displayed.')} 
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 shadow-sm active:scale-90 transition-all"
             >
                <HelpCircle className="w-4.5 h-4.5" />
             </button>
             {/* Profile Avatar */}
             <div 
                onClick={() => navigate('/food/delivery/profile')}
                className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
             >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
             </div>
          </div>
       </div>

       {/* BANK DETAILS BANNER */}
       {!walletState.bankDetailsFilled && (
         <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
               <FileText className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1">
               <h3 className="text-xs font-bold text-gray-900 mb-0.5">Submit bank details</h3>
               <p className="text-[10px] text-gray-700 font-medium">PAN & bank details required for payouts</p>
            </div>
            <button 
              onClick={() => navigate('/food/delivery/profile/details')}
              className="bg-black text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] shadow-sm"
            >
               Submit
            </button>
         </div>
       )}

       <div className="px-4 py-4 flex flex-col gap-4">
          
          {/* 2. WEEKLY EARNINGS CARD */}
          <div 
            onClick={() => navigate('/food/delivery/earnings')}
            className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-50 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
             <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5">
                <span>Earnings: {getWeeklyPeriodRange()}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
             </div>
             <h2 className="text-4xl font-extrabold text-black tracking-tight">{INR_SYMBOL}{walletState.weeklyEarnings.toFixed(2)}</h2>
          </div>

          {/* 3. ACTIVE OFFERS (If available) */}
          {hasActiveOffer && (
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-50">
             <div className="bg-gray-900 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white leading-none mb-1">Earnings Guarantee</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Valid till {formatOfferValidTill(activeOffer.validTill)}</span>
                     {activeOffer.isLive && (
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
                           <span className="text-[9px] font-bold text-gray-500 uppercase">Live</span>
                        </div>
                     )}
                  </div>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/5">
                   <p className="text-sm font-bold text-white leading-none mb-0.5">{INR_SYMBOL}{activeOffer.targetAmount}</p>
                   <p className="text-[9px] font-medium text-gray-400 uppercase">{activeOffer.targetOrders} orders</p>
                </div>
             </div>

             <div className="p-6 flex items-center justify-around gap-6">
                {/* Orders Progress */}
                <div className="flex flex-col items-center">
                   <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                         <motion.circle 
                            cx="50" cy="50" r="42" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: ordersProgress }} transition={{ duration: 1.2, ease: "easeOut" }}
                         />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-lg font-extrabold text-black leading-none">{activeOffer.currentOrders}</span>
                         <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">of {activeOffer.targetOrders}</span>
                      </div>
                   </div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-3">Orders</p>
                </div>

                {/* Earnings Progress */}
                <div className="flex flex-col items-center">
                   <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                         <motion.circle 
                            cx="50" cy="50" r="42" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: earningsProgress }} transition={{ duration: 1.2, ease: "easeOut" }}
                         />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-sm font-extrabold text-black leading-none truncate max-w-[64px] px-1">{INR_SYMBOL}{activeOffer.currentEarnings}</span>
                      </div>
                   </div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-3">Earned</p>
                </div>
             </div>
          </div>
          )}

          {/* POCKET SECTION SEPARATOR */}
          <div className="flex items-center justify-center my-0.5">
             <div className="flex-1 h-[1px] bg-gray-200"></div>
             <span className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] select-none">Pocket</span>
             <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          {/* 4. POCKET DETAILS CARD */}
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-50 flex flex-col gap-4.5">
             <div 
                onClick={() => navigate('/food/delivery/pocket/balance')}
                className="flex items-center justify-between cursor-pointer hover:opacity-85 active:scale-[0.99] transition-all"
             >
                <span className="text-sm font-bold text-gray-800">Pocket balance</span>
                <div className="flex items-center gap-1.5">
                   <span className="text-base font-extrabold text-black">{INR_SYMBOL}{walletState.totalBalance.toFixed(2)}</span>
                   <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
             </div>

             <div className="h-[1px] bg-gray-100" />

             <div 
                onClick={() => navigate('/food/delivery/pocket/cash-limit')}
                className="flex items-center justify-between cursor-pointer hover:opacity-85 active:scale-[0.99] transition-all"
             >
                <span className="text-sm font-bold text-gray-800">Available cash limit</span>
                <div className="flex items-center gap-1.5">
                   <span className="text-base font-extrabold text-black">{INR_SYMBOL}{walletState.availableCashLimit.toFixed(2)}</span>
                   <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-2">
                <button 
                  onClick={() => setShowDepositPopup(true)}
                  className="py-3 bg-white border border-black hover:bg-gray-50 text-black rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                >
                   Deposit
                </button>
                <button 
                  onClick={() => navigate('/food/delivery/pocket/balance')}
                  disabled={!walletState.canWithdraw}
                  className={`py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all ${
                    walletState.canWithdraw 
                    ? 'bg-black text-white hover:bg-gray-900' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                   Withdraw
                </button>
             </div>
          </div>

          {/* 5. CUSTOMER TIPS BALANCE */}
          <div 
            onClick={() => navigate('/food/delivery/pocket/details')} 
            className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
          >
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100">
                   <Banknote className="w-5 h-5 text-gray-800" />
                </div>
                <span className="text-sm font-bold text-gray-800">Customer tips balance</span>
             </div>
             <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-black">{INR_SYMBOL}{walletState.tipsBalance.toFixed(0)}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
             </div>
          </div>

          {/* MORE SERVICES SECTION SEPARATOR */}
          <div className="flex items-center justify-center my-0.5">
             <div className="flex-1 h-[1px] bg-gray-200"></div>
             <span className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] select-none">More Services</span>
             <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          {/* 6. MORE SERVICES GRID */}
          <div className="grid grid-cols-2 gap-4">
             {/* Payout */}
             <div 
               onClick={() => navigate('/food/delivery/pocket/payout')}
               className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50 active:bg-gray-50 cursor-pointer flex flex-col justify-between min-h-[140px] transition-all"
             >
                <div className="flex items-center gap-1.5 mb-2">
                   <span className="text-xl font-extrabold text-black">{INR_SYMBOL}{walletState.payoutAmount.toFixed(0)}</span>
                   {walletState.payoutAmount > 0 && (
                      <div className="w-4.5 h-4.5 rounded-full bg-black flex items-center justify-center text-white shrink-0 shadow-sm">
                         <CheckCircle2 className="w-2.5 h-2.5 stroke-[4]" />
                      </div>
                   )}
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-800">Payout</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                      {walletState.payoutPeriod !== 'No recent payout' ? getPreviousWeekRange() : 'No recent payout'}
                   </p>
                </div>
             </div>

             {/* Pocket Statement */}
             <div 
               onClick={() => navigate('/food/delivery/pocket/details')}
               className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50 active:bg-gray-50 cursor-pointer flex flex-col justify-between min-h-[140px] transition-all"
             >
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white mb-4 shadow-sm">
                   <FileText className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Pocket statement</p>
             </div>
          </div>

          {/* Secondary Services Grid */}
          <div className="grid grid-cols-2 gap-4">
             {/* Limit Settlement */}
             <div 
               onClick={() => navigate('/food/delivery/pocket/limit-settlement')}
               className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50 active:bg-gray-50 cursor-pointer flex flex-col justify-between min-h-[140px] transition-all"
             >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-800 mb-4 border border-gray-100 shadow-sm">
                   <Receipt className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Limit Settlement</p>
             </div>

             {/* Deduction List */}
             <div 
               onClick={() => navigate('/food/delivery/pocket/deductions')}
               className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-50 active:bg-gray-50 cursor-pointer flex flex-col justify-between min-h-[140px] transition-all"
             >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-800 mb-4 border border-gray-100 shadow-sm">
                   <FileText className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Deduction List</p>
             </div>
          </div>

       </div>

       {/* DEPOSIT MODAL */}
       <AnimatePresence>
          {showDepositPopup && (
             <div className="fixed inset-0 z-[1000] flex items-end">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDepositPopup(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full bg-white rounded-t-[2rem] p-6 pb-10 shadow-2xl z-10 border-t border-gray-50">
                   <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                   
                   <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-700">
                         <IndianRupee className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-950 mb-1">Deposit Cash</h3>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Settle Hand Dues</p>
                   </div>
                   
                   <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                         <span className="text-[13px] font-medium text-gray-500">Cash in Hand</span>
                         <span className="text-sm font-bold text-gray-900">{INR_SYMBOL}{walletState.cashInHand.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                         <span className="text-[13px] font-medium text-gray-500">Available Earnings</span>
                         <span className="text-sm font-bold text-gray-900">{INR_SYMBOL}{walletState.totalBalance.toFixed(2)}</span>
                      </div>
                      <div className="relative pt-2">
                         <span className="absolute left-4 top-1/2 translate-y-[-10%] text-gray-400 font-bold text-lg">₹</span>
                         <input 
                            type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 text-lg font-bold text-gray-900 focus:bg-white focus:border-black outline-none transition-all"
                         />
                      </div>
                      <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">{`Minimum amount ${INR_SYMBOL}1`}</p>
                   </div>
                   
                    <div className="space-y-2">
                       <button 
                          onClick={handleDeposit}
                          disabled={depositing}
                          className="w-full py-4 bg-black hover:bg-gray-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400"
                       >
                          {depositing ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <ShieldCheck className="w-4 h-4" />}
                          {depositing ? 'Processing...' : 'Deposit via Razorpay'}
                       </button>
                       
                       <button onClick={() => setShowDepositPopup(false)} className="w-full py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider hover:text-gray-900 transition-colors">Maybe Later</button>
                    </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>

       {/* EMERGENCY HELP POPUP */}
       <BottomPopup isOpen={showEmergencyPopup} title="Emergency Help" onClose={() => setShowEmergencyPopup(false)}>
          <div className="grid gap-4 py-2">
            {emergencyOptions.map((opt, i) => (
              <button 
                key={i} 
                onClick={(e) => {
                  if (e && e.stopPropagation) e.stopPropagation();
                  const num = opt.phone?.replace(/\D/g, '');
                  if (num) {
                    try {
                      const link = document.createElement('a');
                      link.href = `tel:${num}`;
                      link.setAttribute('target', '_self');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } catch (err) {
                      window.location.href = `tel:${num}`;
                    }
                  } else {
                    toast.error('Number not configured');
                  }
                }}
                className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all text-left"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-xl">{opt.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{opt.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{opt.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
       </BottomPopup>
    </div>
  );
};

export default PocketV2;
