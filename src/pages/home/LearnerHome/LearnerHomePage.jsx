/**
 * Learner Home Page
 * Landing page for role "Learner", styled per aigen.html palette
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { documentsService, subjectsService, questionSetsService } from "@/services/api";
import "./LearnerHomePage.css";

const LearnerHomePage = () => {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ subjects: [], sets: [], documents: [] });
  const [lists, setLists] = useState({
    mySets: [],
    publicSets: [],
    mySubjects: [],
    publicSubjects: [],
    myDocuments: [],
  });

  // Fetch initial lists (best-effort; backend params may vary)
  useEffect(() => {
    (async () => {
      try {
        const [myDocs, mySubs, pubSubs, mySets, pubSets] = await Promise.all([
          documentsService.getDocuments({ limit: 5 }).catch(() => ({ data: [] })),
          subjectsService.getSubjects({ limit: 5 }).catch(() => ({ data: [] })),
          subjectsService
            .getSubjects({ limit: 5, visibility: "public" })
            .catch(() => ({ data: [] })),
          questionSetsService.getSets({ limit: 5 }).catch(() => ({ data: [] })),
          questionSetsService
            .getSets({ limit: 5, visibility: "public" })
            .catch(() => ({ data: [] })),
        ]);
        setLists({
          mySets: mySets?.data || mySets?.items || [],
          publicSets: pubSets?.data || pubSets?.items || [],
          mySubjects: mySubs?.data || mySubs?.items || [],
          publicSubjects: pubSubs?.data || pubSubs?.items || [],
          myDocuments: myDocs?.data || myDocs?.items || [],
        });
      } catch (err) {
        void err; // no-op
      }
    })();
  }, []);

  // Simple search across entities
  useEffect(() => {
    const id = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setResults({ subjects: [], sets: [], documents: [] });
        return;
      }
      setLoading(true);
      try {
        const [subRes, setRes, docRes] = await Promise.all([
          subjectsService.getSubjects({ q: term, limit: 5 }).catch(() => ({ data: [] })),
          questionSetsService.getSets({ q: term, limit: 5 }).catch(() => ({ data: [] })),
          documentsService.getDocuments({ q: term, limit: 5 }).catch(() => ({ data: [] })),
        ]);
        setResults({
          subjects: subRes?.data || subRes?.items || [],
          sets: setRes?.data || setRes?.items || [],
          documents: docRes?.data || docRes?.items || [],
        });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="learner-home-root">
      <div className="home-header card">
        <h1 style={{ margin: 0 }}>Trang chủ</h1>
        <div className="home-search">
          <input
            type="text"
            placeholder="Tìm môn học, bộ đề, tài liệu..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {loading && (
            <span className="muted" style={{ marginLeft: 8 }}>
              Đang tìm...
            </span>
          )}
        </div>
        {q.trim() && (
          <div className="search-results card">
            <div className="sr-col">
              <div className="sr-title">Môn học</div>
              <ul>
                {results.subjects.map((s) => (
                  <li key={s._id || s.id}>{s.name || s.title || "Môn học"}</li>
                ))}
                {results.subjects.length === 0 && <li className="muted">Không có kết quả</li>}
              </ul>
            </div>
            <div className="sr-col">
              <div className="sr-title">Bộ đề</div>
              <ul>
                {results.sets.map((s) => (
                  <li key={s._id || s.id}>{s.name || s.title || "Bộ đề"}</li>
                ))}
                {results.sets.length === 0 && <li className="muted">Không có kết quả</li>}
              </ul>
            </div>
            <div className="sr-col">
              <div className="sr-title">Tài liệu</div>
              <ul>
                {results.documents.map((d) => (
                  <li key={d._id || d.id}>{d.name || d.filename || d.title || "Tài liệu"}</li>
                ))}
                {results.documents.length === 0 && <li className="muted">Không có kết quả</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="home-content card">
        <section className="home-section">
          <div className="section-title">
            <h3 style={{ margin: 0 }}>Danh mục đề (cá nhân)</h3>
            <button className="btn ghost" onClick={() => navigate("/quiz")}>
              Xem tất cả
            </button>
          </div>
          <ul className="list-vertical">
            {lists.mySets.map((it) => (
              <li key={it._id || it.id}>{it.name || it.title}</li>
            ))}
            {lists.mySets.length === 0 && <li className="muted">Chưa có bộ đề</li>}
          </ul>
        </section>

        <section className="home-section">
          <div className="section-title">
            <h3 style={{ margin: 0 }}>Danh mục đề (public)</h3>
            <button className="btn ghost" onClick={() => navigate("/public")}>
              Xem tất cả
            </button>
          </div>
          <ul className="list-vertical">
            {lists.publicSets.map((it) => (
              <li key={it._id || it.id}>{it.name || it.title}</li>
            ))}
            {lists.publicSets.length === 0 && <li className="muted">Chưa có bộ đề</li>}
          </ul>
        </section>

        <section className="home-section">
          <div className="section-title">
            <h3 style={{ margin: 0 }}>Danh mục môn học (cá nhân)</h3>
            <button className="btn ghost" onClick={() => navigate("/subjects")}>
              Xem tất cả
            </button>
          </div>
          <ul className="list-vertical">
            {lists.mySubjects.map((it) => (
              <li key={it._id || it.id}>{it.name || it.title}</li>
            ))}
            {lists.mySubjects.length === 0 && <li className="muted">Chưa có môn học</li>}
          </ul>
        </section>

        <section className="home-section">
          <div className="section-title">
            <h3 style={{ margin: 0 }}>Danh mục môn học (public)</h3>
          </div>
          <ul className="list-vertical">
            {lists.publicSubjects.map((it) => (
              <li key={it._id || it.id}>{it.name || it.title}</li>
            ))}
            {lists.publicSubjects.length === 0 && <li className="muted">Chưa có môn học</li>}
          </ul>
        </section>

        <section className="home-section">
          <div className="section-title">
            <h3 style={{ margin: 0 }}>Danh mục tài liệu (cá nhân)</h3>
            <button className="btn ghost" onClick={() => navigate("/documents")}>
              Xem tất cả
            </button>
          </div>
          <ul className="list-vertical">
            {lists.myDocuments.map((it) => (
              <li key={it._id || it.id}>{it.name || it.filename || it.title}</li>
            ))}
            {lists.myDocuments.length === 0 && <li className="muted">Chưa có tài liệu</li>}
          </ul>
        </section>
      </div>

      <footer className="lh-footer">© 2025 Learinal</footer>
    </div>
  );
};

export default LearnerHomePage;
