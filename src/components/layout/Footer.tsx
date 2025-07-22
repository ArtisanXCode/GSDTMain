import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="text-white relative"
      style={{
        backgroundImage: `linear-gradient(135deg, #0a1217c7 0%, #132536d4 100%), url(/public/footer_bg.jpeg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* The Global South Logo/Icon Background */}
      <div className="absolute inset-0 flex items-center justify-end opacity-20">
        <img
          src="/logo_gsdc_icon.png"
          alt="The Global South"
          className="h-64 w-auto"
        />
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8 relative z-10">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-10">
            <img
              src="/logo_gsdc_white.png"
              alt="The Global South"
              className="h-16 w-auto"
            />
          </Link>
          <nav
            className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
            aria-label="Footer"
          >
            <div className="pb-6">
              <Link
                to="/about"
                className="text-sm leading-6 text-white font-semibold hover:text-white/80 transition-colors duration-200 uppercase"
              >
                ABOUT
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/terms"
                className="text-sm leading-6 text-white font-semibold hover:text-white/80 transition-colors duration-200 uppercase"
              >
                TERMS
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/privacy"
                className="text-sm leading-6 text-white font-semibold hover:text-white/80 transition-colors duration-200 uppercase"
              >
                PRIVACY
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/contact"
                className="text-sm leading-6 text-white font-semibold hover:text-white/80 transition-colors duration-200 uppercase"
              >
                CONTACT
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-10 text-center text-xs leading-5 font-semibold text-white">
          Copyright {new Date().getFullYear()} The Global South SAS. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
