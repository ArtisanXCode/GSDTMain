
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => void;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
}

const RESTRICTED_COUNTRIES = ['US', 'USA', 'United States'];

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [geoRestricted, setGeoRestricted] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    if (isOpen) {
      checkGeolocation();
    }
  }, [isOpen]);

  const checkGeolocation = async () => {
    try {
      setGeoLoading(true);
      
      // Try multiple geolocation services
      const geoServices = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json', // fallback
      ];

      let geoData: GeolocationData | null = null;

      for (const service of geoServices) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          if (service.includes('ipapi.co')) {
            geoData = {
              country: data.country_name,
              countryCode: data.country_code,
              region: data.region,
              city: data.city
            };
            break;
          }
        } catch (err) {
          console.warn(`Geolocation service ${service} failed:`, err);
          continue;
        }
      }

      if (geoData) {
        const isRestricted = RESTRICTED_COUNTRIES.some(restricted => 
          geoData!.country.toLowerCase().includes(restricted.toLowerCase()) ||
          geoData!.countryCode.toLowerCase() === restricted.toLowerCase()
        );
        
        setGeoRestricted(isRestricted);
        
        if (isRestricted) {
          setError(`Access is restricted from ${geoData.country}. GSDC services are not available in your jurisdiction.`);
        }
      }
    } catch (error) {
      console.error('Geolocation check failed:', error);
      // Allow access if geolocation fails
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (geoRestricted) {
      return;
    }

    if (!isLogin && credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(credentials.email, credentials.password);
        setSuccess('Login successful!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Handle signup
        await signUp(credentials.email, credentials.password);
        setError('');
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          setIsLogin(true);
          setCredentials({ email: credentials.email, password: '', confirmPassword: '' });
          setSuccess('');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {geoLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking location...</p>
          </div>
        ) : geoRestricted ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Access Restricted</strong>
              <p className="block sm:inline">{error}</p>
            </div>
            <p className="text-gray-600">
              Please consult local regulations regarding digital asset access.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
