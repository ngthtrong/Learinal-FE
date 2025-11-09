/**
 * Subject Form Component
 * Reusable form for creating and editing subjects
 */

import { useState } from "react";
import { Input, Button } from "@components/common";
/**
 * SubjectForm component
 * @param {Object} props
 * @param {Object} props.initialData - Initial form data { subjectName, description }
 * @param {Function} props.onSubmit - Submit handler (data) => Promise
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.submitText - Submit button text (default: "Lưu")
 */
const SubjectForm = ({
  initialData = { subjectName: "", description: "" },
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Lưu",
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Subject name validation
    if (!formData.subjectName.trim()) {
      newErrors.subjectName = "Tên môn học là bắt buộc";
    } else if (formData.subjectName.trim().length < 3) {
      newErrors.subjectName = "Tên môn học phải có ít nhất 3 ký tự";
    } else if (formData.subjectName.length > 200) {
      newErrors.subjectName = "Tên môn học không được vượt quá 200 ký tự";
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trim values before submit
    const cleanedData = {
      subjectName: formData.subjectName.trim(),
      description: formData.description.trim(),
    };

    await onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="subject-form">
      <Input
        label="Tên môn học"
        type="text"
        name="subjectName"
        value={formData.subjectName}
        onChange={handleChange}
        error={errors.subjectName}
        placeholder="Ví dụ: Toán Cao Cấp A1"
        required
        maxLength={200}
        autoFocus
      />

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Mô tả <span className="optional">(tùy chọn)</span>
        </label>
        <textarea
          id="description"
          name="description"
          className={`form-textarea ${errors.description ? "error" : ""}`}
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả ngắn gọn về môn học này..."
          rows={4}
          maxLength={1000}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
        <div className="char-count">{formData.description.length} / 1000 ký tự</div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default SubjectForm;
