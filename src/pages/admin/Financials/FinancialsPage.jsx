/**
 * Admin Financials Page
 * Shows monthly/year financial statistics: subscription revenue, commissions paid, net.
 */
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/common";
import { adminService } from "@/services/api";

function FinancialsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await adminService.getFinancials(year);
      setData(res);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải dữ liệu tài chính");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const months = data?.months || [];
  const totals = data?.totals || { subscriptionRevenue: 0, commissionsPaid: 0, net: 0 };

  const formatCurrency = (v) => {
    if (typeof v !== "number") return "0₫";
    return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const yearsOptions = useMemo(() => {
    const arr = [];
    for (let y = currentYear - 4; y <= currentYear + 1; y++) arr.push(y);
    return arr.reverse();
  }, [currentYear]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Doanh thu theo gói, chi hoa hồng chuyên gia và lợi nhuận ròng.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
            >
              {yearsOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setRefreshing(true);
                load();
              }}
              disabled={refreshing}
            >
              {refreshing ? "Đang làm mới..." : "Làm mới"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-error-200 bg-error-50 text-error-700 text-sm">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-medium p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Doanh thu gói</div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? "—" : formatCurrency(totals.subscriptionRevenue)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-medium p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Chi hoa hồng</div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? "—" : formatCurrency(totals.commissionsPaid)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-medium p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Lợi nhuận ròng</div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? "—" : formatCurrency(totals.net)}
            </div>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="bg-white rounded-xl shadow-medium overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Chi tiết theo tháng {year}</h2>
          </div>
          {loading ? (
            <div className="py-16 text-center text-gray-600">Đang tải...</div>
          ) : months.length === 0 ? (
            <div className="py-16 text-center text-gray-600">Không có dữ liệu</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tháng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu gói
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi hoa hồng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lợi nhuận ròng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {months.map((m) => {
                    const hasTx = (m.subscriptionRevenue || 0) > 0 || (m.commissionsPaid || 0) > 0;
                    return (
                      <tr key={m.month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {m.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {hasTx ? formatCurrency(m.subscriptionRevenue) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {hasTx ? formatCurrency(m.commissionsPaid) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {hasTx ? formatCurrency(m.net) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Placeholder for future charts */}
        <div className="bg-white rounded-xl shadow-medium p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ (sắp có)</h2>
          <div className="text-center py-10 text-gray-500 text-sm">
            Sẽ hiển thị biểu đồ cột / đường để trực quan hóa doanh thu.
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialsPage;
