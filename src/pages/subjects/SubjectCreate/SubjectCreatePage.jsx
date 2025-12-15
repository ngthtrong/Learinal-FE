import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubjectForm } from "@components/subjects";
import { useToast } from "@components/common";
import { subjectsService } from "@services/api";
import { getErrorMessage } from "@utils";
import { Footer } from "@/components/layout";
import SubjectsIcon from "@/components/icons/SubjectsIcon";

const SubjectCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);

    try {
      const created = await subjectsService.createSubject(data);

      toast.showSuccess("Tạo môn học thành công!");

      // Redirect to subject detail page
      setTimeout(() => {
        navigate(`/subjects/${created.id}`);
      }, 500);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      toast.showError(errorMsg);
      console.error("Create subject error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/subjects");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <button
            className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-3 sm:mb-4 transition-colors"
            onClick={handleCancel}
            aria-label="Quay lại"
          >
            ← <span className="hidden sm:inline">Quay lại danh sách môn học</span><span className="sm:hidden">Quay lại</span>
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <SubjectsIcon size={20} stroke={2} className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Tạo môn học mới</h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Tạo một môn học để bắt đầu thêm tài liệu và câu hỏi học tập
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8">
          <SubjectForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitText="Tạo môn học"
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SubjectCreatePage;
