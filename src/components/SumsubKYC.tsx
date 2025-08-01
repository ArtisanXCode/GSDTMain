import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../hooks/useWallet";
import { KYCStatus, getUserKYCStatus, submitKYCRequest } from "../services/kyc";
import {
  getSumsubApplicantStatus,
  getSumsubAccessToken,
  createSumsubApplicant,
} from "../services/sumsub";

declare global {
  interface Window {
    snsWebSdk?: any;
  }
}

interface KYCStatusMessageProps {
  status: KYCStatus;
  onRetry?: () => void;
  onManualVerification?: () => void;
}

const KYCStatusMessage = ({
  status,
  onRetry,
  onManualVerification,
}: KYCStatusMessageProps) => {
  const messages = {
    [KYCStatus.APPROVED]: {
      title: "KYC Verified",
      message: "Your identity has been verified. You can now use all features.",
      type: "success",
    },
    [KYCStatus.REJECTED]: {
      title: "Verification Failed",
      message:
        "Your KYC verification was rejected. Please try again with correct information.",
      type: "error",
    },
    [KYCStatus.PENDING]: {
      title: "Under Review",
      message: "Your verification is being processed.",
      type: "warning",
    },
  };

  const info = messages[status];
  if (!info) return null;

  const bgColor = {
    success: "bg-green-50",
    error: "bg-red-50",
    warning: "bg-yellow-50",
  }[info.type];

  const textColor = {
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-yellow-700",
  }[info.type];

  return (
    <div className={`${textColor} ${bgColor} rounded-lg p-4`}>
      <p className="font-medium">{info.title}</p>
      <p className="text-sm mt-1">{info.message}</p>
      {status === KYCStatus.REJECTED && onRetry && onManualVerification && (
        <div className="mt-4 flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium"
          >
            Try Again with SumSub
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onManualVerification}
            className="px-4 py-2 bg-secondary-600 text-white rounded-md text-sm font-medium"
          >
            Try Manual Verification
          </motion.button>
        </div>
      )}
    </div>
  );
};

async function saveKYCDetails(
  address: string,
  appIdStatus: any,
  applicantId: string,
  kycStatus: string,
) {
  const date = new Date(appIdStatus.createDate);
  const dateOfBirth = date.toISOString().split("T")[0];

  await submitKYCRequest({
    first_name: "KYC",
    last_name: "Verification",
    date_of_birth: dateOfBirth,
    nationality: "",
    document_type: appIdStatus.levelName || "",
    document_url: "",
    verification_method: "sumsub",
    user_address: address,
    sumsub_applicant_id: applicantId,
    status: kycStatus,
  });
}

export default function SumsubKYC() {
  const { address, isConnected } = useWallet();
  const [kycStatus, setKycStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [applicantId, setApplicantId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleManualVerification = () => {
    const element = document.querySelector('[data-kyc-method="manual"]');
    if (element) element.click();
  };

  const initializeSumsubSDK = async () => {
    if (!accessToken || !containerRef.current || !address || !applicantId)
      return;

    try {
      if (!window.snsWebSdk) {
        const script = document.createElement("script");
        script.src =
          "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const snsWebSdkInstance = window.snsWebSdk
        .init(accessToken, () => accessToken)
        .withConf({
          lang: "en",
          email: "",
          phone: "",
        })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on("idCheck.onStepCompleted", async (payload: any) => {
          //console.log("onStepCompleted", payload);

          if (payload.idDocType === "SELFIE") {
            const appIdStatus = await getSumsubApplicantStatus(
              address,
              applicantId,
            );
            await saveKYCDetails(
              address,
              appIdStatus,
              applicantId,
              KYCStatus.PENDING,
            );
            setKycStatus(KYCStatus.PENDING);
          }
        })
        .on("idCheck.onError", (error: any) => {
          console.log("onError", error);
        })
        .build();

      snsWebSdkInstance.launch("#sumsub-kyc-container");
    } catch (err) {
      console.error("Error initializing SumSub SDK:", err);
      setError("Error initializing verification. Please try again later.");
    }
  };

  useEffect(() => {
    if (!isConnected || !address) return;

    const checkKYCStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const kycResponse = await getUserKYCStatus(address);
        setKycStatus(kycResponse?.status || KYCStatus.NOT_SUBMITTED);

        if (
          kycResponse?.status !== KYCStatus.APPROVED &&
          kycResponse?.status !== KYCStatus.REJECTED
        ) {
          var appId = await createSumsubApplicant(address);
          if (appId) {
            const appIdStatus = await getSumsubApplicantStatus(address, appId);
            setApplicantId(appId);
            const token = await getSumsubAccessToken(address, appId);
            setAccessToken(token);
          } else {
            setError("Failed to create Sumsub applicant");
          }
        }
      } catch (error: any) {
        console.error("Error checking KYC status:", error);
        setError("Error checking KYC status. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();
  }, [address, isConnected]);

  useEffect(() => {
    if (kycStatus === KYCStatus.NOT_SUBMITTED && accessToken) {
      initializeSumsubSDK();
    }
  }, [accessToken, kycStatus]);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">
            Connect your wallet to start KYC verification
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-8 shadow-lg"
      style={{
        backgroundColor: "#6d97bf",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white-900">
          KYC Verification
        </h3>
      </div>

      <KYCStatusMessage
        status={kycStatus}
        onRetry={() => {
          if (address && applicantId) {
            getSumsubAccessToken(address, applicantId)
              .then((token) => setAccessToken(token))
              .catch(() =>
                setError(
                  "Error restarting verification. Please try again later.",
                ),
              );
          }
        }}
        onManualVerification={handleManualVerification}
      />

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="ml-3 text-white-600">Checking verification status...</p>
        </div>
      )}

      {error && (
        <div className="text-red-700 bg-red-50 rounded-lg p-4 mt-4">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <div className="mt-4 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setError(null);
                if (address) {
                  getUserKYCStatus(address).then((response) => {
                    setKycStatus(response?.status || KYCStatus.NOT_SUBMITTED);
                  });
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualVerification}
              className="px-4 py-2 bg-secondary-600 text-white rounded-md text-sm font-medium"
            >
              Try Manual Verification
            </motion.button>
          </div>
        </div>
      )}

      {kycStatus === KYCStatus.NOT_SUBMITTED && !isLoading && !error && (
        <div>
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white-900">
              Automated Verification
            </h4>
            <p className="text-sm text-white-600 mt-2">
              Complete your identity verification quickly and securely using our
              automated system. You'll need to provide a valid ID document and
              take a selfie.
            </p>
            <div
              id="sumsub-kyc-container"
              ref={containerRef}
              className="mt-6 border border-gray-200 rounded-lg min-h-[400px] flex items-center justify-center"
            >
              {!accessToken && !isLoading && (
                <p className="text-gray-500">
                  Preparing verification system...
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-white-900">
              Manual Verification
            </h4>
            <p className="text-sm text-white-600 mt-2">
              If you prefer, you can also complete verification by manually
              submitting your documents.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualVerification}
              className="mt-4 px-4 py-2 text-white rounded-md"
              style={{
                background: "linear-gradient(to bottom, #f6b62e, #e74134)",
              }}
            >
              Manual Verification
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
