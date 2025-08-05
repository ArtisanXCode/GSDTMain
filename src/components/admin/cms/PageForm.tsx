import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      })
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    }
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
        {editor && (
          <div className="border border-gray-300 rounded-md overflow-hidden">
            {/* Editor Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('bold') ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('italic') ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('underline') ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <u>U</u>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                H3
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('bulletList') ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('orderedList') ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                1. List
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                ↔
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                →
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('Enter URL:');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`px-2 py-1 text-xs rounded ${
                  editor.isActive('link') ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔗
              </button>
              
              <button
                type="button"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="px-2 py-1 text-xs rounded bg-white text-gray-700 hover:bg-gray-100"
              >
                Table
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('Enter image URL:');
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }}
                className="px-2 py-1 text-xs rounded bg-white text-gray-700 hover:bg-gray-100"
              >
                📷
              </button>
              
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="px-2 py-1 text-xs rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="px-2 py-1 text-xs rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                ↷
              </button>
            </div>
            
            {/* Editor Content */}
            <div className="prose max-w-none p-4 min-h-[300px] text-gray-900 bg-white focus-within:outline-none">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
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