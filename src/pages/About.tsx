import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 20, 35, 0.95) 0%, rgba(20, 30, 48, 0.85) 30%, rgba(139, 69, 19, 0.7) 60%, rgba(255, 140, 0, 0.4) 85%, rgba(255, 165, 0, 0.3) 100%), url('/attached_assets/AdobeStock_1180220151_1752737711909.jpeg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/20 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900/60"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              About GSDC
            </h1>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div
          className=""
          style={{ position: "absolute", right: "10%", top: "-60px" }}
        >
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="w-32 h-32 sm:w-50 sm:h-50"
          />
        </div>
      </div>

      {/* Main content section */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4"
              style={{ color: "#ed9030" }}
            >
              THE FUTURE OF <br/> GLOBAL SOUTH DIGITAL CURRENCY
            </p>
            <p className="text-lg leading-6 text-black max-w-2xl mx-auto font-regular">
              GSDC is a revolutionary stablecoin that represents a basket of
              GSDC currencies,
              <br />
              providing a stable and efficient means of cross-border
              transactions while promoting economic
              <br />
              cooperation among GSDC nations.
            </p>
          </div>

          {/* Two column layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* Our Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl p-16 text-white shadow-lg"
              style={{
                background: "linear-gradient(100deg, #e74134 0%, #f6b62e 100%)",
              }}
            >
              <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
              <p className="text-white/90 leading-relaxed">
                We aim to facilitate seamless international trade and investment
                among GSDC nations by providing a digital currency that reflects
                the collective economic strength of these emerging markets.
              </p>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className=" rounded-2xl p-10 "
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                What's included
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#ed9030" }}
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-black text-lg">
                    Stable Value Backed by GSDC
                  </span>
                </li>
                <li className="flex items-center gap-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#ed9030" }}
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-black text-lg">
                    Real-time Exchange Rates
                  </span>
                </li>
                <li className="flex items-center gap-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#ed9030" }}
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-black text-lg">
                    Stable Value Backed by GSDC
                  </span>
                </li>
                <li className="flex items-center gap-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#ed9030" }}
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-black text-lg">
                    Real-time Exchange Rates
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
