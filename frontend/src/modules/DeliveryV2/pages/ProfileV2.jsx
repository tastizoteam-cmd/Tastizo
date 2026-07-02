import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  User,
  ArrowRight,
  Bike,
  Ticket,
  ChevronRight,
  Share2,
  LogOut,
  X,
  Loader2,
  Briefcase
} from "lucide-react"
import { deliveryAPI } from "@food/api"
import { toast } from "sonner"
import { clearModuleAuth } from "@food/utils/auth"

/**
 * ProfileV2 - 1:1 EXACT Restoration of the Legacy Profile Hub.
 * Matches ProfilePage.jsx exactly.
 */
export const ProfileV2 = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [referralReward, setReferralReward] = useState(0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [logoutSubmitting, setLogoutSubmitting] = useState(false)

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await deliveryAPI.getProfile()
        if (response?.data?.success && response?.data?.data?.profile) {
          setProfile(response.data.data.profile)
        }
      } catch (error) {
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    deliveryAPI.getReferralStats().then((res) => {
      const reward = res?.data?.data?.stats?.rewardAmount
      setReferralReward(Number(reward) || 0)
    }).catch(() => {})
  }, [])

  const refId = profile?._id || profile?.id || profile?.referralCode || ""
  const referralLink = refId ? `${window.location.origin}/food/delivery/signup?ref=${encodeURIComponent(String(refId))}` : ""

  const handleShareReferral = async () => {
    if (!referralLink) return
    const rewardText = referralReward > 0 ? `₹${referralReward}` : "rewards"
    const shareText = `Join as a delivery partner and earn ${rewardText}.`
    try {
      if (navigator.share) {
        await navigator.share({ title: "Delivery referral", text: shareText, url: referralLink })
      } else {
        const fallbackUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`
        window.open(fallbackUrl, "_blank", "noopener,noreferrer")
      }
    } catch (e) {}
  }

  const handleLogout = async () => {
    if (logoutSubmitting) return
    setShowLogoutConfirm(false)
    try {
      setLogoutSubmitting(true)
      await deliveryAPI.logout()
    } catch (error) {}
    clearModuleAuth("delivery")
    localStorage.removeItem("app:isOnline")
    toast.success("Logged out successfully")
    navigate("/food/delivery/login", { replace: true })
    setLogoutSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-poppins">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
             </div>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-poppins pb-24">
      {/* Profile Header Block */}
      <div className="px-6 py-8 bg-white border-b border-gray-100">
        <div 
          onClick={() => navigate("/food/delivery/profile/details")}
          className="flex items-center gap-4 cursor-pointer"
        >
          <div className="relative shrink-0">
            {profile?.profileImage?.url ? (
              <img src={profile.profileImage.url} alt="Profile" className="w-[72px] h-[72px] rounded-full object-cover border border-gray-100 shadow-sm" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{profile?.name || "Delivery Partner"}</h2>
            <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">ID: {profile?.deliveryId || "N/A"}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Actions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Trips History */}
          <div 
            onClick={() => navigate("/food/delivery/history")}
            className="flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <Bike className="w-5 h-5 text-gray-800" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-gray-900">Trips History</h3>
              <p className="text-xs text-gray-500 mt-0.5">View past deliveries</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>

          {/* Share & Earn */}
          <div 
            onClick={handleShareReferral}
            className="flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <Share2 className="w-5 h-5 text-gray-800" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-gray-900">Share & Earn</h3>
              <p className="text-xs text-gray-500 mt-0.5">{referralReward > 0 ? `Earn ₹${referralReward} per referral` : 'Invite your friends'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>

          {/* Support Tickets */}
          <div 
            onClick={() => navigate("/food/delivery/help/tickets")}
            className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <Ticket className="w-5 h-5 text-gray-800" />
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-gray-900">Support Tickets</h3>
              <p className="text-xs text-gray-500 mt-0.5">Get help & support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>

        {/* Logout */}
        <div 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-4 p-4 mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <LogOut className="w-5 h-5 text-gray-800" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-gray-900">Log Out</h3>
            <p className="text-xs text-gray-500 mt-0.5">Exit your account</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>

      {/* Logout Confirm Popup */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center px-6"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white w-full max-w-[320px] rounded-3xl shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <LogOut className="w-6 h-6 text-gray-800" />
            </div>
            <h3 className="text-[19px] font-bold text-gray-900 mb-2">Log Out</h3>
            <p className="text-[13px] text-gray-500 mb-8 px-2">Are you sure you want to securely log out from your account?</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl bg-gray-50 text-gray-700 font-semibold text-[13px] active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutSubmitting}
                className="flex-1 py-3.5 rounded-2xl bg-black text-white font-semibold text-[13px] active:scale-95 transition-all disabled:opacity-70"
              >
                {logoutSubmitting ? "Wait..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileV2;
