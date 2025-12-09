import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    description?: string;
    placeholder?: string;
    error?: string;
    height?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    label,
    description,
    placeholder,
    error,
    height = '200px'
}: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    return (
        <div className="mb-4">
            <div className="flex justify-between">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
            </div>
            {description && (
                <p className="text-sm text-gray-500 mb-2">{description}</p>
            )}
            <div className={`bg-white ${error ? 'border border-red-300 rounded-md' : ''}`}>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    style={{ height, marginBottom: '40px' }} // ample space for toolbar
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
