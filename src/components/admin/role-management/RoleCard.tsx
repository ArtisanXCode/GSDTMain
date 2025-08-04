import { AdminRole } from "../../../services/admin";
import { ROLE_DESCRIPTIONS, SMART_CONTRACT_ROLES } from "../../../constants/roles";
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  FireIcon,
  PauseIcon,
  ChartBarIcon,
  UserMinusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface RoleCardProps {
  role: AdminRole;
}

export const getRoleIcon = (role: AdminRole) => {
  const iconClass = "h-5 w-5";

  switch (role) {
    case SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE:
      return <ShieldCheckIcon className={`${iconClass} text-orange-400`} />;
    case SMART_CONTRACT_ROLES.MINTER_ROLE:
      return <CurrencyDollarIcon className={`${iconClass} text-green-400`} />;
    case SMART_CONTRACT_ROLES.BURNER_ROLE:
      return <FireIcon className={`${iconClass} text-red-400`} />;
    case SMART_CONTRACT_ROLES.PAUSER_ROLE:
      return <PauseIcon className={`${iconClass} text-yellow-400`} />;
    case SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE:
      return <ChartBarIcon className={`${iconClass} text-blue-400`} />;
    case SMART_CONTRACT_ROLES.BLACKLIST_MANAGER_ROLE:
      return <UserMinusIcon className={`${iconClass} text-gray-400`} />;
    case SMART_CONTRACT_ROLES.APPROVER_ROLE:
      return <CheckCircleIcon className={`${iconClass} text-purple-400`} />;
    default:
      return <ShieldCheckIcon className={`${iconClass} text-gray-400`} />;
  }
};

export const getRoleBadgeClass = (role: AdminRole): string => {
  const description = ROLE_DESCRIPTIONS[role];
  return description ? description.color : 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function RoleCard({ role }: RoleCardProps) {
  const description = ROLE_DESCRIPTIONS[role];

  if (!description) return null;

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-600/50 rounded-lg border border-gray-500">
      <div className="flex-shrink-0 mt-0.5">
        {getRoleIcon(role)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {description.name}
        </p>
        <p className="text-xs text-white/70 mt-1">
          {description.description}
        </p>
      </div>
    </div>
  );
}