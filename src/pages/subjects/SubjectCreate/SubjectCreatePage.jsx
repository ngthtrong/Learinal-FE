/**
 * Subject Create Page
 * Page for creating a new subject
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubjectForm } from "@components/subjects";
import { useToast } from "@components/common";
import { subjectsService } from "@services/api";
import { getErrorMessage } from "@utils";

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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            onClick={handleCancel}
            aria-label="Quay lại"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo môn học mới</h1>
          <p className="text-gray-600">
            Tạo một môn học để bắt đầu thêm tài liệu và câu hỏi học tập
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-medium p-6">
          <SubjectForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitText="Tạo môn học"
          />
        </div>
      </div>
    </div>
  );
};

export default SubjectCreatePage;
