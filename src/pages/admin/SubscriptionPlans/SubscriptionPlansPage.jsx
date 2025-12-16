/**
 * Admin Subscription Plans Management Page
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import subscriptionsService from "@/services/api/subscriptions.service";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_ENTITLEMENTS = {
  maxMonthlyTestGenerations: 50,
  maxValidationRequests: 30,
  priorityProcessing: false,
  canShare: false,
  maxSubjects: 10,
  maxDocumentsPerSubject: 20,
  // maxTotalDocuments: 100, // Removed - now unlimited
};

function AdminSubscriptionPlansPage() {
  const toast = useToast();
  const { t } = useLanguage();
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
      maxSubjects: t("admin.subscriptionPlans.maxSubjects"),
      maxMonthlyTestGenerations: t("admin.subscriptionPlans.maxMonthlyTestGenerations"),
      maxValidationRequests: t("admin.subscriptionPlans.maxValidationRequests"),
      priorityProcessing: t("admin.subscriptionPlans.priorityProcessing"),
      canShare: t("admin.subscriptionPlans.canShare"),
      maxDocumentsPerSubject: t("admin.subscriptionPlans.maxDocumentsPerSubject"),
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
      setError(e?.response?.data?.message || t("admin.subscriptionPlans.loadError"));
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
        toast.showError(t("admin.subscriptionPlans.nameRequired"));
        return;
      }

      if (editing?.id) {
        await subscriptionsService.updatePlan(editing.id, payload);
        toast.showSuccess(t("admin.subscriptionPlans.updateSuccess"));
      } else if (editing?._id) {
        await subscriptionsService.updatePlan(editing._id, payload);
        toast.showSuccess(t("admin.subscriptionPlans.updateSuccess"));
      } else {
        await subscriptionsService.createPlan(payload);
        toast.showSuccess(t("admin.subscriptionPlans.createSuccess"));
      }
      setModalOpen(false);
      setEditing(null);
      await fetchPlans();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || t("admin.subscriptionPlans.saveError"));
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
      toast.showSuccess(t("admin.subscriptionPlans.archiveSuccess"));
      setConfirmDelete(null);
      await fetchPlans();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || t("admin.subscriptionPlans.archiveError"));
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("admin.subscriptionPlans.pageTitle")}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              {t("admin.subscriptionPlans.pageSubtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={fetchPlans}>
              {t("admin.common.refresh")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={openCreate}>{t("admin.subscriptionPlans.addPlan")}</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium border border-gray-200 dark:border-slate-700 p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t("admin.common.status")}</label>
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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium border border-gray-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">{t("admin.common.loading")}</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-red-400 font-medium">{error}</div>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">{t("admin.subscriptionPlans.noPlan")}</div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block sm:hidden divide-y divide-gray-200 dark:divide-slate-700">
                {plans.map((p) => (
                  <div key={p.id || p._id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{p.planName}</div>
                        {p.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{p.description}</div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button size="small" variant="secondary" onClick={() => openEdit(p)}>✏️</Button>
                        <Button size="small" variant="danger" onClick={() => setConfirmDelete(p)}>🗑️</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatPrice(p.price)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {p.billingCycle === "Monthly" ? t("admin.subscriptionPlans.monthly") : t("admin.subscriptionPlans.yearly")}
                      </span>
                      {p.status === "Active" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                          {t("admin.common.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                          {t("admin.common.inactive")}
                        </span>
                      )}
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
                      {t("admin.subscriptionPlans.planName")}
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.subscriptionPlans.billingCycle")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.subscriptionPlans.price")}
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.common.status")}
                    </th>
                    <th className="px-3 sm:px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {plans.map((p) => (
                    <tr key={p.id || p._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{p.planName}</div>
                        {p.description && (
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{p.description}</div>
                        )}
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {p.billingCycle === "Monthly" ? t("admin.subscriptionPlans.monthly") : t("admin.subscriptionPlans.yearly")}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {p.billingCycle === "Monthly" ? t("admin.subscriptionPlans.monthly") : t("admin.subscriptionPlans.yearly")}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        {formatPrice(p.price)}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        {p.status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                            {t("admin.common.active")}
                          </span>
                        ) : p.status === "Inactive" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                            {t("admin.common.inactive")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-yellow-900/30 text-warning-700 dark:text-yellow-300">
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          <Button size="small" variant="secondary" onClick={() => openEdit(p)}>
                            <span className="hidden sm:inline">{t("admin.common.edit")}</span>
                            <span className="sm:hidden">✏️</span>
                          </Button>
                          <Button size="small" variant="danger" onClick={() => setConfirmDelete(p)}>
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
          title={editing ? t("admin.subscriptionPlans.editPlan") : t("admin.subscriptionPlans.addNewPlan")}
        >
          <div className="space-y-4">
            <Input
              label={t("admin.subscriptionPlans.planName")}
              value={form.planName}
              onChange={(e) => setForm({ ...form, planName: e.target.value })}
              placeholder={t("admin.subscriptionPlans.planNamePlaceholder")}
            />
            <Input
              label={t("admin.subscriptionPlans.description")}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("admin.subscriptionPlans.descriptionPlaceholder")}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("admin.subscriptionPlans.billingCycle")}</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.billingCycle}
                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
              >
                <option value="Monthly">{t("admin.subscriptionPlans.monthly")}</option>
                <option value="Yearly">{t("admin.subscriptionPlans.yearly")}</option>
              </select>
            </div>
            <Input
              label={t("admin.subscriptionPlans.priceVND")}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("admin.common.status")}</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">{t("admin.common.active")}</option>
                <option value="Inactive">{t("admin.common.inactive")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                {t("admin.subscriptionPlans.entitlements")}
              </label>
              <div className="space-y-4 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
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

                {/* maxDocumentsPerSubject */}
                <Input
                  label={formatEntitlementLabel("maxDocumentsPerSubject")}
                  type="number"
                  value={form.entitlements.maxDocumentsPerSubject || 20}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entitlements: {
                        ...form.entitlements,
                        maxDocumentsPerSubject: Number(e.target.value),
                      },
                    })
                  }
                />

                {/* maxTotalDocuments - REMOVED (now unlimited)
                <Input
                  label={formatEntitlementLabel("maxTotalDocuments")}
                  type="number"
                  value={form.entitlements.maxTotalDocuments || 100}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entitlements: {
                        ...form.entitlements,
                        maxTotalDocuments: Number(e.target.value),
                      },
                    })
                  }
                />
                */}

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
          title={t("admin.subscriptionPlans.confirmArchiveTitle")}
        >
          <div className="space-y-4">
            <p className="dark:text-gray-300">{t("admin.subscriptionPlans.confirmArchiveMessage", { name: confirmDelete?.planName })}</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={saving}>
                {t("admin.common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmArchive} disabled={saving}>
                {saving ? t("admin.common.loading") : t("admin.subscriptionPlans.confirmArchive")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminSubscriptionPlansPage;
