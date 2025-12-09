/**
 * DocumentUpload Component
 * Drag & drop file upload with validation and progress tracking
 * Supports multiple file upload with document limit check
 */

import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import DocumentIcon from "@/components/icons/DocumentIcon";
import UploadIcon from "@/components/icons/UploadIcon";

const UPLOAD_CONSTRAINTS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  maxFiles: 10, // Maximum files per upload
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ],
  allowedExtensions: [".pdf", ".docx", ".doc", ".txt"],
};

function DocumentUpload({ subjectId, onUploadSuccess, onCancel }) {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { fileIndex: progress }
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadResults, setUploadResults] = useState({ successful: [], failed: [] });
  const fileInputRef = useRef(null);
  
  // Document limit state
  const [documentLimit, setDocumentLimit] = useState(null);
  const [limitWarning, setLimitWarning] = useState(null);
  const [checkingLimit, setCheckingLimit] = useState(false);

  // Check document limit when component mounts or subjectId changes
  useEffect(() => {
    if (subjectId) {
      checkDocumentLimit();
    }
  }, [subjectId]);

  // Check if selected files exceed limit
  useEffect(() => {
    if (documentLimit && !documentLimit.isUnlimited && selectedFiles.length > 0) {
      const wouldExceed = selectedFiles.length > documentLimit.remaining;
      if (wouldExceed) {
        const excess = selectedFiles.length - documentLimit.remaining;
        setLimitWarning({
          type: "exceed",
          message: `Bạn đang chọn ${selectedFiles.length} file nhưng chỉ còn ${documentLimit.remaining} slot trống (đang có ${documentLimit.currentCount}/${documentLimit.maxAllowed} tài liệu). Vui lòng xóa ${excess} file hoặc nâng cấp gói đăng ký.`,
          excess,
          remaining: documentLimit.remaining,
        });
      } else {
        setLimitWarning(null);
      }
    } else {
      setLimitWarning(null);
    }
  }, [selectedFiles.length, documentLimit]);

  const checkDocumentLimit = async () => {
    try {
      setCheckingLimit(true);
      const documentsService = (await import("@/services/api/documents.service")).default;
      const limit = await documentsService.checkDocumentLimit(subjectId);
      setDocumentLimit(limit);
      
      // Show warning if already at limit
      if (!limit.isUnlimited && !limit.canUpload) {
        setLimitWarning({
          type: "full",
          message: `Môn học này đã đạt giới hạn tài liệu (${limit.currentCount}/${limit.maxAllowed}). Vui lòng xóa bớt tài liệu hoặc nâng cấp gói đăng ký để tải lên thêm.`,
          remaining: 0,
        });
      }
    } catch (err) {
      console.error("Failed to check document limit:", err);
    } finally {
      setCheckingLimit(false);
    }
  };

  // File validation
  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > UPLOAD_CONSTRAINTS.maxFileSize) {
      return `File "${file.name}" quá lớn. Kích thước tối đa là 20MB.`;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!UPLOAD_CONSTRAINTS.allowedExtensions.includes(fileExtension)) {
      return `File "${file.name}" có định dạng không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, DOC, TXT.`;
    }

    if (!UPLOAD_CONSTRAINTS.allowedTypes.includes(file.type)) {
      return `File "${file.name}" có loại không được hỗ trợ.`;
    }

    return null;
  }, []);

  // Handle multiple file selection
  const handleFilesSelect = useCallback(
    (files) => {
      const fileArray = Array.from(files);
      
      // Check max files limit
      if (selectedFiles.length + fileArray.length > UPLOAD_CONSTRAINTS.maxFiles) {
        setError(`Chỉ được tải lên tối đa ${UPLOAD_CONSTRAINTS.maxFiles} file cùng lúc.`);
        return;
      }

      const validFiles = [];
      const errors = [];

      fileArray.forEach((file) => {
        // Check for duplicates
        const isDuplicate = selectedFiles.some((f) => f.name === file.name && f.size === file.size);
        if (isDuplicate) {
          errors.push(`File "${file.name}" đã được chọn.`);
          return;
        }

        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join(" "));
      } else {
        setError("");
      }

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setUploadProgress({});
      }
    },
    [validateFile, selectedFiles]
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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesSelect(e.dataTransfer.files);
      }
    },
    [handleFilesSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesSelect(e.target.files);
      }
    },
    [handleFilesSelect]
  );

  // Handle upload multiple files
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !subjectId) return;

    // Check document limit before upload
    if (limitWarning && limitWarning.type === "full") {
      setError("Không thể tải lên - môn học đã đạt giới hạn tài liệu. Vui lòng xóa bớt tài liệu hoặc nâng cấp gói đăng ký.");
      return;
    }

    if (limitWarning && limitWarning.type === "exceed") {
      setError(`Không thể tải lên - số file đang chọn (${selectedFiles.length}) vượt quá số slot còn trống (${limitWarning.remaining}). Vui lòng xóa bớt ${limitWarning.excess} file.`);
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress({});
    setUploadResults({ successful: [], failed: [] });

    try {
      const documentsService = (await import("@/services/api/documents.service")).default;
      
      const results = await documentsService.uploadMultipleDocuments(
        selectedFiles,
        subjectId,
        // onFileProgress
        (fileIndex, progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileIndex]: progress }));
        },
        // onFileComplete
        (fileIndex, result) => {
          setUploadProgress((prev) => ({ ...prev, [fileIndex]: 100 }));
          setUploadResults((prev) => ({
            ...prev,
            successful: [...prev.successful, result],
          }));
        },
        // onFileError
        (fileIndex, error, fileName) => {
          setUploadResults((prev) => ({
            ...prev,
            failed: [...prev.failed, { file: fileName, error: error.response?.data?.message || error.message }],
          }));
        }
      );

      // Success callback
      if (onUploadSuccess) {
        onUploadSuccess(results);
      }

      // Reset state after short delay
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress({});
        setUploading(false);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải lên tài liệu");
      setUploading(false);
      setUploadProgress({});
    }
  }, [selectedFiles, subjectId, onUploadSuccess, limitWarning]);

  // Remove selected file by index
  const handleRemoveFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Clear all selected files
  const handleClearAll = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress({});
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

  // Get file icon - now returns DocumentIcon component
  const getFileIcon = () => {
    return <DocumentIcon size={32} strokeWidth={2} className="text-primary-600 dark:text-primary-400" />;
  };

  // Calculate overall progress
  const overallProgress = selectedFiles.length > 0 
    ? Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / selectedFiles.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Document Limit Info */}
      {!checkingLimit && documentLimit && (
        <div className={`text-sm px-3 py-2 rounded-lg ${
          documentLimit.isUnlimited 
            ? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400" 
            : documentLimit.remaining <= 2 
              ? "bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400"
              : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        }`}>
          <span className="inline-flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 14V17 M12 11V17 M16 8V17" />
            </svg>
            {documentLimit.isUnlimited ? (
              "Không giới hạn số tài liệu cho môn học này"
            ) : (
              <>
                Đang có {documentLimit.currentCount}/{documentLimit.maxAllowed} tài liệu
                {documentLimit.remaining > 0 
                  ? ` (còn ${documentLimit.remaining} slot trống)`
                  : " (đã đầy)"}
              </>
            )}
          </span>
        </div>
      )}
      {checkingLimit && (
        <div className="text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400">
          Đang kiểm tra giới hạn...
        </div>
      )}

      {/* Document Limit Warning */}
      {limitWarning && (
        <div className={`rounded-xl p-3 sm:p-4 ${
          limitWarning.type === "full" 
            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" 
            : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="flex-shrink-0 hidden sm:block">
              {limitWarning.type === "full" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.93 4.93l14.14 14.14" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 dark:text-yellow-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm sm:text-base font-semibold mb-1 ${
                limitWarning.type === "full" 
                  ? "text-red-800 dark:text-red-300" 
                  : "text-yellow-800 dark:text-yellow-300"
              }`}>
                {limitWarning.type === "full" ? "Đã đạt giới hạn tài liệu" : "Vượt quá giới hạn cho phép"}
              </h4>
              <p className={`text-xs sm:text-sm ${
                limitWarning.type === "full" 
                  ? "text-red-700 dark:text-red-400" 
                  : "text-yellow-700 dark:text-yellow-400"
              }`}>
                {limitWarning.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {limitWarning.type === "exceed" && limitWarning.excess > 0 && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                    Cần xóa {limitWarning.excess} file
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/subscriptions/plans")}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  Nâng cấp gói
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400"
            : error
            ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-800/50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary-100 dark:bg-primary-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <UploadIcon size={28} strokeWidth={2} className="text-primary-600 dark:text-primary-400 sm:hidden" />
            <UploadIcon size={32} strokeWidth={2} className="text-primary-600 dark:text-primary-400 hidden sm:block lg:hidden" />
            <UploadIcon size={40} strokeWidth={2} className="text-primary-600 dark:text-primary-400 hidden lg:block" />
          </div>
          <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            {dragActive ? "Thả file vào đây" : "Kéo thả hoặc click để chọn"}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Hỗ trợ: PDF, DOCX, DOC, TXT | Tối đa: 20MB/file | Tối đa {UPLOAD_CONSTRAINTS.maxFiles} file</span>
            <span className="sm:hidden">PDF, DOCX, DOC, TXT • Max 20MB • {UPLOAD_CONSTRAINTS.maxFiles} file</span>
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={UPLOAD_CONSTRAINTS.allowedExtensions.join(",")}
          onChange={handleFileInputChange}
          disabled={uploading}
          multiple
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          {error}
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Đã chọn {selectedFiles.length} file
            </span>
            {!uploading && selectedFiles.length > 1 && (
              <button
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                onClick={handleClearAll}
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Overall Progress */}
          {uploading && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Đang tải lên...
                </span>
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {overallProgress}%
                </span>
              </div>
              <div className="h-2 bg-primary-200 dark:bg-primary-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* File List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0">{getFileIcon(file)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {uploading && uploadProgress[index] !== undefined && (
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      {uploadProgress[index]}%
                    </span>
                  )}
                  {!uploading && (
                    <button
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      aria-label="Xóa file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  )}
                </div>
                {/* Individual file progress */}
                {uploading && uploadProgress[index] !== undefined && (
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
                      style={{ width: `${uploadProgress[index]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Results */}
      {(uploadResults.successful.length > 0 || uploadResults.failed.length > 0) && !uploading && (
        <div className="space-y-2">
          {uploadResults.successful.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-600 dark:text-green-400">
              ✅ Đã tải lên thành công {uploadResults.successful.length} file
            </div>
          )}
          {uploadResults.failed.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              ❌ Tải lên thất bại {uploadResults.failed.length} file:
              <ul className="mt-1 list-disc list-inside">
                {uploadResults.failed.map((item, idx) => (
                  <li key={idx}>{item.file}: {item.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={uploading} className="w-full sm:w-auto">
          Hủy
        </Button>
        <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading || !!limitWarning || checkingLimit} loading={uploading} className="w-full sm:w-auto">
          {uploading ? "Đang tải lên..." : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`}
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
