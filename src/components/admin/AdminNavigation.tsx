
import { useNavigate, useLocation } from "react-router-dom";

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className = "" }: AdminNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "KYC Requests", path: "/admin/kyc-requests" },
    { name: "Contact Messages", path: "/admin/contact-messages" },
    { name: "Role Management", path: "/admin/role-management" },
    { name: "Fiat Mint Requests", path: "/admin/fiat-requests" },
    { name: "Proof of Reserves", path: "/admin/reserves" },
    { name: "Exchange Rates", path: "/admin/exchange-rates" },
    { name: "Pending Role Approvals", path: "/admin/pending-roles" },
    { name: "Pending Transactions", path: "/admin/pending-transactions" },
    { name: "CMS Pages", path: "/admin/cms-pages" },
    { name: "Contact Details", path: "/admin/contact-details" }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className={`bg-gray-700 p-1 rounded-lg ${className}`}>
      <div className="flex flex-wrap gap-1">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              isActivePath(item.path)
                ? "bg-orange-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
