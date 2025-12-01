/**
 * Admin Addon Packages Management Page
 * Quản lý các gói mua thêm (add-on) cho learner
 * Gói add-on không có thời hạn riêng, theo chu kỳ subscription hiện tại của learner
 */
import { useEffect, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import addonPackagesService from "@/services/api/addonPackages.service";

const DEFAULT_ADDON = {
  packageName: "",
  description: "",
  price: 0,
  additionalTestGenerations: 0,
  additionalValidationRequests: 0,
  packageType: "stackable",
  maxPurchasesPerUser: 0,
  displayOrder: 0,
  status: "Active",
};

function AdminAddonPackagesPage() {
  const toast = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_ADDON });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await addonPackagesService.getAllPackages({ 
        status: statusFilter || undefined 
      });
      const list = res?.packages || [];
      setPackages(list);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải gói add-on");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...DEFAULT_ADDON });
    setModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      packageName: pkg.packageName || "",
      description: pkg.description || "",
      price: pkg.price || 0,
      additionalTestGenerations: pkg.additionalTestGenerations || 0,
      additionalValidationRequests: pkg.additionalValidationRequests || 0,
      packageType: pkg.packageType || "stackable",
      maxPurchasesPerUser: pkg.maxPurchasesPerUser || 0,
      displayOrder: pkg.displayOrder || 0,
      status: pkg.status || "Active",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        packageName: form.packageName?.trim(),
        description: form.description?.trim(),
        price: Number(form.price) || 0,
        additionalTestGenerations: Number(form.additionalTestGenerations) || 0,
        additionalValidationRequests: Number(form.additionalValidationRequests) || 0,
        packageType: form.packageType,
        maxPurchasesPerUser: Number(form.maxPurchasesPerUser) || 0,
        displayOrder: Number(form.displayOrder) || 0,
        status: form.status,
      };

      if (!payload.packageName) {
        toast.showError("Tên gói không được để trống");
        return;
      }

      if (payload.additionalTestGenerations === 0 && payload.additionalValidationRequests === 0) {
        toast.showError("Gói cần có ít nhất 1 lượt tạo đề hoặc kiểm duyệt");
        return;
      }

      const id = editing?.id || editing?._id;
      if (id) {
        await addonPackagesService.updatePackage(id, payload);
        toast.showSuccess("Cập nhật gói thành công");
      } else {
        await addonPackagesService.createPackage(payload);
        toast.showSuccess("Tạo gói mới thành công");
      }
      setModalOpen(false);
      setEditing(null);
      await fetchPackages();
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
      await addonPackagesService.deletePackage(id, true);
      toast.showSuccess("Đã vô hiệu hóa gói");
      setConfirmDelete(null);
      await fetchPackages();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Xóa gói thất bại");
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Quản lý gói mua thêm (Add-on)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              Tạo, chỉnh sửa các gói cộng dồn lượt tạo đề và kiểm duyệt. Gói add-on sẽ có hiệu lực theo chu kỳ gói hiện tại của learner.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={fetchPackages}>
              Làm mới
            </Button>
            <Button className="w-full sm:w-auto" onClick={openCreate}>Thêm gói</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
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

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-red-400 font-medium">{error}</div>
            </div>
          ) : packages.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">
              Chưa có gói add-on nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tên gói
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lượt tạo đề
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lượt kiểm duyệt
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-3 sm:px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {packages.map((pkg) => (
                    <tr key={pkg.id || pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {pkg.packageName}
                        </div>
                        {pkg.description && (
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {pkg.description}
                          </div>
                        )}
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatPrice(pkg.price)}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {formatPrice(pkg.price)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {pkg.additionalTestGenerations > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            +{pkg.additionalTestGenerations} lượt
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        {pkg.additionalValidationRequests > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            +{pkg.additionalValidationRequests} lượt
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        {pkg.status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            Tạm dừng
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          <Button size="small" variant="secondary" onClick={() => openEdit(pkg)}>
                            <span className="hidden sm:inline">Sửa</span>
                            <span className="sm:hidden">✏️</span>
                          </Button>
                          <Button size="small" variant="danger" onClick={() => setConfirmDelete(pkg)}>
                            <span className="hidden sm:inline">Xóa</span>
                            <span className="sm:hidden">🗑️</span>
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
          title={editing ? "Chỉnh sửa gói add-on" : "Thêm gói add-on"}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Input
              label="Tên gói"
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              placeholder="Ví dụ: Thêm 3 lượt tạo đề"
            />
            <Input
              label="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn về gói"
            />
            <Input
              label="Giá (VND)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              min="0"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số lượt tạo đề thêm"
                type="number"
                value={form.additionalTestGenerations}
                onChange={(e) => setForm({ ...form, additionalTestGenerations: e.target.value })}
                min="0"
              />
              <Input
                label="Số lượt kiểm duyệt thêm"
                type="number"
                value={form.additionalValidationRequests}
                onChange={(e) => setForm({ ...form, additionalValidationRequests: e.target.value })}
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loại gói
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.packageType}
                  onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                >
                  <option value="stackable">Mua nhiều lần</option>
                  <option value="one-time">Mua 1 lần</option>
                </select>
              </div>
              <Input
                label="Giới hạn mua/user (0 = không giới hạn)"
                type="number"
                value={form.maxPurchasesPerUser}
                onChange={(e) => setForm({ ...form, maxPurchasesPerUser: e.target.value })}
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Thứ tự hiển thị"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                min="0"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Đang hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
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
          title="Vô hiệu hóa gói?"
        >
          <div className="space-y-4">
            <p className="dark:text-gray-300">
              Bạn có chắc muốn vô hiệu hóa gói "<strong>{confirmDelete?.packageName}</strong>"?
              <br />
              <span className="text-sm text-gray-500">
                Người dùng đã mua sẽ vẫn sử dụng được quota còn lại.
              </span>
            </p>
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

export default AdminAddonPackagesPage;
