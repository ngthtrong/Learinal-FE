/**
 * Learner Home Page
 * Landing page for role "Learner", styled per aigen.html palette
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import "./LearnerHomePage.css";

const LearnerHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="learner-home-root">
      <main className="lh-main">
        <div className="grid">
          {/* HERO */}
          <section className="hero card">
            <div className="left">
              <h1 style={{ margin: 0 }}>Học tập thông minh cùng Learinal</h1>
              <p className="muted">
                Tải tài liệu của bạn lên để tạo câu hỏi luyện tập, hoặc bắt đầu làm các bộ đề sẵn
                có.
              </p>
              <div className="actions">
                <button className="btn primary" onClick={() => navigate("/documents/upload")}>
                  Tải file & tạo đề
                </button>
                <button className="btn ghost" onClick={() => navigate("/quiz")}>
                  Xem bộ đề
                </button>
              </div>
            </div>
            <div className="right">
              <div className="card promo-card">
                <div className="promo-title">Thống kê nhanh</div>
                <div className="promo-stats">
                  <div className="promo-stat">
                    <div className="muted">Đã học</div>
                    <div className="value">{user?.stats?.completed || 0}</div>
                  </div>
                  <div className="promo-stat">
                    <div className="muted">Điểm TB</div>
                    <div className="value">{user?.stats?.avgScore || 0}%</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* GUIDE */}
          <section className="card">
            <h3 style={{ marginTop: 0 }}>Hướng dẫn nhanh</h3>
            <ol className="muted lh-steps">
              <li>Tải file tài liệu (PDF, DOCX, TXT) tại mục "Tải file & tạo đề".</li>
              <li>Tùy chọn loại câu hỏi, số lượng và hướng dẫn AI.</li>
              <li>Xem, chỉnh sửa các câu hỏi nháp; lưu hoặc luyện tập.</li>
              <li>Theo dõi tiến độ và điểm trung bình của bạn.</li>
            </ol>
          </section>
        </div>
      </main>

      <footer className="lh-footer">© 2025 Learinal</footer>
    </div>
  );
};

export default LearnerHomePage;
