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

  const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 h-12 px-4 text-gray-900 bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Page Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Category
        </label>
        <div className="flex items-center space-x-4 mb-4">
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
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-gray-700">General Page</span>
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
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-gray-700">Legal Page</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Page Slug
          {formData.category === 'legal' && <span className="text-xs text-gray-500 ml-2">(Will be accessible at /legal/[slug-without-legal-prefix])</span>}
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <Editor
            apiKey="no-api-key"
            value={formData.content}
            onEditorChange={handleEditorChange}
            init={{
              height: 500,
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="active"
              checked={formData.status === 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-gray-700">Active</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="inactive"
              checked={formData.status === 'inactive'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-gray-700">Inactive</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {loading ? 'Saving...' : initialData ? 'Update Page' : 'Create Page'}
        </button>
      </div>
    </form>
  );
}