import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="text-white relative"
      style={{
        backgroundImage: `linear-gradient(10deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.8) 0%), url('/footer_bg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-12 lg:px-8">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-10">
            <img
              src="/logo_gsdc_white.png"
              alt="GSDT Logo"
              className="h-16 w-auto"
              /*style={{ filter: 'brightness(0) invert(1)' }} // Make logo white*/
            />
          </Link>
          <nav
            className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
            aria-label="Footer"
          >
            <div className="pb-6">
              <Link
                to="/about"
                className="text-sm leading-6 text-gray-300 font-bold hover:text-white"
              >
                ABOUT
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/terms"
                className="text-sm leading-6 text-gray-300 font-bold hover:text-white"
              >
                TERMS
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/privacy"
                className="text-sm leading-6 text-gray-300 font-bold hover:text-white"
              >
                PRIVACY
              </Link>
            </div>
            <div className="pb-6">
              <Link
                to="/contact"
                className="text-sm leading-6 text-gray-300 font-bold hover:text-white"
              >
                CONTACT
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-10 text-center text-xs leading-5 font-bold text-gray-300">
          &copy; {new Date().getFullYear()} The Global South SAS. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
