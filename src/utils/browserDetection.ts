
export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
}

export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  let isSupported = true;

  // Chrome
  if (userAgent.indexOf('Chrome') > -1) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 61;
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 60;
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 11;
  }
  // Edge
  else if (userAgent.indexOf('Edge') > -1) {
    name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 18;
  }
  // IE
  else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
    name = 'Internet Explorer';
    isSupported = false; // We don't support IE
  }

  return { name, version, isSupported };
};

export const checkFeatureSupport = () => {
  const features = {
    fetch: typeof fetch !== 'undefined',
    promise: typeof Promise !== 'undefined',
    crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    webAssembly: typeof WebAssembly !== 'undefined',
    bigInt: typeof BigInt !== 'undefined',
  };

  return features;
};
