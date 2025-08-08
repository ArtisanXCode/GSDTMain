
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CMSPage, getPageBySlug } from '../services/cms';

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if this is a legal page route
        const isLegalPage = window.location.pathname.startsWith('/legal/');
        const pageSlug = isLegalPage ? `legal-${slug}` : slug;
        
        const data = await getPageBySlug(pageSlug);
        if (!data) {
          navigate('/404', { replace: true });
          return;
        }
        
        setPage(data);
      } catch (err: any) {
        console.error('Error loading page:', err);
        setError(err.message || 'Error loading page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-600">{error || 'Page not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative py-24 sm:py-32"
        style={{
          backgroundImage: `linear-gradient(135deg, #0a1217c7 0%, #132536d4 100%), url(/headers/dashboard_header.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-blue-900/80"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            >
              {page.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg leading-8 text-gray-300"
            >
              {window.location.pathname.startsWith('/legal/') ? 
                'Legal information and compliance documentation' : 
                'Important information and resources'
              }
            </motion.p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-8 sm:p-10">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
