import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../hooks/useWallet";
import { KYCStatus, submitKYCRequest, getUserKYCStatus } from "../services/kyc";
import { supabase } from "../lib/supabase";

const documentTypes = [
  { id: "passport", name: "Passport" },
  { id: "national_id", name: "National ID" },
  { id: "drivers_license", name: "Driver's License" },
];

export default function KYCVerification() {
  const { address, isConnected } = useWallet();
  const [kycStatus, setKYCStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    nationality: "",
    document_type: "passport",
    document_file: null as File | null,
  });

  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (!address) return;
      try {
        const response = await getUserKYCStatus(address);
        if (response) {
          setKYCStatus(response.status);
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };

    if (address) {
      fetchKYCStatus();
    }
  }, [address]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      // Check file type
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        setError("Only JPEG, PNG, and PDF files are allowed");
        return;
      }
      setFormData({ ...formData, document_file: file });
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !formData.document_file) return;

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create a unique file name
      const fileExt = formData.document_file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${address}/${fileName}`;

      // Upload document to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, formData.document_file, {
          cacheControl: "3600",
          upsert: false,
          contentType: formData.document_file.type,
        });

      if (uploadError) throw uploadError;

      // Complete progress
      setUploadProgress(100);

      // Get the public URL of the uploaded document
      const { data: urlData } = await supabase.storage
        .from("kyc-documents")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiry

      if (!urlData?.signedUrl) {
        throw new Error("Failed to generate document URL");
      }

      // Submit KYC request to database
      await submitKYCRequest({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality,
        document_type: formData.document_type,
        document_url: urlData.signedUrl,
        user_address: address,
      });

      setKYCStatus(KYCStatus.PENDING);

      // Show success message with instant feedback
      setTimeout(() => {
        alert("✅ Documents uploaded successfully! Your KYC verification will be processed within 24 hours. You'll receive an email confirmation once approved.");
      }, 500);

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        nationality: "",
        document_type: "passport",
        document_file: null,
      });

      // Reset file input
      const fileInput = document.getElementById(
        "document_file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Error submitting KYC:", err);
      setError(err.message || "Error submitting KYC verification");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

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

      {kycStatus === KYCStatus.APPROVED && (
        <div className="text-green-700 bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">KYC Verified ✅</p>
              <p className="text-sm mt-1">
                Your identity has been verified. You can now access all features including token minting.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => window.location.href = '/token-minting'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Start Token Minting
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {kycStatus === KYCStatus.REJECTED && (
        <div className="text-red-700 bg-red-50 rounded-lg p-4">
          <p className="font-medium">Verification Failed</p>
          <p className="text-sm mt-1">
            Your KYC verification was rejected. Please submit again with correct
            information.
          </p>
        </div>
      )}

      {kycStatus === KYCStatus.PENDING && (
        <div className="text-yellow-700 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
            <p className="font-medium">Under Review</p>
          </div>
          <p className="text-sm mt-2">Your verification is being processed.</p>
          <div className="mt-3 p-3 bg-yellow-100 rounded-md">
            <p className="text-xs font-medium text-yellow-800">⏱️ Estimated Processing Time: 24 hours</p>
            <p className="text-xs text-yellow-700 mt-1">You'll receive an email confirmation once your verification is complete.</p>
          </div>
        </div>
      )}

      {(kycStatus === KYCStatus.NOT_SUBMITTED ||
        kycStatus === KYCStatus.REJECTED) && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-white-700 mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-white-700 mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium text-white-700 mb-2"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nationality"
                className="block text-sm font-medium text-white-700 mb-2"
              >
                Nationality
              </label>
              <input
                type="text"
                id="nationality"
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="document_type"
                className="block text-sm font-medium text-white-700 mb-2"
              >
                Document Type
              </label>
              <select
                id="document_type"
                value={formData.document_type}
                onChange={(e) =>
                  setFormData({ ...formData, document_type: e.target.value })
                }
                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-colors duration-200"
              >
                {documentTypes.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="document_file"
                className="block text-sm font-medium text-white-700 mb-2"
              >
                Upload Document
              </label>
              <input
                type="file"
                id="document_file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                required
              />
              <p className="mt-1 text-xs text-white-500">
                Accepted formats: JPEG, PNG, PDF. Max size: 5MB
              </p>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-white-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}                
              ></div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !formData.document_file}
            className="w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{
              background: "linear-gradient(to bottom, #f6b62e, #e74134)",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Verification"
            )}
          </motion.button>
        </motion.form>
      )}
    </div>
  );
}