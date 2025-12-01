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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
          <button
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 mb-4 transition-colors"
            onClick={handleCancel}
            aria-label="Quay lại"
          >
            ← Quay lại danh sách môn học
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <SubjectsIcon size={24} stroke={2} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Tạo môn học mới</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-100">
              Tạo một môn học để bắt đầu thêm tài liệu và câu hỏi học tập
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
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
