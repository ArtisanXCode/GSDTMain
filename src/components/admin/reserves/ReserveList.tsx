import { motion } from "framer-motion";
import { ReserveAsset } from "../../../services/reserves";
import { format } from "date-fns";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import ErrorMessage from "./ErrorMessage";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";

interface ReserveListProps {
  reserves: ReserveAsset[] | undefined;
  loading: boolean;
  error: string | null;
  onEdit: (reserve: ReserveAsset) => void;
  onDelete: (reserve: ReserveAsset) => void;
  onRetry?: () => void;
}

export default function ReserveList({
  reserves,
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
}: ReserveListProps) {
  if (loading) {
    return <LoadingState message="Loading reserve assets..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!reserves || reserves.length === 0) {
    return (
      <EmptyState
        message="No reserve assets found"
        actionLabel="Add Reserve Asset"
        onAction={() => {}} // This would be handled by the parent component
      />
    );
  }

  return (
    <div className="overflow-x-auto" style={{ backgroundColor: "#2a4661" }}>
      <table className="min-w-full divide-y divide-white/20">
        <thead style={{ backgroundColor: "#446c93" }}>
          <tr>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              Symbol
            </th>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              Name
            </th>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              Amount
            </th>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              USD Value
            </th>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              Custodian
            </th>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              Last Updated
            </th>
            <th className="p-6 text-left text-xs font-large text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          className="divide-y divide-white/20"
          style={{ backgroundColor: "#2a4661" }}
        >
          {reserves.map((reserve) => (
            <motion.tr
              key={reserve.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-white/10"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {reserve.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                {reserve.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {parseFloat(reserve.amount).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                ${parseFloat(reserve.value_usd).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                {reserve.custodian}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                {format(new Date(reserve.last_updated), "MMM d, yyyy HH:mm")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEdit(reserve)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(reserve)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
