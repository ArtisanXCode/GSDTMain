import { motion } from "framer-motion";
import { SmartContractRole, SMART_CONTRACT_ROLES, getRoleDisplayName, getRoleDescription, getRoleColor } from "../../../constants/roles";
import {
  UserIcon,
  ShieldCheckIcon,
  CogIcon,
  PlusIcon,
  FireIcon,
  PauseIcon,
  CurrencyDollarIcon,
  NoSymbolIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface RoleCardProps {
  role: SmartContractRole;
}

export const getRoleIcon = (role: SmartContractRole) => {
  switch (role) {
    case SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE:
      return <ShieldCheckIcon className="h-5 w-5 text-orange-400" />;
    case SMART_CONTRACT_ROLES.MINTER_ROLE:
      return <PlusIcon className="h-5 w-5 text-green-400" />;
    case SMART_CONTRACT_ROLES.BURNER_ROLE:
      return <FireIcon className="h-5 w-5 text-red-400" />;
    case SMART_CONTRACT_ROLES.PAUSER_ROLE:
      return <PauseIcon className="h-5 w-5 text-yellow-400" />;
    case SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE:
      return <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />;
    case SMART_CONTRACT_ROLES.BLACKLIST_MANAGER_ROLE:
      return <NoSymbolIcon className="h-5 w-5 text-gray-400" />;
    case SMART_CONTRACT_ROLES.APPROVER_ROLE:
      return <CheckIcon className="h-5 w-5 text-purple-400" />;
    default:
      return <UserIcon className="h-5 w-5 text-gray-400" />;
  }
};

export const getRoleBadgeClass = (role: SmartContractRole) => {
  const color = getRoleColor(role);
  return `bg-${color}-500/20 text-${color}-300 border border-${color}-400`;
};

// Remove this function as it's now imported from constants

export default function RoleCard({ role }: RoleCardProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {getRoleIcon(role)}
        <span
          className={`inline-flex items-center text-sm font-medium rounded-full px-4 py-2 ${getRoleBadgeClass(role)}`}
        >
          {getRoleDisplayName(role)}
        </span>
      </div>
      <p className="text-white/70 text-xs ml-6">
        {getRoleDescription(role)}
      </p>
    </div>
  );
}