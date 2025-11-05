/**
 * My Subscription Page
 * Display user's current subscription and history
 */

import React, { useEffect, useState } from "react";
import { subscriptionsService } from "@/services/api";
import { SUBSCRIPTION_STATUS_LABELS } from "@/constants/status";
import "./MySubscriptionPage.css";

function MySubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sub, setSub] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await subscriptionsService.getUserSubscription();
        // Accept common shapes: {subscription}, {data}, or direct object
        const subscription = data?.subscription || data?.data || data || null;
        setSub(subscription);
      } catch (e) {
        setError(e?.response?.data?.message || "Không tải được thông tin gói đăng ký");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (v) => {
    if (!v) return "-";
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return String(v);
      return d.toLocaleString();
    } catch {
      return String(v);
    }
  };

  return (
    <div className="my-subscription-page">
      <h1>Gói đăng ký của tôi</h1>
      {loading && <p>Đang tải...</p>}
      {error && !loading && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <div className="sub-card card">
          {!sub ? (
            <div>
              <p>Bạn chưa có gói đăng ký nào.</p>
              <p>Hãy nhấn nút Upgrade trên thanh trên cùng để chọn gói phù hợp.</p>
            </div>
          ) : (
            <div className="sub-grid">
              <div className="sub-row">
                <span className="sub-label">Gói hiện tại</span>
                <span className="sub-value">{sub.planName || sub.tier || "-"}</span>
              </div>
              <div className="sub-row">
                <span className="sub-label">Trạng thái</span>
                <span className={`sub-badge status-${(sub.status || "").toLowerCase()}`}>
                  {SUBSCRIPTION_STATUS_LABELS[(sub.status || "").toLowerCase()] ||
                    sub.status ||
                    "-"}
                </span>
              </div>
              <div className="sub-row">
                <span className="sub-label">Bắt đầu</span>
                <span className="sub-value">
                  {formatDate(sub.startAt || sub.startedAt || sub.createdAt)}
                </span>
              </div>
              <div className="sub-row">
                <span className="sub-label">Gia hạn/Hết hạn</span>
                <span className="sub-value">{formatDate(sub.renewAt || sub.expiresAt)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MySubscriptionPage;
