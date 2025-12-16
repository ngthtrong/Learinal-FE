/**
 * Admin Financials Page
 * Shows monthly/year financial statistics: subscription revenue, commissions paid, net.
 */
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/common";
import { adminService } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function FinancialsPage() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [filterMode, setFilterMode] = useState("year"); // "year" or "dateRange"
  const [year, setYear] = useState(currentYear);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      
      const params = {};
      if (filterMode === "year") {
        params.year = year;
      } else {
        if (!startDate || !endDate) {
          setError(t("admin.financials.selectDateRange"));
          setLoading(false);
          return;
        }
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const res = await adminService.getFinancials(params);
      setData(res);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || t("admin.financials.cannotLoadData"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, filterMode]);

  const months = data?.periods || data?.months || [];
  const totals = data?.totals || { subscriptionRevenue: 0, commissionsPaid: 0, net: 0 };
  const groupBy = data?.groupBy || 'month';

  const formatCurrency = (v) => {
    if (typeof v !== "number") return "0₫";
    return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const formatMonthLabel = (m) => {
    if (groupBy === 'day') {
      return `${m.day}/${m.month}`;
    }
    if (m.year) {
      return language === "vi" ? `Tháng ${m.month}/${m.year}` : `${m.month}/${m.year}`;
    }
    return language === "vi" ? `Tháng ${m.month}` : `Month ${m.month}`;
  };

  const getPeriodLabel = () => {
    if (groupBy === 'day') {
      return t("admin.financials.day");
    }
    return t("admin.financials.month");
  };

  const yearsOptions = useMemo(() => {
    const arr = [];
    for (let y = currentYear - 4; y <= currentYear + 1; y++) arr.push(y);
    return arr.reverse();
  }, [currentYear]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("admin.financials.title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              {t("admin.financials.subtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            {/* Filter Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filterMode === "year"
                    ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
                onClick={() => setFilterMode("year")}
              >
                {t("admin.financials.byYear")}
              </button>
              <button
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filterMode === "dateRange"
                    ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
                onClick={() => setFilterMode("dateRange")}
              >
                {t("admin.financials.byRange")}
              </button>
            </div>

            {/* Year Selector */}
            {filterMode === "year" && (
              <select
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              >
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}

            {/* Date Range Selectors */}
            {filterMode === "dateRange" && (
              <>
                <input
                  type="date"
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Từ ngày"
                />
                <input
                  type="date"
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Đến ngày"
                />
                <Button
                  onClick={() => load()}
                  disabled={!startDate || !endDate || refreshing}
                  className="w-full sm:w-auto"
                >
                  {t("admin.common.apply")}
                </Button>
              </>
            )}

            <Button
              onClick={() => {
                setRefreshing(true);
                load();
              }}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              {refreshing ? t("admin.dashboardPage.refreshing") : t("admin.common.refresh")}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 text-sm">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 sm:p-5 border border-gray-100 dark:border-slate-700">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t("admin.financials.subscriptionRevenue")}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? "—" : formatCurrency(totals.subscriptionRevenue)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 sm:p-5 border border-gray-100 dark:border-slate-700">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t("admin.financials.commissionExpense")}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? "—" : formatCurrency(totals.commissionsPaid)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 sm:p-5 border border-gray-100 dark:border-slate-700">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{t("admin.financials.netProfit")}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? "—" : formatCurrency(totals.net)}
            </div>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
              {t("admin.financials.detailBy", { period: getPeriodLabel() })} {filterMode === "year" ? year : t("admin.financials.selectedRange")}
            </h2>
          </div>
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">{t("admin.common.loading")}</div>
          ) : months.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">{t("admin.common.noData")}</div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block sm:hidden divide-y divide-gray-200 dark:divide-slate-700">
                {months.map((m, idx) => {
                  const hasTx = (m.subscriptionRevenue || 0) > 0 || (m.commissionsPaid || 0) > 0;
                  return (
                    <div key={`${m.year}-${m.month}-${m.day || 0}-${idx}`} className="p-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {formatMonthLabel(m)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t("admin.financials.revenue")}</div>
                          <div className="text-gray-700 dark:text-gray-300">
                            {hasTx ? formatCurrency(m.subscriptionRevenue) : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t("admin.financials.commission")}</div>
                          <div className="text-gray-700 dark:text-gray-300">
                            {hasTx ? formatCurrency(m.commissionsPaid) : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t("admin.financials.profit")}</div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {hasTx ? formatCurrency(m.net) : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {groupBy === 'day' ? t("admin.financials.day") : t("admin.financials.month")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("admin.financials.subscriptionRevenue")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("admin.financials.commissionExpense")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("admin.financials.netProfit")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {months.map((m, idx) => {
                    const hasTx = (m.subscriptionRevenue || 0) > 0 || (m.commissionsPaid || 0) > 0;
                    return (
                      <tr key={`${m.year}-${m.month}-${m.day || 0}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                          {formatMonthLabel(m)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {hasTx ? formatCurrency(m.subscriptionRevenue) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {hasTx ? formatCurrency(m.commissionsPaid) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">
                          {hasTx ? formatCurrency(m.net) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* Charts */}
        {!loading && months.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Revenue vs Commission */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t("admin.financials.revenueAndCommission")}</h2>
              <Bar
                data={{
                  labels: months.map((m) => formatMonthLabel(m)),
                  datasets: [
                    {
                      label: t("admin.financials.subscriptionRevenue"),
                      data: months.map((m) => m.subscriptionRevenue / 1000000), // Convert to millions
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                      borderColor: "rgba(59, 130, 246, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: t("admin.financials.commissionExpense"),
                      data: months.map((m) => m.commissionsPaid / 1000000),
                      backgroundColor: "rgba(245, 158, 11, 0.8)",
                      borderColor: "rgba(245, 158, 11, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          label += (context.parsed.y * 1000000).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          });
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return value.toLocaleString("vi-VN") + " triệu";
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Line Chart - Net Profit Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t("admin.financials.netProfitTrend")}</h2>
              <Line
                data={{
                  labels: months.map((m) => formatMonthLabel(m)),
                  datasets: [
                    {
                      label: t("admin.financials.netProfit"),
                      data: months.map((m) => m.net / 1000000),
                      borderColor: "rgba(16, 185, 129, 1)",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      tension: 0.3,
                      fill: true,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          label += (context.parsed.y * 1000000).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          });
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return value.toLocaleString("vi-VN") + " triệu";
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialsPage;
