/**
 * Document Upload Page
 * Upload and process new documents
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import documentsService from "@/services/api/documents.service";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
function DocumentUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSubjectId = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(preselectedSubjectId || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectsService.getSubjects({ pageSize: 100 });
      setSubjects(data.items || []);
    } catch (err) {
      const _ignore = err;
      setError("Không thể tải danh sách môn học");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [".pdf", ".docx", ".txt"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setError("Chỉ chấp nhận file .pdf, .docx, .txt");
      return;
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Kích thước file tối đa là 20MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Vui lòng chọn file");
      return;
    }

    if (!selectedSubject) {
      setError("Vui lòng chọn môn học");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      await documentsService.uploadDocument(selectedFile, selectedSubject, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setSuccess(true);
      setSelectedFile(null);
      setUploadProgress(0);

      // Redirect to document list after 2 seconds
      setTimeout(() => {
        navigate(`/documents/list?subjectId=${selectedSubject}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải lên tài liệu");
      setUploadProgress(0);
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

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">📄 Tải lên tài liệu</h1>
            <p className="text-lg text-gray-600">
              Tải lên tài liệu để hệ thống tự động trích xuất nội dung và tạo tóm tắt
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {success && (
          <div className="bg-success-50 border border-success-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-success-900 mb-2">Tải lên thành công!</h3>
            <p className="text-success-700">Tài liệu đang được xử lý. Đang chuyển hướng...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Subject Selection */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn môn học <span className="text-error-600">*</span>
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                disabled={uploading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <span className="text-4xl">📁</span>
                  <span className="text-gray-600">
                    {selectedFile ? selectedFile.name : "Chọn file (.pdf, .docx, .txt)"}
                  </span>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">Kích thước tối đa: 20MB</p>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-4xl">{getFileIcon(selectedFile.name)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-error-600 transition-colors p-2"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600">
                  Đang tải lên... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={uploading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={uploading}
                disabled={!selectedFile || !selectedSubject}
              >
                {uploading ? "Đang tải lên..." : "Tải lên"}
              </Button>
            </div>
          </form>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">📌 Lưu ý</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Chỉ chấp nhận file định dạng: PDF, DOCX, TXT</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Kích thước file tối đa: 20MB</span>
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
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
