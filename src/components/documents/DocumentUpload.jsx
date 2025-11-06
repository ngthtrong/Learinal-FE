/**
 * DocumentUpload Component
 * Drag & drop file upload with validation and progress tracking
 */

import { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import "./DocumentUpload.css";

const UPLOAD_CONSTRAINTS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ],
  allowedExtensions: [".pdf", ".docx", ".doc", ".txt"],
};

function DocumentUpload({ subjectId, onUploadSuccess, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > UPLOAD_CONSTRAINTS.maxFileSize) {
      return "File quá lớn. Kích thước tối đa là 20MB.";
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!UPLOAD_CONSTRAINTS.allowedExtensions.includes(fileExtension)) {
      return "Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, DOC, TXT.";
    }

    if (!UPLOAD_CONSTRAINTS.allowedTypes.includes(file.type)) {
      return "Loại file không được hỗ trợ.";
    }

    return null;
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setError("");
      setSelectedFile(file);
      setUploadProgress(0);
    },
    [validateFile]
  );

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !subjectId) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Simulate upload progress (in real app, use onUploadProgress from axios)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call upload API
      const documentsService = (await import("@/services/api/documents.service")).default;
      const result = await documentsService.uploadDocument(
        selectedFile,
        subjectId,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Success callback
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Reset state
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải lên tài liệu");
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, subjectId, onUploadSuccess]);

  // Remove selected file
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (!file) return "📄";
    const extension = file.name.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return "📕";
      case "docx":
      case "doc":
        return "📘";
      case "txt":
        return "📝";
      default:
        return "📄";
    }
  };

  return (
    <div className="document-upload">
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? "drag-active" : ""} ${error ? "error" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📁</div>
          <p className="drop-text">
            {dragActive ? "Thả file vào đây" : "Kéo thả file vào đây hoặc click để chọn"}
          </p>
          <p className="drop-hint">Hỗ trợ: PDF, DOCX, DOC, TXT | Tối đa: 20MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept={UPLOAD_CONSTRAINTS.allowedExtensions.join(",")}
          onChange={handleFileInputChange}
          disabled={uploading}
        />
      </div>

      {/* Error Message */}
      {error && <div className="upload-error">{error}</div>}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="file-preview">
          <div className="file-info">
            <span className="file-icon">{getFileIcon(selectedFile)}</span>
            <div className="file-details">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            {!uploading && (
              <button className="remove-file-btn" onClick={handleRemoveFile} aria-label="Xóa file">
                ✕
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="upload-actions">
        <Button variant="secondary" onClick={onCancel} disabled={uploading}>
          Hủy
        </Button>
        <Button onClick={handleUpload} disabled={!selectedFile || uploading} loading={uploading}>
          {uploading ? "Đang tải lên..." : "Upload"}
        </Button>
      </div>
    </div>
  );
}

DocumentUpload.propTypes = {
  subjectId: PropTypes.string.isRequired,
  onUploadSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default DocumentUpload;
