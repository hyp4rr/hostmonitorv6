import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    value: string;
    onChange: (path: string) => void;
    uploadEndpoint: string;
    placeholder?: string;
    className?: string;
    showPreview?: boolean;
}

export default function ImageUploader({
    value,
    onChange,
    uploadEndpoint,
    placeholder = 'Image path or URL',
    className = '',
    showPreview = true,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview when value changes
    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (8MB)
        if (file.size > 8 * 1024 * 1024) {
            setError('File size must be less than 8MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Upload failed');
            }

            const data = await response.json();
            const imagePath = data.path;

            // Update preview and value
            setPreview(imagePath);
            onChange(imagePath);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            console.error('Image upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPath = e.target.value;
        setPreview(newPath || null);
        onChange(newPath);
        setError(null);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Preview */}
            {showPreview && preview && (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg border-2 border-slate-300 object-cover dark:border-slate-600"
                        onError={() => {
                            setPreview(null);
                            setError('Failed to load image');
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                        title="Remove image"
                    >
                        <X className="size-3" />
                    </button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Input and Upload */}
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={value}
                        onChange={handlePathChange}
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600">
                    {uploading ? (
                        <>
                            <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="size-4" />
                            <span>Upload</span>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    );
}

