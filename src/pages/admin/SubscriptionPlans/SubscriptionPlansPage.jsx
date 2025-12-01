/**
 * Admin Subscription Plans Management Page
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import subscriptionsService from "@/services/api/subscriptions.service";

const DEFAULT_ENTITLEMENTS = {
  maxMonthlyTestGenerations: 50,
  maxValidationRequests: 30,
  priorityProcessing: false,
  canShare: false,
  maxSubjects: 10,
};

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
    entitlements: DEFAULT_ENTITLEMENTS,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const formatEntitlementLabel = (key) => {
    const labels = {
      maxSubjects: "Số môn học",
      maxMonthlyTestGenerations: "Số lần tạo đề/tháng",
      maxValidationRequests: "Số yêu cầu kiểm duyệt",
      priorityProcessing: "Xử lý ưu tiên",
      canShare: "Cho phép chia sẻ",
    };
    return labels[key] || key;
  };

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
      entitlements: { ...DEFAULT_ENTITLEMENTS },
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
      entitlements:
        p && p.entitlements && Object.keys(p.entitlements || {}).length > 0
          ? { ...p.entitlements }
          : { ...DEFAULT_ENTITLEMENTS },
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        planName: form.planName?.trim(),
        description: form.description?.trim(),
        billingCycle: form.billingCycle,
        price: Number(form.price) || 0,
        status: form.status,
        entitlements: form.entitlements,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý gói nâng cấp</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-red-400 font-medium">{error}</div>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Chưa có gói nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tên gói
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Chu kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {plans.map((p) => (
                    <tr key={p.id || p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{p.planName}</div>
                        {p.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{p.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {p.billingCycle === "Monthly" ? "Tháng" : "Năm"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                            Đang hoạt động
                          </span>
                        ) : p.status === "Inactive" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            Tạm dừng
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-yellow-900/30 text-warning-700 dark:text-yellow-300">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chu kỳ</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Tạm dừng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Quyền lợi gói đăng ký
              </label>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                {/* maxMonthlyTestGenerations */}
                <Input
                  label={formatEntitlementLabel("maxMonthlyTestGenerations")}
                  type="number"
                  value={form.entitlements.maxMonthlyTestGenerations}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entitlements: {
                        ...form.entitlements,
                        maxMonthlyTestGenerations: Number(e.target.value),
                      },
                    })
                  }
                />

                {/* maxValidationRequests */}
                <Input
                  label={formatEntitlementLabel("maxValidationRequests")}
                  type="number"
                  value={form.entitlements.maxValidationRequests}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entitlements: {
                        ...form.entitlements,
                        maxValidationRequests: Number(e.target.value),
                      },
                    })
                  }
                />

                {/* maxSubjects */}
                <Input
                  label={formatEntitlementLabel("maxSubjects")}
                  type="number"
                  value={form.entitlements.maxSubjects}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entitlements: {
                        ...form.entitlements,
                        maxSubjects: Number(e.target.value),
                      },
                    })
                  }
                />

                {/* priorityProcessing */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.entitlements.priorityProcessing}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          entitlements: {
                            ...form.entitlements,
                            priorityProcessing: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatEntitlementLabel("priorityProcessing")}
                    </span>
                  </label>
                </div>

                {/* canShare */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.entitlements.canShare || false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          entitlements: {
                            ...form.entitlements,
                            canShare: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatEntitlementLabel("canShare")}
                    </span>
                  </label>
                </div>
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
            <p className="dark:text-gray-300">Bạn có chắc muốn xóa/lưu trữ gói "{confirmDelete?.planName}"?</p>
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
