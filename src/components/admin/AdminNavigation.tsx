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
    //{ name: "Pending Transactions", path: "/admin/pending-transactions" },
    { name: "CMS Pages", path: "/admin/cms-pages" },
    //{ name: "Contact Details", path: "/admin/contact-details" }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className={`${className}`}>
      <div
        className="shadow rounded-lg p-6"
        style={{ backgroundColor: "#2a4661" }}
      >
        <div className="flex flex-wrap gap-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`px-2 py-2 rounded-lg font-medium transition-colors ${
                isActivePath(item.path)
                  ? "text-white"
                  : "text-white hover:bg-white/10"
              }`}
              style={
                isActivePath(item.path)
                  ? { backgroundColor: "#ed9030" }
                  : {}
              }
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}