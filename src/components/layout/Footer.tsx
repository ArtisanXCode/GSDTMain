
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="text-white relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(43, 105, 176, 0.95) 0%, rgba(44, 82, 130, 0.95) 100%), url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
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
                className="text-sm leading-6 text-gray-300 font-semibold hover:text-white transition-colors duration-200"
              >
                ABOUT
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/terms"
                className="text-sm leading-6 text-gray-300 font-semibold hover:text-white transition-colors duration-200"
              >
                TERMS
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/privacy"
                className="text-sm leading-6 text-gray-300 font-semibold hover:text-white transition-colors duration-200"
              >
                PRIVACY
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/contact"
                className="text-sm leading-6 text-gray-300 font-semibold hover:text-white transition-colors duration-200"
              >
                CONTACT
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-10 text-center text-xs leading-5 font-semibold text-gray-300">
          &copy; {new Date().getFullYear()} The Global South SAS. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
