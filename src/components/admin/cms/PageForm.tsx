
import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { generateSlug, generateLegalSlug } from '../../../services/cms';

interface PageFormProps {
  initialData?: {
    title: string;
    slug: string;
    content: string;
    status: 'active' | 'inactive';
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function PageForm({ initialData, onSubmit, onCancel, loading }: PageFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    status: initialData?.status || 'active',
    category: initialData?.slug?.startsWith('legal-') ? 'legal' : 'general'
  });

  useEffect(() => {
    if (!initialData?.slug && formData.title) {
      const baseSlug = generateSlug(formData.title);
      const finalSlug = formData.category === 'legal' ? `legal-${baseSlug}` : baseSlug;
      setFormData(prev => ({
        ...prev,
        slug: finalSlug
      }));
    }
  }, [formData.title, formData.category, initialData?.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 bg-white placeholder-gray-500";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";
  const radioGroupClasses = "flex items-center space-x-6 mt-2";
  const radioClasses = "h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Page Title */}
        <div>
          <label htmlFor="title" className={labelClasses}>
            Page Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={inputClasses}
            placeholder="Enter page title"
            required
          />
        </div>

        {/* Page Category */}
        <div>
          <label className={labelClasses}>
            Page Category *
          </label>
          <div className={radioGroupClasses}>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="general"
                checked={formData.category === 'general'}
                onChange={(e) => {
                  const category = e.target.value as 'general' | 'legal';
                  const baseSlug = generateSlug(formData.title);
                  const finalSlug = category === 'legal' ? `legal-${baseSlug}` : baseSlug;
                  setFormData({ 
                    ...formData, 
                    category,
                    slug: formData.title ? finalSlug : formData.slug
                  });
                }}
                className={radioClasses}
              />
              <span className="ml-2 text-gray-700 font-medium">General Page</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="legal"
                checked={formData.category === 'legal'}
                onChange={(e) => {
                  const category = e.target.value as 'general' | 'legal';
                  const baseSlug = generateSlug(formData.title);
                  const finalSlug = category === 'legal' ? `legal-${baseSlug}` : baseSlug;
                  setFormData({ 
                    ...formData, 
                    category,
                    slug: formData.title ? finalSlug : formData.slug
                  });
                }}
                className={radioClasses}
              />
              <span className="ml-2 text-gray-700 font-medium">Legal Page</span>
            </label>
          </div>
          {formData.category === 'legal' && (
            <p className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
              <span className="font-medium">Info:</span> Legal pages will be accessible at /legal/[slug-without-legal-prefix]
            </p>
          )}
        </div>

        {/* Page Slug */}
        <div>
          <label htmlFor="slug" className={labelClasses}>
            Page Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className={inputClasses}
            placeholder="page-url-slug"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            URL-friendly version of the page title (lowercase, no spaces)
          </p>
        </div>

        {/* Content Editor */}
        <div>
          <label className={labelClasses}>
            Content *
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors duration-200">
            <Editor
              apiKey={import.meta.env.VITE_API_KEY}
              value={formData.content}
              onEditorChange={handleEditorChange}
              init={{
                height: 400,
                menubar: 'file edit view insert format tools table help',
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                  'paste', 'importcss', 'autosave', 'save', 'directionality',
                  'visualchars', 'template', 'codesample', 'hr', 'pagebreak',
                  'nonbreaking', 'toc', 'imagetools', 'textpattern', 'noneditable',
                  'quickbars', 'emoticons', 'advcode', 'advtable'
                ],
                toolbar: [
                  'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                  'forecolor backcolor | subscript superscript | insertdatetime | code codesample | hr pagebreak | fullscreen preview save print | help'
                ].join(' | '),
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                quickbars_insert_toolbar: 'quickimage quicktable',
                toolbar_mode: 'sliding',
                contextmenu: 'link image imagetools table',
                skin: 'oxide',
                content_css: 'default',
                font_family_formats: 'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
                fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
                paste_data_images: true,
                image_advtab: true,
                image_caption: true,
                quickbars_image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
                table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                table_appearance_options: true,
                table_grid: false,
                table_resize_bars: true,
                table_header_type: 'sectionCells',
                advcode_inline: true,
                link_assume_external_targets: true,
                link_context_toolbar: true,
                branding: false,
                promotion: false,
                license_key: 'gpl',
                setup: (editor) => {
                  editor.on('init', () => {
                    console.log('TinyMCE Editor initialized');
                  });
                }
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={labelClasses}>
            Status *
          </label>
          <div className={radioGroupClasses}>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="active"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className={radioClasses}
              />
              <span className="ml-2 text-gray-700 font-medium">Active</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className={radioClasses}
              />
              <span className="ml-2 text-gray-700 font-medium">Inactive</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update Page' : 'Create Page'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
