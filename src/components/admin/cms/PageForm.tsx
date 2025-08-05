
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { lowlight } from 'lowlight';

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

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({ types: [TextStyle.name] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Strike,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      HorizontalRule,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
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

  const addLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
  ];

  const highlightColors = [
    '#ffff00', '#00ff00', '#00ffff', '#ff9900', '#ff00ff', '#0000ff', '#ff0000', '#808080'
  ];

  const fontFamilies = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 
    'Lucida Console', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
  ];

  const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 h-12 px-4 text-gray-900 bg-white";
  const buttonClasses = "px-2 py-1 text-xs rounded hover:bg-gray-100 border border-gray-300";
  const activeButtonClasses = "px-2 py-1 text-xs rounded bg-primary-600 text-white border border-primary-600";

  if (!editor) {
    return <div>Loading editor...</div>;
  }

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
          {/* Enhanced Editor Toolbar */}
          <div className="bg-gray-50 border-b border-gray-300 p-2 space-y-2">
            {/* Row 1: Basic formatting */}
            <div className="flex flex-wrap gap-1 items-center">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    editor.chain().focus().setFontFamily(e.target.value).run();
                  }
                }}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Font Family</option>
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? activeButtonClasses : buttonClasses}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? activeButtonClasses : buttonClasses}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? activeButtonClasses : buttonClasses}
              >
                <u>U</u>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? activeButtonClasses : buttonClasses}
              >
                <s>S</s>
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={editor.isActive('subscript') ? activeButtonClasses : buttonClasses}
              >
                X₂
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={editor.isActive('superscript') ? activeButtonClasses : buttonClasses}
              >
                X²
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Color picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={buttonClasses}
                >
                  A
                </button>
                {showColorPicker && (
                  <div className="absolute top-8 left-0 bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
                    <div className="grid grid-cols-10 gap-1 w-48">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className="w-4 h-4 border border-gray-300 rounded"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Highlight picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className={buttonClasses}
                >
                  🖍️
                </button>
                {showHighlightPicker && (
                  <div className="absolute top-8 left-0 bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
                    <div className="flex gap-1">
                      {highlightColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 border border-gray-300 rounded"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            editor.chain().focus().toggleHighlight({ color }).run();
                            setShowHighlightPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Headings and alignment */}
            <div className="flex flex-wrap gap-1 items-center">
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive('paragraph') ? activeButtonClasses : buttonClasses}
              >
                P
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? activeButtonClasses : buttonClasses}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? activeButtonClasses : buttonClasses}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? activeButtonClasses : buttonClasses}
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={editor.isActive('heading', { level: 4 }) ? activeButtonClasses : buttonClasses}
              >
                H4
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? activeButtonClasses : buttonClasses}
              >
                ⬅️
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? activeButtonClasses : buttonClasses}
              >
                ↔️
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? activeButtonClasses : buttonClasses}
              >
                ➡️
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={editor.isActive({ textAlign: 'justify' }) ? activeButtonClasses : buttonClasses}
              >
                ↕️
              </button>
            </div>

            {/* Row 3: Lists and special elements */}
            <div className="flex flex-wrap gap-1 items-center">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? activeButtonClasses : buttonClasses}
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? activeButtonClasses : buttonClasses}
              >
                1. List
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive('code') ? activeButtonClasses : buttonClasses}
              >
                {'</>'}
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? activeButtonClasses : buttonClasses}
              >
                Code Block
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? activeButtonClasses : buttonClasses}
              >
                ❝ Quote
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => setShowLinkDialog(true)}
                className={buttonClasses}
              >
                🔗 Link
              </button>
              <button
                type="button"
                onClick={addImage}
                className={buttonClasses}
              >
                🖼️ Image
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className={buttonClasses}
              >
                ➖ HR
              </button>
            </div>

            {/* Row 4: Table and undo/redo */}
            <div className="flex flex-wrap gap-1 items-center">
              <button
                type="button"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className={buttonClasses}
              >
                📊 Table
              </button>
              {editor.isActive('table') && (
                <>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className={buttonClasses}
                  >
                    + Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className={buttonClasses}
                  >
                    - Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className={buttonClasses}
                  >
                    + Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className={buttonClasses}
                  >
                    - Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className={buttonClasses}
                  >
                    Delete Table
                  </button>
                </>
              )}

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className={`${buttonClasses} disabled:opacity-50`}
              >
                ↶ Undo
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className={`${buttonClasses} disabled:opacity-50`}
              >
                ↷ Redo
              </button>
            </div>
          </div>
          
          {/* Editor Content */}
          <div className="prose max-w-none p-4 min-h-[400px] text-gray-900 bg-white focus-within:outline-none">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium mb-4">Add Link</h3>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Add Link
                </button>
              </div>
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
