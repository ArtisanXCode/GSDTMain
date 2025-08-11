
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { KYCStatus as KYCStatusEnum, getUserKYCStatus } from '../../services/kyc';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function KYCStatus() {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<KYCStatusEnum>(KYCStatusEnum.NOT_SUBMITTED);
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState<any>(null);

  useEffect(() => {
    loadKYCStatus();
  }, [user]);

  const loadKYCStatus = async () => {
    if (!user?.id) return;

    try {
      const status = await getUserKYCStatus(user.id);
      setKycStatus(status);
      
      // You can add more detailed KYC data fetching here if needed
    } catch (error) {
      console.error('Error loading KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: KYCStatusEnum) => {
    switch (status) {
      case KYCStatusEnum.APPROVED:
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case KYCStatusEnum.REJECTED:
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case KYCStatusEnum.PENDING:
        return <ClockIcon className="h-8 w-8 text-yellow-500" />;
      case KYCStatusEnum.REQUIRES_REVIEW:
        return <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <ClockIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusColor = (status: KYCStatusEnum) => {
    switch (status) {
      case KYCStatusEnum.APPROVED:
        return 'bg-green-50 border-green-200';
      case KYCStatusEnum.REJECTED:
        return 'bg-red-50 border-red-200';
      case KYCStatusEnum.PENDING:
        return 'bg-yellow-50 border-yellow-200';
      case KYCStatusEnum.REQUIRES_REVIEW:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: KYCStatusEnum) => {
    switch (status) {
      case KYCStatusEnum.APPROVED:
        return 'Verified';
      case KYCStatusEnum.REJECTED:
        return 'Rejected';
      case KYCStatusEnum.PENDING:
        return 'Under Review';
      case KYCStatusEnum.REQUIRES_REVIEW:
        return 'Additional Information Required';
      default:
        return 'Not Submitted';
    }
  };

  const getStatusDescription = (status: KYCStatusEnum) => {
    switch (status) {
      case KYCStatusEnum.APPROVED:
        return 'Your identity has been successfully verified. You have full access to all platform features.';
      case KYCStatusEnum.REJECTED:
        return 'Your verification was rejected. Please contact support for more information or resubmit with correct documents.';
      case KYCStatusEnum.PENDING:
        return 'Your documents are being reviewed by our team. This process typically takes 1-3 business days.';
      case KYCStatusEnum.REQUIRES_REVIEW:
        return 'Additional information or documents are required to complete your verification.';
      default:
        return 'Complete your identity verification to access all platform features including token minting and advanced trading.';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">KYC Verification Status</h2>
        <p className="text-gray-600">View your identity verification status and requirements</p>
      </div>

      {/* Current Status */}
      <div className={`border rounded-lg p-6 ${getStatusColor(kycStatus)}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getStatusIcon(kycStatus)}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {getStatusText(kycStatus)}
            </h3>
            <p className="text-gray-600 mt-1">
              {getStatusDescription(kycStatus)}
            </p>
            
            {kycStatus === KYCStatusEnum.NOT_SUBMITTED && (
              <div className="mt-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Verification
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Process</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              kycStatus !== KYCStatusEnum.NOT_SUBMITTED ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {kycStatus !== KYCStatusEnum.NOT_SUBMITTED && (
                <CheckCircleIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Submit Documentation</p>
              <p className="text-sm text-gray-500">Provide government-issued ID and proof of address</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              kycStatus === KYCStatusEnum.APPROVED ? 'bg-green-500 border-green-500' : 
              kycStatus === KYCStatusEnum.PENDING || kycStatus === KYCStatusEnum.REQUIRES_REVIEW ? 'bg-yellow-500 border-yellow-500' :
              kycStatus === KYCStatusEnum.REJECTED ? 'bg-red-500 border-red-500' : 'border-gray-300'
            }`}>
              {kycStatus === KYCStatusEnum.APPROVED && (
                <CheckCircleIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Review Process</p>
              <p className="text-sm text-gray-500">Our team reviews your documents (1-3 business days)</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              kycStatus === KYCStatusEnum.APPROVED ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {kycStatus === KYCStatusEnum.APPROVED && (
                <CheckCircleIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Verification Complete</p>
              <p className="text-sm text-gray-500">Full access to all platform features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Identity Document</h4>
            <p className="text-sm text-gray-600 mt-1">
              Government-issued photo ID (passport, driver's license, or national ID)
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Proof of Address</h4>
            <p className="text-sm text-gray-600 mt-1">
              Utility bill, bank statement, or lease agreement (not older than 3 months)
            </p>
          </div>
        </div>
      </div>

      {/* Support Contact */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Need Help?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                If you have questions about the verification process or need assistance, 
                please <Link to="/contact" className="font-medium underline">contact our support team</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
