
import AdminHeroSection from "./AdminHeroSection";
import AdminNavigation from "./AdminNavigation";

interface AccessDeniedProps {
  message?: string;
  description?: string;
}

export default function AccessDenied({ 
  message = "Access Denied", 
  description = "You don't have permission to access this page." 
}: AccessDeniedProps) {
  return (
    <div className="bg-white">
      <AdminHeroSection />

      {/* Main content section */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Navigation Menu */}
          <AdminNavigation className="mb-8" />

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {message}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
