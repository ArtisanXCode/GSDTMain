
import { motion } from "framer-motion";
import { AdminRole } from "../../../services/admin";
import {
  ShieldCheckIcon,
  BanknotesIcon,
  KeyIcon,
  PauseCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface RoleCardProps {
  role: AdminRole;
}

export const getRoleIcon = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return <ShieldCheckIcon className="h-4 w-4" />;
    case AdminRole.ADMIN:
      return <ShieldCheckIcon className="h-4 w-4" />;
    case AdminRole.MODERATOR:
      return <EyeIcon className="h-4 w-4" />;
    case AdminRole.MINTER:
      return <BanknotesIcon className="h-4 w-4" />;
    case AdminRole.BURNER:
      return <KeyIcon className="h-4 w-4" />;
    case AdminRole.PAUSER:
      return <PauseCircleIcon className="h-4 w-4" />;
    case AdminRole.PRICE_UPDATER:
      return <CurrencyDollarIcon className="h-4 w-4" />;
    default:
      return <UserIcon className="h-4 w-4" />;
  }
};

export const getRoleBadgeClass = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return "border-2 border-orange-400 text-orange-400 bg-transparent";
    case AdminRole.ADMIN:
      return "border-2 border-blue-400 text-blue-400 bg-transparent";
    case AdminRole.MODERATOR:
      return "border-2 border-gray-400 text-gray-400 bg-transparent";
    case AdminRole.MINTER:
      return "border-2 border-green-400 text-green-400 bg-transparent";
    case AdminRole.BURNER:
      return "border-2 border-red-400 text-red-400 bg-transparent";
    case AdminRole.PAUSER:
      return "border-2 border-yellow-400 text-yellow-400 bg-transparent";
    case AdminRole.PRICE_UPDATER:
      return "border-2 border-blue-500 text-blue-500 bg-transparent";
    default:
      return "border-2 border-gray-400 text-gray-400 bg-transparent";
  }
};

export const getRoleDescription = (role: AdminRole) => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return "Full admin access to all functions";
    case AdminRole.ADMIN:
      return "Admin access to most functions";
    case AdminRole.MODERATOR:
      return "Moderate content and users";
    case AdminRole.MINTER:
      return "Can mint new tokens";
    case AdminRole.BURNER:
      return "Can burn tokens and process redemptions";
    case AdminRole.PAUSER:
      return "Can pause/unpause contract operations";
    case AdminRole.PRICE_UPDATER:
      return "Can update token price";
    default:
      return "";
  }
};

export default function RoleCard({ role }: RoleCardProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {getRoleIcon(role)}
        <span
          className={`inline-flex items-center text-sm font-medium rounded-full px-4 py-2 ${getRoleBadgeClass(role)}`}
        >
          {role}
        </span>
      </div>
      <p className="text-white/70 text-xs ml-6">
        {getRoleDescription(role)}
      </p>
    </div>
  );
}
