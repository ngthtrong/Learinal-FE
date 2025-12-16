/**
 * Admin Addon Packages Management Page
 * Quản lý các gói mua thêm (add-on) cho learner
 * Gói add-on không có thời hạn riêng, theo chu kỳ subscription hiện tại của learner
 */
import { useEffect, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import addonPackagesService from "@/services/api/addonPackages.service";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_ADDON = {
  packageName: "",
  description: "",
  price: 0,
  additionalTestGenerations: 0,
  additionalValidationRequests: 0,
  // additionalDocumentUploads: 0, // Removed - now unlimited
  packageType: "stackable",
  maxPurchasesPerUser: 0,
  displayOrder: 0,
  status: "Active",
};

function AdminAddonPackagesPage() {
  const toast = useToast();
  const { t } = useLanguage();
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
      setError(e?.response?.data?.message || t("admin.addonPackages.loadError"));
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
      // additionalDocumentUploads: pkg.additionalDocumentUploads || 0, // Removed - now unlimited
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
        // additionalDocumentUploads: Number(form.additionalDocumentUploads) || 0, // Removed - now unlimited
        packageType: form.packageType,
        maxPurchasesPerUser: Number(form.maxPurchasesPerUser) || 0,
        displayOrder: Number(form.displayOrder) || 0,
        status: form.status,
      };

      if (!payload.packageName) {
        toast.showError(t("admin.addonPackages.nameRequired"));
        return;
      }

      if (payload.additionalTestGenerations === 0 && payload.additionalValidationRequests === 0) {
        toast.showError(t("admin.addonPackages.needAtLeastOne"));
        return;
      }

      const id = editing?.id || editing?._id;
      if (id) {
        await addonPackagesService.updatePackage(id, payload);
        toast.showSuccess(t("admin.addonPackages.updateSuccess"));
      } else {
        await addonPackagesService.createPackage(payload);
        toast.showSuccess(t("admin.addonPackages.createSuccess"));
      }
      setModalOpen(false);
      setEditing(null);
      await fetchPackages();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || t("admin.addonPackages.saveError"));
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
      toast.showSuccess(t("admin.addonPackages.archiveSuccess"));
      setConfirmDelete(null);
      await fetchPackages();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || t("admin.addonPackages.archiveError"));
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
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("admin.addonPackages.pageTitle")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              {t("admin.addonPackages.pageSubtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={fetchPackages}>
              {t("admin.common.refresh")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={openCreate}>{t("admin.addonPackages.addPackage")}</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium border border-gray-200 dark:border-slate-700 p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t("admin.common.status")}
              </label>
              <select
                className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">{t("admin.common.all")}</option>
                <option value="Active">{t("admin.common.active")}</option>
                <option value="Inactive">{t("admin.common.inactive")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium border border-gray-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">{t("admin.common.loading")}</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-red-400 font-medium">{error}</div>
            </div>
          ) : packages.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">
              {t("admin.addonPackages.noPackage")}
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block sm:hidden divide-y divide-gray-200 dark:divide-slate-700">
                {packages.map((pkg) => (
                  <div key={pkg.id || pkg._id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{pkg.packageName}</div>
                        {pkg.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{pkg.description}</div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button size="small" variant="secondary" onClick={() => openEdit(pkg)}>✏️</Button>
                        <Button size="small" variant="danger" onClick={() => setConfirmDelete(pkg)}>🗑️</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatPrice(pkg.price)}
                      </span>
                      {pkg.status === "Active" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                          {t("admin.common.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                          {t("admin.common.inactive")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pkg.additionalTestGenerations > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {t("admin.addonPackages.plusGenerations", { count: pkg.additionalTestGenerations })}
                        </span>
                      )}
                      {pkg.additionalValidationRequests > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {t("admin.addonPackages.plusValidations", { count: pkg.additionalValidationRequests })}
                        </span>
                      )}
                      {/* additionalDocumentUploads removed - now unlimited */}
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.addonPackages.packageName")}
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.addonPackages.price")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.addonPackages.testGenerations")}
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.addonPackages.validationRequests")}
                    </th>
                    {/* Lượt tài liệu column removed - now unlimited */}
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.common.status")}
                    </th>
                    <th className="px-3 sm:px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {packages.map((pkg) => (
                    <tr key={pkg.id || pkg._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
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
                            {t("admin.addonPackages.plusTimes", { count: pkg.additionalTestGenerations })}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        {pkg.additionalValidationRequests > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {t("admin.addonPackages.plusTimes", { count: pkg.additionalValidationRequests })}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {/* additionalDocumentUploads cell removed - now unlimited */}
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        {pkg.status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                            {t("admin.common.active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                            {t("admin.common.inactive")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          <Button size="small" variant="secondary" onClick={() => openEdit(pkg)}>
                            <span className="hidden sm:inline">{t("admin.common.edit")}</span>
                            <span className="sm:hidden">✏️</span>
                          </Button>
                          <Button size="small" variant="danger" onClick={() => setConfirmDelete(pkg)}>
                            <span className="hidden sm:inline">{t("admin.common.delete")}</span>
                            <span className="sm:hidden">🗑️</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* Create / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? t("admin.addonPackages.editPackage") : t("admin.addonPackages.addNewPackage")}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Input
              label={t("admin.addonPackages.packageName")}
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              placeholder=""
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.addonPackages.description")}
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder=""
                rows={3}
              />
            </div>
            <Input
              label={t("admin.subscriptionPlans.priceVND")}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              min="0"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("admin.addonPackages.testGenerations")}
                type="number"
                value={form.additionalTestGenerations}
                onChange={(e) => setForm({ ...form, additionalTestGenerations: e.target.value })}
                min="0"
              />
              <Input
                label={t("admin.addonPackages.validationRequests")}
                type="number"
                value={form.additionalValidationRequests}
                onChange={(e) => setForm({ ...form, additionalValidationRequests: e.target.value })}
                min="0"
              />
            </div>

            {/* additionalDocumentUploads input removed - now unlimited */}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("admin.addonPackages.maxPurchases")}
                type="number"
                value={form.maxPurchasesPerUser}
                onChange={(e) => setForm({ ...form, maxPurchasesPerUser: e.target.value })}
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("admin.addonPackages.displayOrder")}
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("admin.addonPackages.packageType")}
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.packageType}
                  onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                >
                  <option value="stackable">{t("admin.addonPackages.stackable")}</option>
                  <option value="one-time">{t("admin.addonPackages.oneTime")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("admin.common.status")}
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">{t("admin.common.active")}</option>
                  <option value="Inactive">{t("admin.common.inactive")}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                {t("admin.common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t("admin.common.loading") : t("admin.common.save")}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm */}
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          title={t("admin.addonPackages.confirmArchiveTitle")}
        >
          <div className="space-y-4">
            <p className="dark:text-gray-300">
              {t("admin.addonPackages.confirmArchiveMessage", { name: confirmDelete?.packageName })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={saving}>
                {t("admin.common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmArchive} disabled={saving}>
                {saving ? t("admin.common.loading") : t("admin.addonPackages.confirmArchive")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminAddonPackagesPage;
