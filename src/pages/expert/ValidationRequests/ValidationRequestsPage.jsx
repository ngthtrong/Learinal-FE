/**
 * ValidationRequestsPage (Expert)
 * Quản lý các yêu cầu kiểm duyệt được gán cho chuyên gia.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal } from "@/components/common";
import { validationRequestsService } from "@/services/api";

const PAGE_SIZES = [10, 20, 50];

function ValidationRequestsPage() {
  const [items, setItems] = useState([]);
  const available = useMemo(() => items.filter(r => r.status === 'PendingAssignment'), [items]);
  const mineActive = useMemo(() => items.filter(r => r.status === 'Assigned'), [items]);
  const mineHistory = useMemo(() => items.filter(r => r.status === 'Completed'), [items]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Complete modal
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decision, setDecision] = useState("Approved");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await validationRequestsService.list({
        page,
        pageSize,
        status: status || undefined,
        q: debouncedSearch || undefined,
      });
      const list = data?.data || data?.items || [];
      setItems((list || []).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)));
      setTotal(data?.meta?.total || list.length);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải yêu cầu kiểm duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status, debouncedSearch]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const openComplete = (req) => {
    setSelectedRequest(req);
    setDecision("Approved");
    setFeedback("");
    setCompleteOpen(true);
  };
  const closeComplete = () => {
    setCompleteOpen(false);
    setSelectedRequest(null);
  };

  const submitComplete = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      await validationRequestsService.complete(selectedRequest.id, {
        decision,
        feedback: feedback || undefined,
      });
      closeComplete();
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yêu cầu kiểm duyệt</h1>
            <p className="text-gray-500 mt-1 text-sm">Xử lý các bộ câu hỏi được gán cho bạn.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchData();
              }}
            >
              Làm mới
            </Button>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-medium p-4 flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Tìm kiếm"
                placeholder="Nhập từ khóa..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                inputClassName="py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả</option>
                <option value="PendingAssignment">Chờ gán</option>
                <option value="Assigned">Đã gán</option>
                <option value="Completed">Hoàn thành</option>
                {/* Removed Rejected status: decision stored separately */}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setStatus("");
                setSearch("");
                setPage(1);
                fetchData();
              }}
            >
              Đặt lại
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                fetchData();
              }}
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Available requests */}
          <div className="bg-white rounded-xl shadow-medium overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Yêu cầu chờ nhận</h2>
              <span className="text-sm text-gray-500">{available.length} yêu cầu</span>
            </div>
            {loading ? (
              <div className="py-10 text-center text-gray-600">Đang tải...</div>
            ) : error ? (
              <div className="py-10 text-center">
                <div className="text-error-600 font-medium">{error}</div>
              </div>
            ) : available.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Không có yêu cầu chờ nhận</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bộ câu hỏi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo lúc</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {available.map((r) => (
                      <tr key={r.id || r._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{r.questionSetTitle || r.questionSetName || r.questionSetId || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {r.learnerName || r.creatorName || r.userName || r.userId || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Chờ gán</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          try {
                            return new Date(r.createdAt).toLocaleString("vi-VN");
                          } catch {
                            return "-";
                          }
                        })()}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button size="small" onClick={async () => { await validationRequestsService.claim(r.id); fetchData(); }}>Nhận xử lý</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* My claimed requests */}
          <div className="bg-white rounded-xl shadow-medium overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Yêu cầu của tôi</h2>
              <span className="text-sm text-gray-500">{mineActive.length} yêu cầu đang xử lý</span>
            </div>
            {loading ? (
              <div className="py-10 text-center text-gray-600">Đang tải...</div>
            ) : mineActive.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Chưa có yêu cầu nào được nhận</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bộ câu hỏi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhận lúc</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mineActive.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{r.questionSetTitle || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.learnerName || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Đang xử lý</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.claimedAt ? new Date(r.claimedAt).toLocaleString('vi-VN') : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex gap-2 justify-end">
                            <Button size="small" variant="secondary" onClick={() => navigate(`/expert/validation-requests/${r.id}`)}>Chi tiết</Button>
                            <Button size="small" onClick={() => openComplete(r)}>Hoàn thành</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* My history requests */}
          <div className="bg-white rounded-xl shadow-medium overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Lịch sử kiểm duyệt</h2>
              <span className="text-sm text-gray-500">{mineHistory.length} đã hoàn tất</span>
            </div>
            {loading ? (
              <div className="py-10 text-center text-gray-600">Đang tải...</div>
            ) : mineHistory.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Chưa có kiểm duyệt nào hoàn tất</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bộ câu hỏi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết quả</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoàn thành</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mineHistory.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{r.questionSetTitle || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.learnerName || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {r.decision === 'Approved' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Phê duyệt</span>
                          )}
                          {r.decision === 'Rejected' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Từ chối</span>
                          )}
                          {!r.decision && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.completionTime ? new Date(r.completionTime).toLocaleString('vi-VN') : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button size="small" variant="secondary" onClick={() => navigate(`/expert/validation-requests/${r.id}`)}>Xem lại</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Hiển thị {items.length} / {total} yêu cầu (bao gồm lịch sử)</div>
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}/trang</option>
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
            <div className="text-sm text-gray-700">{page}/{totalPages}</div>
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

        <Modal
          isOpen={completeOpen}
          onClose={closeComplete}
          title="Hoàn thành kiểm duyệt"
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={submitComplete}
          loading={saving}
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="text-sm text-gray-700">
                Hoàn thành request <span className="font-medium">#{selectedRequest.id || selectedRequest._id}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quyết định</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                >
                  <option value="Approved">Phê duyệt</option>
                  <option value="Rejected">Từ chối</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phản hồi (tùy chọn)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-y min-h-[100px]"
                  placeholder="Nhận xét của bạn..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Sau khi xác nhận, trạng thái sẽ cập nhật và thông báo được gửi tới người tạo.</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default ValidationRequestsPage;
