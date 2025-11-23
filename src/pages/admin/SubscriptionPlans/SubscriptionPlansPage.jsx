/**
 * Admin Subscription Plans Management Page
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import subscriptionsService from "@/services/api/subscriptions.service";

const DEFAULT_ENTITLEMENTS_JSON =
  '{\n  "maxMonthlyTestGenerations": 50,\n  "maxValidationRequests": 30,\n  "priorityProcessing": false,\n  "shareLimits": { "canShare": false, "maxSharedUsers": 0 },\n  "maxSubjects": 10\n}';

function AdminSubscriptionPlansPage() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' | 'Active' | 'Inactive'

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    planName: "",
    description: "",
    billingCycle: "Monthly",
    price: 0,
    status: "Active",
    entitlementsText: DEFAULT_ENTITLEMENTS_JSON,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      // Admin endpoint returns all plans; fallback to public if needed
      const res = await subscriptionsService.getAllPlans({ status: statusFilter || undefined });
      const list = res?.data?.plans || res?.plans || [];
      setPlans(list);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải gói nâng cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      planName: "",
      description: "",
      billingCycle: "Monthly",
      price: 0,
      status: "Active",
      entitlementsText:
        '{\n  "maxMonthlyTestGenerations": 50,\n  "maxValidationRequests": 30,\n  "priorityProcessing": false,\n  "shareLimits": { "canShare": false, "maxSharedUsers": 0 },\n  "maxSubjects": 10\n}',
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      planName: p.planName || "",
      description: p.description || "",
      billingCycle: p.billingCycle || "Monthly",
      price: p.price || 0,
      status: p.status || "Active",
      entitlementsText:
        p && p.entitlements && Object.keys(p.entitlements || {}).length > 0
          ? JSON.stringify(p.entitlements, null, 2)
          : DEFAULT_ENTITLEMENTS_JSON,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // parse entitlementsText
      let entitlements;
      try {
        entitlements = JSON.parse(form.entitlementsText || "{}");
      } catch {
        toast.showError("Entitlements phải là JSON hợp lệ");
        return;
      }

      // lightweight client-side validation to avoid server rejection
      const required = [
        "maxMonthlyTestGenerations",
        "maxValidationRequests",
        "priorityProcessing",
        "shareLimits",
        "maxSubjects",
      ];
      for (const key of required) {
        if (!(key in entitlements)) {
          toast.showError(`Thiếu trường bắt buộc trong entitlements: ${key}`);
          return;
        }
      }

      const payload = {
        planName: form.planName?.trim(),
        description: form.description?.trim(),
        billingCycle: form.billingCycle,
        price: Number(form.price) || 0,
        status: form.status,
        entitlements,
      };
      if (!payload.planName) {
        toast.showError("Tên gói không được để trống");
        return;
      }

      if (editing?.id) {
        await subscriptionsService.updatePlan(editing.id, payload);
        toast.showSuccess("Cập nhật gói thành công");
      } else if (editing?._id) {
        await subscriptionsService.updatePlan(editing._id, payload);
        toast.showSuccess("Cập nhật gói thành công");
      } else {
        await subscriptionsService.createPlan(payload);
        toast.showSuccess("Tạo gói mới thành công");
      }
      setModalOpen(false);
      setEditing(null);
      await fetchPlans();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Lưu gói thất bại");
    } finally {
      setSaving(false);
    }
  };

  const confirmArchive = async () => {
    if (!confirmDelete) return;
    try {
      setSaving(true);
      const id = confirmDelete.id || confirmDelete._id;
      await subscriptionsService.deletePlan(id);
      toast.showSuccess("Đã lưu trữ gói");
      setConfirmDelete(null);
      await fetchPlans();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Xóa/Lưu trữ gói thất bại");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (v) => {
    try {
      return Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch {
      return v;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý gói nâng cấp</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Tạo, chỉnh sửa, kích hoạt/vô hiệu hóa các gói nâng cấp.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchPlans}>
              Làm mới
            </Button>
            <Button onClick={openCreate}>Thêm gói</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-medium p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-medium overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600">Đang tải...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 font-medium">{error}</div>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-16 text-center text-gray-600">Chưa có gói nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên gói
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chu kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plans.map((p) => (
                    <tr key={p.id || p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{p.planName}</div>
                        {p.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{p.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {p.billingCycle === "Monthly" ? "Tháng" : "Năm"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
                            Đang hoạt động
                          </span>
                        ) : p.status === "Inactive" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            Tạm dừng
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-2 justify-end">
                          <Button size="small" variant="secondary" onClick={() => openEdit(p)}>
                            Sửa
                          </Button>
                          <Button size="small" variant="danger" onClick={() => setConfirmDelete(p)}>
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? "Chỉnh sửa gói" : "Thêm gói"}
        >
          <div className="space-y-4">
            <Input
              label="Tên gói"
              value={form.planName}
              onChange={(e) => setForm({ ...form, planName: e.target.value })}
              placeholder="Ví dụ: Basic, Pro, Premium"
            />
            <Input
              label="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn về gói"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chu kỳ</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.billingCycle}
                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
              >
                <option value="Monthly">Tháng</option>
                <option value="Yearly">Năm</option>
              </select>
            </div>
            <Input
              label="Giá (VND)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Tạm dừng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entitlements (JSON)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                rows={8}
                value={form.entitlementsText}
                onChange={(e) => setForm({ ...form, entitlementsText: e.target.value })}
              />
              <div className="text-xs text-gray-500 mt-1">
                Cần bao gồm: maxMonthlyTestGenerations, maxValidationRequests, priorityProcessing,
                shareLimits, maxSubjects
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          title="Xóa/Lưu trữ gói?"
        >
          <div className="space-y-4">
            <p>Bạn có chắc muốn xóa/lưu trữ gói "{confirmDelete?.planName}"?</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={saving}>
                Hủy
              </Button>
              <Button variant="danger" onClick={confirmArchive} disabled={saving}>
                {saving ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminSubscriptionPlansPage;
