import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import {
  CMSPage,
  createPage,
  updatePage,
  deletePage,
  getPages
} from '../../services/cms';
import AdminNavigation from '../../components/admin/AdminNavigation';
import PageList from '../../components/admin/cms/PageList';
import PageForm from '../../components/admin/cms/PageForm';
import Menu from '../../components/admin/cms/Menu';

export default function CMSPages() {
  const { isConnected } = useWallet();
  const { isSuperAdmin, isAdmin } = useAdmin();
  const navigate = useNavigate();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (err: any) {
      console.error('Error loading pages:', err);
      setError(err.message || 'Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<CMSPage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      await createPage(data);
      await loadPages();
      setSuccess('Page created successfully');
      setView('list');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating page:', err);
      setError(err.message || 'Error creating page');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<CMSPage>) => {
    try {
      setLoading(true);
      setError(null);
      await updatePage(id, data);
      await loadPages();
      setSuccess('Page updated successfully');
      setView('list');
      setSelectedPage(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating page:', err);
      setError(err.message || 'Error updating page');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page: CMSPage) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      setLoading(true);
      setError(null);
      await deletePage(page.id);
      await loadPages();
      setSuccess('Page deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting page:', err);
      setError(err.message || 'Error deleting page');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (page: CMSPage, status: 'active' | 'inactive') => {
    try {
      setLoading(true);
      setError(null);
      await updatePage(page.id, { status });
      await loadPages();
      setSuccess('Page status updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating page status:', err);
      setError(err.message || 'Error updating page status');
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Block non-admins
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="bg-white min-h-screen">
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/admin_dashboard_header.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
          >
            <div className="text-left">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-lg leading-8 text-white/90 font-regular">
                Super Admin Dashboard – Full Access
              </p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 flex justify-end">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <AdminNavigation className="mb-8" />
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">Only Admins can manage CMS pages.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/admin_dashboard_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-lg leading-8 text-white/90 font-regular">
              Super Admin Dashboard – Full Access
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <AdminNavigation className="mb-8" />

          <div className="space-y-6">
            <Menu 
              view={view}
              onViewChange={(newView) => {
                setView(newView);
                if (newView === 'list') {
                  setSelectedPage(null);
                }
              }}
              onRefresh={loadPages}
            />

            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-2">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                {view === 'form' ? (
                  <div>
                    <p className="mb-2 text-xs text-gray-500">[Debug] Form View Active</p>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">
                      {selectedPage ? 'Edit Page' : 'Create New Page'}
                    </h3>
                    <PageForm
                      initialData={selectedPage || undefined}
                      onSubmit={selectedPage ? 
                        (data) => handleUpdate(selectedPage.id, data) : 
                        handleCreate
                      }
                      onCancel={() => {
                        setView('list');
                        setSelectedPage(null);
                      }}
                      loading={loading}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="sm:flex sm:items-center">
                      <div className="sm:flex-auto">
                        <h3 className="text-lg font-medium text-gray-900">CMS Pages</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your website's content pages including legal documents
                        </p>
                        <div className="mt-2 flex space-x-4 text-xs text-gray-400">
                          <span>Legal pages: {pages.filter(p => p.slug.startsWith('legal-')).length}</span>
                          <span>General pages: {pages.filter(p => !p.slug.startsWith('legal-')).length}</span>
                          <span>Total: {pages.length}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                          onClick={() => setView('form')}
                          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                        >
                          Create Page
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <PageList
                        pages={pages}
                        onEdit={(page) => {
                          setSelectedPage(page);
                          setView('form');
                        }}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}