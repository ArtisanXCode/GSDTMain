
import { motion } from "framer-motion";

interface AdminHeroSectionProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeroSection({ 
  title = "Admin Dashboard", 
  subtitle = "Super Admin Dashboard - Full Access" 
}: AdminHeroSectionProps) {
  return (
    <>
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/admin_dashboard_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              {subtitle}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>
    </>
  );
}
