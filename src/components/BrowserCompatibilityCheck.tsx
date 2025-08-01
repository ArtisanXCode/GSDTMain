
import React, { useEffect, useState } from 'react';
import { detectBrowser, checkFeatureSupport } from '../utils/browserDetection';

const BrowserCompatibilityCheck: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<any>(null);

  useEffect(() => {
    const browser = detectBrowser();
    const features = checkFeatureSupport();
    setBrowserInfo({ browser, features });

    // Show warning if browser is not supported or missing critical features
    if (!browser.isSupported || !features.fetch || !features.promise) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>
          Your browser ({browserInfo?.browser.name} {browserInfo?.browser.version}) may not be fully supported. 
          Please update to the latest version for the best experience.
        </span>
        <button 
          onClick={() => setShowWarning(false)}
          className="ml-4 text-white hover:text-yellow-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BrowserCompatibilityCheck;
