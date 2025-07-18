
import { motion } from "framer-motion";
import { AdminRole, AdminUser } from "../../../services/admin";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getRoleIcon, getRoleBadgeClass } from "./RoleCard";

interface RoleTableProps {
  adminUsers: AdminUser[];
  currentUserAddress?: string;
  onEdit: (user: AdminUser) => void;
  onRemove: (user: AdminUser) => void;
}

export default function RoleTable({
  adminUsers,
  currentUserAddress,
  onEdit,
  onRemove,
}: RoleTableProps) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-4 gap-6 px-6 py-4 text-xs text-white/70 uppercase tracking-wider font-medium" style={{ backgroundColor: "#5a7a96" }}>
        <div>Address</div>
        <div>Role</div>
        <div>Created At</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Rows */}
      <div className="space-y-0">
        {adminUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid grid-cols-4 gap-6 px-6 py-4 items-center text-white hover:bg-gray-700/30 transition-colors ${
              index < adminUsers.length - 1 ? 'border-b border-gray-600/30' : ''
            }`}
            style={{ backgroundColor: "#446c93" }}
          >
            {/* Address */}
            <div className="flex items-center">
              <span className="text-sm text-white">
                {user.user_address.slice(0, 6)}...{user.user_address.slice(-4)}
              </span>
              {user.user_address.toLowerCase() === currentUserAddress?.toLowerCase() && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  You
                </span>
              )}
            </div>

            {/* Role */}
            <div className="flex items-center">
              {getRoleIcon(user.role)}
              <span
                className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}
              >
                {user.role}
              </span>
            </div>

            {/* Created At */}
            <div className="text-sm text-white/80">
              {new Date(user.created_at).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-3">
              {user.user_address.toLowerCase() !== currentUserAddress?.toLowerCase() && (
                <>
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                    title="Edit Role"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onRemove(user)}
                    className="text-red-400 hover:text-red-300 flex items-center transition-colors"
                    title="Remove Role"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
