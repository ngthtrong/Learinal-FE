/**
 * Learner Home Page
 * Landing page for role "Learner", styled per aigen.html palette
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { documentsService, subjectsService, questionSetsService } from "@/services/api";
import { CardGrid, CategoryCard } from "@/components/common";
import QuizIcon from "@/components/icons/QuizIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import BookIcon from "@/components/icons/BookIcon";
import UploadIcon from "@/components/icons/UploadIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";
import PenIcon from "@/components/icons/PenIcon";
import "./LearnerHomePage.css";

const LearnerHomePage = () => {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ subjects: [], sets: [], documents: [] });
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedQ, setSubmittedQ] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
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
        const pick = (r) => r?.data?.items || r?.items || r?.data || [];
        // Fetch all my subjects with pagination
        const fetchAllMySubjects = async () => {
          const pageSize = 50;
          let page = 1;
          const all = [];
          // Loop pages until totalPages reached (safety cap 50 pages)
          for (let i = 0; i < 50; i++) {
            const resp = await subjectsService
              .getSubjects({ page, pageSize, sort: "-updatedAt" })
              .catch(() => ({ items: [], meta: { totalPages: page } }));
            const items = resp?.items || resp?.data?.items || [];
            all.push(...items);
            const totalPages = resp?.meta?.totalPages || 1;
            if (page >= totalPages) break;
            page += 1;
          }
          return all;
        };

        const [mySubsAll, pubSubs, mySets, pubSets] = await Promise.all([
          fetchAllMySubjects(),
          subjectsService
            .getSubjects({ limit: 5, visibility: "public", sort: "-updatedAt" })
            .catch(() => ({ data: [] })),
          questionSetsService.getSets({ limit: 5, sort: "-updatedAt" }).catch(() => ({ data: [] })),
          questionSetsService
            .filterSets({ isShared: true, pageSize: 100 })
            .catch(() => ({ results: [] })),
        ]);
        // Aggregate ALL user documents by fetching documents for each subject with pagination
        const fetchDocsBySubjectAll = async (subjectId) => {
          const pageSize = 50;
          let page = 1;
          const agg = [];
          for (let i = 0; i < 50; i++) {
            const resp = await documentsService
              .getDocumentsBySubject(subjectId, { page, pageSize })
              .catch(() => ({ items: [], meta: { totalPages: page } }));
            const items = resp?.items || resp?.data?.items || [];
            agg.push(...items);
            const totalPages = resp?.meta?.totalPages || 1;
            if (page >= totalPages) break;
            page += 1;
          }
          return agg;
        };

        const docsArrays = await Promise.all(
          (mySubsAll || []).map((s) => fetchDocsBySubjectAll(s.id || s._id))
        );
        const myDocsAgg = docsArrays.flat();

        // Keep personal sets as-is (includes both isShared=false/true of current user)
        // Public shows all shared sets across database
        setLists({
          mySets: pick(mySets),
          publicSets: pubSets?.results || [],
          mySubjects: mySubsAll,
          publicSubjects: pick(pubSubs),
          myDocuments: myDocsAgg,
        });
      } catch (err) {
        void err; // no-op
      }
    })();
  }, []);

  // No pagination for public sets; render full list (BE currently has very few)

  const normalizeText = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const getItemLabel = (it) =>
    it?.subjectName ||
    it?.name ||
    it?.title ||
    it?.originalFileName ||
    it?.fileName ||
    it?.filename ||
    "";

  // Simple Levenshtein distance for fuzzy similarity
  const levenshtein = (a, b) => {
    const s = a || "";
    const t = b || "";
    const n = s.length;
    const m = t.length;
    if (n === 0) return m;
    if (m === 0) return n;
    const dp = new Array(m + 1);
    for (let j = 0; j <= m; j++) dp[j] = j;
    for (let i = 1; i <= n; i++) {
      let prev = i - 1;
      dp[0] = i;
      for (let j = 1; j <= m; j++) {
        const temp = dp[j];
        if (s[i - 1] === t[j - 1]) {
          dp[j] = prev;
        } else {
          dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
        }
        prev = temp;
      }
    }
    return dp[m];
  };

  const similarity = (a, b) => {
    const len = Math.max(a.length, b.length) || 1;
    const dist = levenshtein(a, b);
    return 1 - dist / len;
  };

  const approxMatch = (label, query) => {
    const nl = normalizeText(label);
    const nq = normalizeText(query);
    if (!nl || !nq) return false;
    if (nl.includes(nq) || nq.includes(nl)) return true;
    return similarity(nl, nq) >= 0.6; // threshold for near match
  };

  const performSearch = async (term) => {
    const t = term.trim();
    if (!t) {
      setResults({ subjects: [], sets: [], documents: [] });
      setHasSearched(false);
      setSubmittedQ("");
      setModalOpen(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setSubmittedQ(t);
    try {
      const [subRes, setRes, docRes] = await Promise.all([
        subjectsService.getSubjects({ q: t, limit: 20 }).catch(() => ({ data: [] })),
        questionSetsService.getSets({ q: t, limit: 20 }).catch(() => ({ data: [] })),
        documentsService.getDocuments({ q: t, limit: 20 }).catch(() => ({ data: [] })),
      ]);
      const subjectsAll = subRes?.data || subRes?.items || [];
      const setsAll = setRes?.data || setRes?.items || [];
      const docsAll = docRes?.data || docRes?.items || [];

      const subjects = subjectsAll.filter((it) => approxMatch(getItemLabel(it), t));
      const sets = setsAll.filter((it) => approxMatch(getItemLabel(it), t));
      const documents = docsAll.filter((it) => approxMatch(getItemLabel(it), t));

      setResults({ subjects, sets, documents });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Close modal on Escape and lock body scroll while open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    if (isModalOpen) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [isModalOpen]);

  // Merge subjects (personal + public) for a single category section
  const mergedSubjects = useMemo(() => {
    const arr = [...(lists.mySubjects || []), ...(lists.publicSubjects || [])];
    const map = new Map();
    for (const it of arr) {
      const key = it?._id || it?.id || JSON.stringify(it);
      if (!map.has(key)) map.set(key, it);
    }
    return Array.from(map.values());
  }, [lists]);

  const subjectsToShow = useMemo(() => (mergedSubjects || []).slice(0, 5), [mergedSubjects]);

  // Deduplicate aggregated documents by id for safe rendering
  const myDocumentsDedup = useMemo(() => {
    const map = new Map();
    for (const d of lists.myDocuments || []) {
      const key = d?.id || d?._id || JSON.stringify(d);
      if (!map.has(key)) map.set(key, d);
    }
    return Array.from(map.values());
  }, [lists.myDocuments]);

  return (
    <div className="learner-home-root card">
      <div className="home-header">
        <form
          className="home-search"
          onSubmit={(e) => {
            e.preventDefault();
            performSearch(q);
          }}
        >
          <input
            type="text"
            placeholder="Tìm môn học, bộ đề, tài liệu..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // form submit already handles it
              }
            }}
          />
          <button type="submit" className="search-btn" aria-label="Tìm kiếm" disabled={loading}>
            {/* magnifying glass icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>
      </div>

      <div className="home-content">
        {/* Mục có phạm vi cao hơn: Môn học */}
        <section className="home-section">
          <div className="section-title">
            <h3
              style={{ margin: 0, cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onClick={() => navigate("/subjects")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/subjects");
              }}
            >
              Môn Học
            </h3>
          </div>
          {subjectsToShow.length > 0 ? (
            <CardGrid>
              {subjectsToShow.map((it) => (
                <CategoryCard
                  key={it._id || it.id}
                  title={it.subjectName || it.name || it.title}
                  subtitle=""
                  cta=""
                  Icon={BookIcon}
                  onClick={() => navigate("/subjects")}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="muted">Chưa có môn học</div>
          )}
        </section>
        <section className="home-section">
          <div className="section-title">
            <h3
              style={{ margin: 0, cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onClick={() => navigate("/quiz")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/quiz");
              }}
            >
              Đề Thi (Cá Nhân)
            </h3>
          </div>
          {lists.mySets.length > 0 ? (
            <CardGrid>
              {lists.mySets.map((it) => (
                <CategoryCard
                  key={it._id || it.id}
                  title={it.name || it.title}
                  cta=""
                  Icon={PenIcon}
                  onClick={() => navigate("/quiz")}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="muted">Chưa có bộ đề</div>
          )}
        </section>

        <section className="home-section">
          <div className="section-title">
            <h3
              style={{ margin: 0, cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onClick={() => navigate("/public")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/public");
              }}
            >
              Đề Thi (Công Khai)
            </h3>
          </div>
          {lists.publicSets.length > 0 ? (
            <CardGrid>
              {(lists.publicSets || []).map((it) => (
                <CategoryCard
                  key={it._id || it.id}
                  title={it.name || it.title}
                  cta=""
                  Icon={PenIcon}
                  onClick={() => navigate("/public")}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="muted">Chưa có bộ đề</div>
          )}
        </section>

        <section className="home-section">
          <div className="section-title">
            <h3
              style={{ margin: 0, cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onClick={() => navigate("/documents")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/documents");
              }}
            >
              Tài Liệu{myDocumentsDedup?.length ? ` (${myDocumentsDedup.length})` : ""}
            </h3>
          </div>
          {myDocumentsDedup.length > 0 ? (
            <CardGrid>
              {myDocumentsDedup.map((it) => (
                <CategoryCard
                  key={it._id || it.id}
                  title={it.originalFileName || it.fileName || it.name || it.filename || it.title}
                  cta=""
                  Icon={QuizIcon}
                  onClick={() => navigate("/documents")}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="muted">Chưa có tài liệu</div>
          )}
        </section>
      </div>

      <footer className="lh-footer">© 2025 Learinal</footer>

      {/* Search Results Modal */}
      {isModalOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setModalOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="search-modal-title" style={{ margin: 0 }}>
                Kết quả gần đúng{submittedQ ? `: "${submittedQ}"` : ""}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="search-results-grid">
                <div>
                  <div className="sr-title">Môn học</div>
                  <ul>
                    {results.subjects.map((s) => (
                      <li key={s._id || s.id}>{s.subjectName || s.name || s.title || "Môn học"}</li>
                    ))}
                    {results.subjects.length === 0 && <li className="muted">Không có kết quả</li>}
                  </ul>
                </div>
                <div>
                  <div className="sr-title">Bộ đề</div>
                  <ul>
                    {results.sets.map((s) => (
                      <li key={s._id || s.id}>{s.name || s.title || "Bộ đề"}</li>
                    ))}
                    {results.sets.length === 0 && <li className="muted">Không có kết quả</li>}
                  </ul>
                </div>
                <div>
                  <div className="sr-title">Tài liệu</div>
                  <ul>
                    {results.documents.map((d) => (
                      <li key={d._id || d.id}>{d.name || d.filename || d.title || "Tài liệu"}</li>
                    ))}
                    {results.documents.length === 0 && <li className="muted">Không có kết quả</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerHomePage;
