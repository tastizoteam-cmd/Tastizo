import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightCircle, Leaf, Flame, Sparkles } from 'lucide-react';
import quickSpicyLogo from "@food/assets/quicky-spicy-logo.webp";

// Images for different modes - Extended pool for rotation
const images = {
  nonVeg: [
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop", // Taco
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=500&fit=crop", // Platter
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop", // Burger
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=500&fit=crop", // Grilled Chicken
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=500&fit=crop", // Kebabs
  ],
  veg: [
    "https://images.unsplash.com/photo-1585238341267-1cfec2046a55?w=500&h=500&fit=crop", // Veg Taco
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop", // Salad/Platter
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=500&fit=crop", // Paneer/Veg
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop", // Healthy Bowl
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop", // Veg Pizza
  ]
};

export default function FestBanner({ isVegMode, videoUrl = "", hideFoodImages = false }) {
  const [imgIndex, setImgIndex] = useState(0);
  const currentPool = isVegMode ? images.veg : images.nonVeg;
  const hasVideo = typeof videoUrl === "string" && videoUrl.trim().length > 0;
  
  // Dynamic rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex(prev => (prev + 1) % currentPool.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentPool.length]);

  // Reset index when mode changes
  useEffect(() => {
    setImgIndex(0);
  }, [isVegMode]);

  // Get 3 images starting from current index
  const displayImages = [
    currentPool[(imgIndex) % currentPool.length],
    currentPool[(imgIndex + 1) % currentPool.length],
    currentPool[(imgIndex + 2) % currentPool.length]
  ];

  return (
      <motion.div 
      initial={false}
      className={`relative px-4 pt-2 pb-4 overflow-hidden min-h-[140px] sm:min-h-[180px] transition-all duration-700 ${hasVideo ? 'bg-transparent' : 'bg-transparent'} rounded-b-[2rem]`}
    >
      {hasVideo && (
        <div className="absolute inset-0 z-0">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Mission Text at Top */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm font-bold"
        >
          <Sparkles className="h-2.5 w-2.5 text-[#fff200] animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Tastizo Missions</span>
          <Sparkles className="h-2.5 w-2.5 text-[#fff200] animate-pulse" />
        </motion.div>

        <motion.div
          key={isVegMode ? 'veg-title' : 'nonveg-title'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
        >
          <h2 
            className="text-2xl sm:text-3xl font-black text-[#fff200] italic tracking-tighter drop-shadow-md uppercase leading-none"
            style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.3)' }}
          >
            {isVegMode ? 'VEGGIE DELIGHT' : 'FEAST BONANZA'}
          </h2>
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 px-4 py-1.5 bg-black/40 backdrop-blur-lg rounded-full border border-white/20 shadow-xl group cursor-pointer active:scale-95 transition-all text-white"
        >
          {isVegMode ? <Leaf className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" /> : <Flame className="h-3.5 w-3.5 text-[#fff200] fill-[#fff200] animate-bounce" />}
          <span className="text-sm font-black uppercase tracking-[0.1em]">
            {isVegMode ? 'PURE VEG MAGIC' : 'UPTO 60% OFF NOW'}
          </span>
          <ArrowRightCircle className="h-5 w-5 text-[#fff200] shadow-sm" />
        </motion.div>

        <div className="h-28 sm:h-36" />
      </div>
    </motion.div>
  );
}

