import { useState, useEffect } from "react";
import { bankAccountsService } from "../../../services/api";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";

const BankAccountsPage = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [page, statusFilter]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      
      const data = await bankAccountsService.getAllBankAccounts(params);
      console.log("Bank accounts data:", data);
      setAccounts(data.accounts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch bank accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (account) => {
    if (!window.confirm(`Xác nhận xác minh tài khoản ngân hàng của ${account.expertId?.name}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await bankAccountsService.verifyBankAccount(account._id || account.id);
      alert("Xác minh tài khoản ngân hàng thành công");
      fetchAccounts();
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi xác minh tài khoản");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (account) => {
    setSelectedAccount(account);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setActionLoading(true);
      await bankAccountsService.rejectBankAccount(
        selectedAccount._id || selectedAccount.id,
        rejectionReason
      );
      alert("Từ chối tài khoản ngân hàng thành công");
      setRejectModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi từ chối tài khoản");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          Chờ xác minh
        </span>
      ),
      Verified: (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
          Đã xác minh
        </span>
      ),
      Rejected: (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Bị từ chối
        </span>
      ),
    };
    return badges[status] || null;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quản lý tài khoản ngân hàng
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Xác minh tài khoản ngân hàng của chuyên gia
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Pending">Chờ xác minh</option>
              <option value="Verified">Đã xác minh</option>
              <option value="Rejected">Bị từ chối</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-gray-500">Đang tải...</div>
          ) : accounts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Chuyên gia
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Chủ tài khoản
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Số tài khoản
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Ngân hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accounts.map((account) => (
                      <tr key={account._id || account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.expertId?.name || account.expertId?.email || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {account.expertId?.email || ""}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {account.accountHolderName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {account.accountNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {account.bankName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(account.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {account.status === "Pending" && (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="small"
                                variant="success"
                                onClick={() => handleVerify(account)}
                                disabled={actionLoading}
                              >
                                Xác minh
                              </Button>
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => openRejectModal(account)}
                                disabled={actionLoading}
                              >
                                Từ chối
                              </Button>
                            </div>
                          )}
                          {account.status === "Rejected" && account.rejectionReason && (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {account.rejectionReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Trang {page} / {totalPages} ({total} tài khoản)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ chối tài khoản ngân hàng"
        onConfirm={handleReject}
        confirmText="Từ chối"
        confirmVariant="danger"
        loading={actionLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bạn đang từ chối tài khoản ngân hàng của{" "}
            <strong>{selectedAccount?.expertId?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lý do từ chối *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BankAccountsPage;
