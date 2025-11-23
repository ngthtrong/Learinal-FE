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
const LearnerHomePage = () => {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ subjects: [], sets: [], documents: [] });
  const [_hasSearched, setHasSearched] = useState(false);
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header with Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <form
            className="flex items-center gap-2 max-w-2xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              performSearch(q);
            }}
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm môn học, bộ đề, tài liệu..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              aria-label="Tìm kiếm"
              disabled={loading}
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-12">
        {/* Môn học Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/subjects")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/subjects");
              }}
            >
              📚 Môn Học
            </h2>
            <button
              onClick={() => navigate("/subjects")}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả →
            </button>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <BookIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có môn học nào</p>
              <button
                onClick={() => navigate("/subjects/create")}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Tạo môn học đầu tiên
              </button>
            </div>
          )}
        </section>

        {/* Đề thi cá nhân Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/quiz")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/quiz");
              }}
            >
              📝 Đề Thi (Cá Nhân)
            </h2>
            <button
              onClick={() => navigate("/quiz")}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả →
            </button>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <PenIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có bộ đề nào</p>
              <button
                onClick={() => navigate("/quiz/create")}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Tạo bộ đề đầu tiên
              </button>
            </div>
          )}
        </section>

        {/* Đề thi công khai Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/public")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/public");
              }}
            >
              🌐 Đề Thi (Công Khai)
            </h2>
            <button
              onClick={() => navigate("/public")}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          {lists.publicSets.length > 0 ? (
            <CardGrid>
              {(lists.publicSets || []).map((it) => (
                <CategoryCard
                  key={it._id || it.id}
                  title={it.name || it.title}
                  cta=""
                  Icon={GlobeIcon}
                  onClick={() => navigate("/public")}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <GlobeIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có bộ đề công khai</p>
            </div>
          )}
        </section>

        {/* Tài liệu Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/documents")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/documents");
              }}
            >
              📄 Tài Liệu{myDocumentsDedup?.length ? ` (${myDocumentsDedup.length})` : ""}
            </h2>
            <button
              onClick={() => navigate("/documents")}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          {myDocumentsDedup.length > 0 ? (
            <CardGrid>
              {myDocumentsDedup.map((it) => (
                <CategoryCard
                  key={it._id || it.id}
                  title={it.originalFileName || it.fileName || it.name || it.filename || it.title}
                  cta=""
                  Icon={UploadIcon}
                  onClick={() => navigate("/documents")}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có tài liệu nào</p>
              <button
                onClick={() => navigate("/documents/upload")}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Tải lên tài liệu đầu tiên
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>

      {/* Search Results Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-primary-50 to-secondary-50">
              <h3 id="search-modal-title" className="text-xl font-bold text-gray-900">
                Kết quả tìm kiếm{submittedQ ? `: "${submittedQ}"` : ""}
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                onClick={() => setModalOpen(false)}
                aria-label="Đóng"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Môn học */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookIcon className="w-5 h-5 text-primary-600" />
                    Môn học
                  </h4>
                  <ul className="space-y-2">
                    {results.subjects.map((s) => (
                      <li
                        key={s._id || s.id}
                        className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-pointer border border-transparent hover:border-primary-200"
                        onClick={() => {
                          navigate(`/subjects/${s._id || s.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {s.subjectName || s.name || s.title || "Môn học"}
                      </li>
                    ))}
                    {results.subjects.length === 0 && (
                      <li className="px-3 py-2 text-gray-400 text-sm italic">Không có kết quả</li>
                    )}
                  </ul>
                </div>

                {/* Bộ đề */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PenIcon className="w-5 h-5 text-secondary-600" />
                    Bộ đề
                  </h4>
                  <ul className="space-y-2">
                    {results.sets.map((s) => (
                      <li
                        key={s._id || s.id}
                        className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-secondary-50 hover:text-secondary-700 transition-colors cursor-pointer border border-transparent hover:border-secondary-200"
                        onClick={() => {
                          navigate(`/quiz/${s._id || s.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {s.name || s.title || "Bộ đề"}
                      </li>
                    ))}
                    {results.sets.length === 0 && (
                      <li className="px-3 py-2 text-gray-400 text-sm italic">Không có kết quả</li>
                    )}
                  </ul>
                </div>

                {/* Tài liệu */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UploadIcon className="w-5 h-5 text-success-600" />
                    Tài liệu
                  </h4>
                  <ul className="space-y-2">
                    {results.documents.map((d) => (
                      <li
                        key={d._id || d.id}
                        className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-success-50 hover:text-success-700 transition-colors cursor-pointer border border-transparent hover:border-success-200"
                        onClick={() => {
                          navigate(`/documents/${d._id || d.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {d.name || d.filename || d.title || "Tài liệu"}
                      </li>
                    ))}
                    {results.documents.length === 0 && (
                      <li className="px-3 py-2 text-gray-400 text-sm italic">Không có kết quả</li>
                    )}
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
