import React, { useState, useRef } from 'react';
import { getApiBaseUrl } from '../utils/domain';
import { uploadApiClient } from '../services/apiClient';
import './ImageUpload.css';

const ImageUpload = ({
    label,
    currentImage,
    onImageChange,
    placeholder = "Click to upload image",
    accept = "image/*",
    maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
            return;
        }

        setError('');
        setUploading(true);

        try {
            const data = await uploadApiClient.uploadFile(file, (progressEvent) => {
                // Optional: Handle upload progress
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
            });

            if (data.success) {
                const apiBaseUrl = getApiBaseUrl();
                const fullImageUrl = `${apiBaseUrl}${data.fileUrl}`;
                onImageChange(fullImageUrl);
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = async () => {
        if (currentImage) {
            try {
                // Extract filename from URL for deletion
                const urlParts = currentImage.split('/');
                const filename = urlParts[urlParts.length - 1];

                await uploadApiClient.deleteFile(filename);
            } catch (error) {
                console.error('Failed to delete image:', error);
            }
        }

        onImageChange('');
    };

    return (
        <div className="image-upload-container">
            {label && <label className="image-upload-label">{label}</label>}

            <div
                className={`image-upload-area ${dragOver ? 'drag-over' : ''} ${currentImage ? 'has-image' : ''}`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="image-upload-input"
                    disabled={uploading}
                />

                {currentImage ? (
                    <div className="image-preview">
                        <img src={currentImage} alt="Uploaded" className="preview-image" />
                        <div className="image-overlay">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage();
                                }}
                                className="remove-image-btn"
                                disabled={uploading}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        {uploading ? (
                            <div className="upload-progress">
                                <div className="spinner"></div>
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="upload-icon">📷</div>
                                <span className="upload-text">{placeholder}</span>
                                <span className="upload-hint">Drag & drop or click to select</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && <div className="upload-error">{error}</div>}
        </div>
    );
};

export default ImageUpload;
