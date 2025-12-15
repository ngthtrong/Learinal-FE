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
const LEVEL_OPTIONS = [
  { value: '', label: 'Chưa chọn' },
  { value: 'secondary', label: 'Cấp 2 (THCS)' },
  { value: 'highschool', label: 'Cấp 3 (THPT)' },
  { value: 'university', label: 'Đại học' },
];

const SubjectForm = ({
  initialData = { subjectName: "", description: "", level: "" },
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Lưu",
}) => {
  const [formData, setFormData] = useState({ ...initialData, level: initialData.level || '' });
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
      level: formData.level || '',
    };

    await onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Level selection */}
      <div className="space-y-2">
        <label
          htmlFor="level"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Cấp bậc <span className="text-gray-500 dark:text-gray-400 font-normal">(tùy chọn)</span>
        </label>
        <select
          id="level"
          name="level"
          value={formData.level}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 dark:bg-gray-800"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">Chọn cấp bậc phù hợp để dễ dàng phân loại môn học</p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="subjectName"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Tên môn học <span className="text-red-500">*</span>
        </label>
        <input
          id="subjectName"
          type="text"
          name="subjectName"
          value={formData.subjectName}
          onChange={handleChange}
          placeholder="Ví dụ: Toán Cao Cấp A1"
          maxLength={200}
          autoFocus
          className={`w-full px-4 py-3 border ${
            errors.subjectName ? "border-red-300" : "border-gray-300 dark:border-gray-600"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500`}
        />
        {errors.subjectName && <p className="text-sm text-red-600 mt-1">{errors.subjectName}</p>}
        <p className="text-xs text-gray-500 dark:text-gray-400">Mô tả ngắn gọn về môn học này...</p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Mô tả <span className="text-gray-500 dark:text-gray-400 font-normal">(tùy chọn)</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả ngắn gọn về môn học này..."
          rows={4}
          maxLength={1000}
          className={`w-full px-4 py-3 border ${
            errors.description ? "border-red-300" : "border-gray-300 dark:border-gray-600"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-gray-100 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500`}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Thêm mô tả chi tiết về nội dung, mục tiêu của môn học</span>
          <span className="font-medium">{formData.description.length} / 1000 ký tự</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
