/**
 * Document Upload Page
 * Upload and process multiple documents at once
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import documentsService from "@/services/api/documents.service";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";

const UPLOAD_CONSTRAINTS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  maxFiles: 10,
  allowedExtensions: [".pdf", ".docx", ".txt"],
};

function DocumentUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSubjectId = searchParams.get("subjectId");
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(preselectedSubjectId || "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { fileIndex: progress }
  const [error, setError] = useState(null);
  const [uploadResults, setUploadResults] = useState({ successful: [], failed: [] });
  const [dragActive, setDragActive] = useState(false);
  
  // Document limit state
  const [documentLimit, setDocumentLimit] = useState(null);
  const [limitWarning, setLimitWarning] = useState(null);
  const [checkingLimit, setCheckingLimit] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Check document limit when subject changes
  useEffect(() => {
    if (selectedSubject) {
      checkDocumentLimit(selectedSubject);
    } else {
      setDocumentLimit(null);
      setLimitWarning(null);
    }
  }, [selectedSubject]);

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

  const checkDocumentLimit = async (subjectId) => {
    try {
      setCheckingLimit(true);
      const limit = await documentsService.checkDocumentLimit(subjectId);
      setDocumentLimit(limit);
      
      // Show warning if already at limit
      if (!limit.isUnlimited && !limit.canUpload) {
        setLimitWarning({
          type: "full",
          message: `Môn học này đã đạt giới hạn tài liệu (${limit.currentCount}/${limit.maxAllowed}). Vui lòng xóa bớt tài liệu hoặc nâng cấp gói đăng ký để tải lên thêm.`,
          remaining: 0,
        });
      } else {
        setLimitWarning(null);
      }
    } catch (err) {
      console.error("Failed to check document limit:", err);
    } finally {
      setCheckingLimit(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await subjectsService.getSubjects({ pageSize: 100 });
      setSubjects(data.items || []);
    } catch (err) {
      const _ignore = err;
      setError("Không thể tải danh sách môn học");
    }
  };

  const validateFile = useCallback((file) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!UPLOAD_CONSTRAINTS.allowedExtensions.includes(ext)) {
      return `File "${file.name}": Chỉ chấp nhận file .pdf, .docx, .txt`;
    }
    if (file.size > UPLOAD_CONSTRAINTS.maxFileSize) {
      return `File "${file.name}": Kích thước tối đa là 20MB`;
    }
    return null;
  }, []);

  const handleFilesSelect = useCallback((files) => {
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
      setError(null);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  }, [selectedFiles, validateFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  }, [handleFilesSelect]);

  const handleRemoveFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError("Vui lòng chọn ít nhất một file");
      return;
    }

    if (!selectedSubject) {
      setError("Vui lòng chọn môn học");
      return;
    }

    // Check document limit before upload
    if (limitWarning && limitWarning.type === "full") {
      setError("Không thể tải lên - môn học đã đạt giới hạn tài liệu. Vui lòng xóa bớt tài liệu hoặc nâng cấp gói đăng ký.");
      return;
    }

    if (limitWarning && limitWarning.type === "exceed") {
      setError(`Không thể tải lên - số file đang chọn (${selectedFiles.length}) vượt quá số slot còn trống (${limitWarning.remaining}). Vui lòng xóa bớt ${limitWarning.excess} file.`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress({});
      setUploadResults({ successful: [], failed: [] });

      const results = await documentsService.uploadMultipleDocuments(
        selectedFiles,
        selectedSubject,
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

      // If all successful, redirect after delay
      if (results.failed.length === 0) {
        setTimeout(() => {
          navigate(`/documents/list?subjectId=${selectedSubject}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải lên tài liệu");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    const icons = {
      ".pdf": "📄",
      ".docx": "📝",
      ".txt": "📃",
    };
    return icons[ext] || "📎";
  };

  // Calculate overall progress
  const overallProgress = selectedFiles.length > 0 
    ? Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / selectedFiles.length)
    : 0;

  const isComplete = uploadResults.successful.length > 0 || uploadResults.failed.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">📄 Tải lên tài liệu</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Tải lên nhiều tài liệu cùng lúc để hệ thống tự động trích xuất nội dung và tạo tóm tắt
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 sm:pb-8">
        {/* Upload Results */}
        {isComplete && !uploading && (
          <div className="space-y-3 mb-4 sm:mb-6">
            {uploadResults.successful.length > 0 && (
              <div className="bg-success-50 border border-success-200 rounded-lg sm:rounded-xl p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-2xl sm:text-4xl">✅</span>
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-success-900">
                      Tải lên thành công {uploadResults.successful.length} file!
                    </h3>
                    <p className="text-xs sm:text-base text-success-700">Tài liệu đang được xử lý...</p>
                  </div>
                </div>
                {uploadResults.failed.length === 0 && (
                  <p className="text-xs sm:text-sm text-success-600">Đang chuyển hướng...</p>
                )}
              </div>
            )}
            {uploadResults.failed.length > 0 && (
              <div className="bg-error-50 border border-error-200 rounded-lg sm:rounded-xl p-3 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-4xl">❌</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg font-bold text-error-900 mb-1 sm:mb-2">
                      Thất bại {uploadResults.failed.length} file
                    </h3>
                    <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-error-700">
                      {uploadResults.failed.map((item, idx) => (
                        <li key={idx} className="truncate">• {item.file}: {item.error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {uploadResults.failed.length > 0 && (
              <Button
                onClick={() => {
                  setUploadResults({ successful: [], failed: [] });
                  setSelectedFiles([]);
                }}
                className="text-sm"
              >
                Tải lên file khác
              </Button>
            )}
          </div>
        )}

        {!isComplete && (
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Subject Selection */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn môn học <span className="text-error-600">*</span>
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                disabled={uploading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
              
              {/* Document Limit Info */}
              {selectedSubject && !checkingLimit && documentLimit && (
                <div className="mt-2">
                  {documentLimit.isUnlimited ? (
                    <p className="text-sm text-gray-500 inline-flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M8 14V17 M12 11V17 M16 8V17" />
                      </svg>
                      Không giới hạn số tài liệu cho môn học này
                    </p>
                  ) : (
                    <p className={`text-sm inline-flex items-center gap-1.5 ${documentLimit.remaining <= 2 ? "text-warning-600" : "text-gray-500"}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M8 14V17 M12 11V17 M16 8V17" />
                      </svg>
                      Đang có {documentLimit.currentCount}/{documentLimit.maxAllowed} tài liệu 
                      {documentLimit.remaining > 0 
                        ? ` (còn ${documentLimit.remaining} slot trống)`
                        : " (đã đầy)"}
                    </p>
                  )}
                </div>
              )}
              {checkingLimit && (
                <p className="mt-2 text-sm text-gray-400">Đang kiểm tra giới hạn...</p>
              )}
            </div>

            {/* Document Limit Warning */}
            {limitWarning && (
              <div className={`rounded-lg sm:rounded-xl p-2.5 sm:p-4 ${
                limitWarning.type === "full" 
                  ? "bg-error-50 border border-error-200" 
                  : "bg-warning-50 border border-warning-200"
              }`}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="flex-shrink-0 hidden sm:block">
                    {limitWarning.type === "full" ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error-500">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M4.93 4.93l14.14 14.14" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning-500">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm sm:text-base font-semibold mb-1 ${
                      limitWarning.type === "full" ? "text-error-800" : "text-warning-800"
                    }`}>
                      {limitWarning.type === "full" ? "Đã đạt giới hạn tài liệu" : "Vượt quá giới hạn cho phép"}
                    </h4>
                    <p className={`text-xs sm:text-sm ${
                      limitWarning.type === "full" ? "text-error-700" : "text-warning-700"
                    }`}>
                      {limitWarning.message}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {limitWarning.type === "exceed" && limitWarning.excess > 0 && (
                        <span className="text-xs px-2 py-1 bg-warning-100 text-warning-800 rounded-full">
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

            {/* File Upload - Drag & Drop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn file <span className="text-error-600">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-3 sm:p-6 lg:p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-300 dark:border-slate-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                } ${uploading ? "pointer-events-none opacity-60" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  disabled={uploading}
                  className="hidden"
                  multiple
                />
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl mb-2 sm:mb-4">📁</span>
                  <p className="text-sm sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    {dragActive ? "Thả file vào đây" : "Kéo thả hoặc click"}
                  </p>
                  <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="hidden sm:inline">Hỗ trợ: PDF, DOCX, TXT | Tối đa: 20MB/file | Tối đa {UPLOAD_CONSTRAINTS.maxFiles} file</span>
                    <span className="sm:hidden">PDF, DOCX, TXT • 20MB • {UPLOAD_CONSTRAINTS.maxFiles} file</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Đã chọn {selectedFiles.length} file
                  </span>
                  {!uploading && selectedFiles.length > 1 && (
                    <button
                      type="button"
                      className="text-sm text-error-600 hover:text-error-700"
                      onClick={handleClearAll}
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {/* Overall Progress */}
                {uploading && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary-700">Đang tải lên...</span>
                      <span className="text-sm font-medium text-primary-700">{overallProgress}%</span>
                    </div>
                    <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* File List */}
                <div className="max-h-48 sm:max-h-60 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2 sm:gap-4 bg-gray-50 dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{getFileIcon(file.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      {uploading && uploadProgress[index] !== undefined && (
                        <span className="text-sm font-medium text-primary-600">{uploadProgress[index]}%</span>
                      )}
                      {!uploading && (
                        <button
                          type="button"
                          className="text-gray-400 hover:text-error-600 transition-colors p-2"
                          onClick={() => handleRemoveFile(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 sm:gap-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={uploading}
                className="px-3 sm:px-4 text-sm"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={uploading}
                disabled={selectedFiles.length === 0 || !selectedSubject || !!limitWarning}
                className="px-3 sm:px-4 text-sm"
              >
                {uploading 
                  ? "Tải lên..." 
                  : `Tải lên${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ""}`
                }
              </Button>
            </div>
          </form>
        )}

        {/* Info Section */}
        <div className="mt-4 sm:mt-8 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-6">
          <h3 className="text-sm sm:text-lg font-bold text-blue-900 mb-2 sm:mb-4">📌 Lưu ý</h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-base text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Chỉ chấp nhận file định dạng: PDF, DOCX, TXT</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Kích thước file tối đa: 20MB mỗi file</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Có thể tải lên tối đa {UPLOAD_CONSTRAINTS.maxFiles} file cùng lúc</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Số tài liệu mỗi môn học phụ thuộc vào gói đăng ký của bạn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Hệ thống sẽ tự động trích xuất nội dung từ tài liệu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Sau khi upload, tài liệu sẽ được xử lý và tạo tóm tắt tự động</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DocumentUploadPage;
