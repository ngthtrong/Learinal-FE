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
import "./SubjectCreatePage.css";

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
    <div className="subject-create-page">
      <div className="page-container">
        <div className="page-header">
          <button className="back-button" onClick={handleCancel} aria-label="Quay lại">
            ← Quay lại
          </button>
          <h1>Tạo môn học mới</h1>
          <p className="page-subtitle">
            Tạo một môn học để bắt đầu thêm tài liệu và câu hỏi học tập
          </p>
        </div>

        <div className="form-container">
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
