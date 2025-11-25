/**
 * Learner Home Page
 * Landing page for role "Learner", styled per aigen.html palette
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { documentsService, subjectsService, questionSetsService } from "@/services/api";
import { CardGrid, CategoryCard } from "@/components/common";
import QuizIcon from "@/components/icons/QuizIcon";
import SubjectsIcon from "@/components/icons/SubjectsIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import BookIcon from "@/components/icons/BookIcon";
import DocumentIcon from "@/components/icons/DocumentIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";
import PenIcon from "@/components/icons/PenIcon";
const LearnerHomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Read query parameter and auto-trigger search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("q");
    if (searchQuery && searchQuery.trim()) {
      setQ(searchQuery);
      performSearch(searchQuery);
    }
  }, [location.search]);

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
              .catch(() => ({ data: [], meta: { totalPages: page } }));
            const items = resp?.data || resp?.items || [];
            agg.push(...items);
            const totalPages = resp?.meta?.totalPages || 1;
            if (page >= totalPages) break;
            page += 1;
          }
          return agg;
        };

        const docsArrays = await Promise.all(
          (mySubsAll || []).map((s) => fetchDocsBySubjectAll(s.id || s._id).catch(() => []))
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header with Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
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
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/subjects")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/subjects");
              }}
            >
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <BookIcon size={24} strokeWidth={2} className="text-primary-600 dark:text-primary-400" />
              </div>
              Môn Học
            </h2>
            <button
              onClick={() => navigate("/subjects")}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
                  Icon={SubjectsIcon}
                  onClick={() => navigate(`/subjects/${it._id || it.id}`)}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <BookIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Chưa có môn học nào</p>
              <button
                onClick={() => navigate("/subjects/create")}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/quiz")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/quiz");
              }}
            >
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 8h8M8 12h8"></path><path d="M16 2v20"></path></svg>
              </div>
              Đề Thi (Cá Nhân)
            </h2>
            <button
              onClick={() => navigate("/quiz")}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
                  onClick={() => navigate(`/quiz/${it._id || it.id}`)}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <PenIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Chưa có bộ đề nào</p>
              <button
                onClick={() => navigate("/quiz/create")}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/public")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/public");
              }}
            >
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2c1.5 0 2.92.69 3.82 1.97l1.38 2.16c.5.78 1.3 1.3 2.21 1.46l1.96.31c.95.15 1.73.86 2 1.8l.5 1.81c.22.8.77 1.48 1.5 1.85l1.3.66c.74.37 1.25 1.08 1.37 1.88l.25 1.65c.08.51.33.97.7 1.28l.96.82c.6.5.95 1.23.95 2 0 .77-.35 1.5-.95 2l-.96.82c-.37.31-.62.77-.7 1.28l-.25 1.65c-.12.8-.63 1.51-1.37 1.88l-1.3.66c-.73.37-1.28 1.05-1.5 1.85l-.5 1.81c-.27.94-1.05 1.65-2 1.8l-1.96.31c-.91.16-1.71.68-2.21 1.46l-1.38 2.16c-.9 1.28-2.32 1.97-3.82 1.97s-2.92-.69-3.82-1.97l-1.38-2.16c-.5-.78-1.3-1.3-2.21-1.46l-1.96-.31c-.95-.15-1.73-.86-2-1.8l-.5-1.81c-.22-.8-.77-1.48-1.5-1.85l-1.3-.66c-.74-.37-1.25-1.08-1.37-1.88l-.25-1.65c-.08-.51-.33-.97-.7-1.28l-.96-.82c-.6-.5-.95-1.23-.95-2 0-.77.35-1.5.95-2l.96-.82c.37-.31.62-.77.7-1.28l.25-1.65c.12-.8.63-1.51 1.37-1.88l1.3-.66c.73-.37 1.28-1.05 1.5-1.85l.5-1.81c.27-.94 1.05-1.65 2-1.8l1.96-.31c.91-.16 1.71-.68 2.21-1.46l1.38-2.16C9.08 2.69 10.5 2 12 2z"></path><path d="M2.5 12h19"></path></svg>
              </div>
              Đề Thi (Chung)
            </h2>
            <button
              onClick={() => navigate("/public")}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
                  onClick={() => navigate(`/quiz/${it._id || it.id}`)}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <GlobeIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Chưa có bộ đề công khai</p>
            </div>
          )}
        </section>

        {/* Tài liệu Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/documents")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/documents");
              }}
            >
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              Tài Liệu{myDocumentsDedup?.length ? ` (${myDocumentsDedup.length})` : ""}
            </h2>
            <button
              onClick={() => navigate("/documents")}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
                  Icon={DocumentIcon}
                  onClick={() => navigate(`/documents/${it._id || it.id}`)}
                />
              ))}
            </CardGrid>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <DocumentIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Chưa có tài liệu nào</p>
              <button
                onClick={() => navigate("/documents/upload")}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Tải lên tài liệu đầu tiên
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
              <h3
                id="search-modal-title"
                className="text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                Kết quả tìm kiếm{submittedQ ? `: "${submittedQ}"` : ""}
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
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
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BookIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Môn học
                  </h4>
                  <ul className="space-y-2">
                    {results.subjects.map((s) => (
                      <li
                        key={s._id || s.id}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-700 text-gray-900 dark:text-gray-200"
                        onClick={() => {
                          navigate(`/subjects/${s._id || s.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {s.subjectName || s.name || s.title || "Môn học"}
                      </li>
                    ))}
                    {results.subjects.length === 0 && (
                      <li className="px-3 py-2 text-gray-400 dark:text-gray-500 text-sm italic">
                        Không có kết quả
                      </li>
                    )}
                  </ul>
                </div>

                {/* Bộ đề */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <PenIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    Bộ đề
                  </h4>
                  <ul className="space-y-2">
                    {results.sets.map((s) => (
                      <li
                        key={s._id || s.id}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900/30 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors cursor-pointer border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700 text-gray-900 dark:text-gray-200"
                        onClick={() => {
                          navigate(`/quiz/${s._id || s.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {s.name || s.title || "Bộ đề"}
                      </li>
                    ))}
                    {results.sets.length === 0 && (
                      <li className="px-3 py-2 text-gray-400 dark:text-gray-500 text-sm italic">
                        Không có kết quả
                      </li>
                    )}
                  </ul>
                </div>

                {/* Tài liệu */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <DocumentIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                    Tài liệu
                  </h4>
                  <ul className="space-y-2">
                    {results.documents.map((d) => (
                      <li
                        key={d._id || d.id}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-success-50 dark:hover:bg-success-900/30 hover:text-success-700 dark:hover:text-success-300 transition-colors cursor-pointer border border-transparent hover:border-success-200 dark:hover:border-success-700 text-gray-900 dark:text-gray-200"
                        onClick={() => {
                          navigate(`/documents/${d._id || d.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {d.name || d.filename || d.title || "Tài liệu"}
                      </li>
                    ))}
                    {results.documents.length === 0 && (
                      <li className="px-3 py-2 text-gray-400 dark:text-gray-500 text-sm italic">
                        Không có kết quả
                      </li>
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
