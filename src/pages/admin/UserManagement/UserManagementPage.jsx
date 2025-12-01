/**
 * User Management Page
 * Manage users, roles, and permissions (admin)
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import { adminService } from "@/services/api";

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả vai trò" },
  { value: "Learner", label: "Learner" },
  { value: "Expert", label: "Expert" },
  { value: "Admin", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Active", label: "Hoạt động" },
  { value: "Banned", label: "Khóa" },
];

function UserManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState("Learner");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const debouncedQuery = useDebounce(q, 300);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        pageSize,
        q: debouncedQuery || undefined,
        role: role || undefined,
        status: status || undefined,
      };
      const data = await adminService.listUsers(params);
      const items = data?.users ?? [];
      setUsers(items);
      setTotal(data?.pagination?.total ?? items.length);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedQuery, role, status]);

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditRole(user?.role || "Learner");
    setEditActive((user?.status || "Active") === "Active");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedUser(null);
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const id = selectedUser.id || selectedUser._id;

      // Change role if modified
      if (editRole && editRole !== selectedUser.role) {
        await adminService.changeRole(id, editRole);
      }

      // Toggle status if modified
      const wasActive = (selectedUser.status || "Active") === "Active";
      if (editActive !== wasActive) {
        if (editActive) {
          await adminService.activateUser(id);
        } else {
          await adminService.banUser(id);
        }
      }

      toast.showSuccess("Cập nhật người dùng thành công");
      closeEdit();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.showError(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (s) => {
    try {
      return new Date(s).toLocaleString("vi-VN");
    } catch {
      return "-";
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý người dùng</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Tìm kiếm, lọc theo vai trò và trạng thái.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setQ("");
                setRole("");
                setStatus("");
                setPage(1);
              }}
            >
              Đặt lại
            </Button>
            <Button onClick={fetchUsers}>Làm mới</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                label="Tìm kiếm"
                placeholder="Tên, email..."
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                inputClassName="py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={role}
                onChange={(e) => {
                  setPage(1);
                  setRole(e.target.value);
                }}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => {
                  setPage(1);
                  fetchUsers();
                }}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-error-400 font-medium">{error}</div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Không có người dùng</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tạo lúc
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {u.fullName || u.name || "(Không tên)"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700 dark:text-gray-300">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const role = u.role || "Learner";
                          const meta = {
                            Learner: { label: "Learner", className: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
                            Expert: { label: "Expert", className: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
                            Admin: { label: "Admin", className: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
                          }[role] || { label: role, className: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" };
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">
                            Hoạt động
                          </span>
                        ) : u.status === "Banned" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400">
                            Khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {u.status || "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-2 justify-end">
                          <Button variant="secondary" size="small" onClick={() => openEdit(u)}>
                            Sửa
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {users.length} / {total} người dùng
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Trước
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {page}/{totalPages}
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={editOpen}
          onClose={closeEdit}
          title="Chỉnh sửa người dùng"
          onConfirm={saveEdit}
          confirmText="Lưu"
          cancelText="Hủy"
          loading={saving}
        >
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  {selectedUser.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  {ROLE_OPTIONS.filter((o) => o.value !== "").map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bật để kích hoạt, tắt để khóa</div>
                </div>
                <button
                  type="button"
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editActive ? "bg-primary-600 dark:bg-primary-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={() => setEditActive((v) => !v)}
                  aria-label="Toggle active"
                  role="switch"
                  aria-checked={editActive}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      editActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

// Small debounce hook to align with app style without extra deps
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default UserManagementPage;
