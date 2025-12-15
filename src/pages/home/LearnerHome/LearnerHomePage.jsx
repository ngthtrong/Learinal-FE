import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { documentsService, subjectsService, questionSetsService } from "@/services/api";
import { CardGrid, CategoryCard, Modal, Button, useToast } from "@/components/common";
import { Footer } from "@/components/layout";
import { CreateQuizModal } from "@/components/questionSets";
import SubjectsIcon from "@/components/icons/SubjectsIcon";
import BookIcon from "@/components/icons/BookIcon";
import DocumentIcon from "@/components/icons/DocumentIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";
import PenIcon from "@/components/icons/PenIcon";
const LearnerHomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ subjects: [], sets: [], documents: [] });
  const [_hasSearched, setHasSearched] = useState(false);
  const [submittedQ, setSubmittedQ] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Modal states
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [uploadSubjects, setUploadSubjects] = useState([]);
  const [selectedUploadSubject, setSelectedUploadSubject] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
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

  // Handle opening upload document modal
  const handleOpenUploadDocModal = async () => {
    try {
      const response = await subjectsService.getSubjects({ pageSize: 100 });
      setUploadSubjects(response.items || []);
      setSelectedUploadSubject(null);
      setUploadFile(null);
      setIsUploadDocModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      toast.showError("Không thể tải danh sách môn học");
    }
  };

  // Handle file selection for upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [".pdf", ".docx", ".txt"];
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedTypes.includes(ext)) {
        toast.showError("Chỉ hỗ trợ file .pdf, .docx, .txt");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.showError("File không được vượt quá 20MB");
        return;
      }
      setUploadFile(file);
    }
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!selectedUploadSubject) {
      toast.showError("Vui lòng chọn môn học");
      return;
    }
    if (!uploadFile) {
      toast.showError("Vui lòng chọn file");
      return;
    }

    try {
      setUploading(true);
      await documentsService.uploadDocument(uploadFile, selectedUploadSubject.id || selectedUploadSubject._id);
      toast.showSuccess("Tải tài liệu thành công!");
      setIsUploadDocModalOpen(false);
      // Refresh documents list
      window.location.reload();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.showError(err.response?.data?.message || "Tải tài liệu thất bại");
    } finally {
      setUploading(false);
    }
  };

  // Handle quiz generation from CreateQuizModal
  const handleGenerateQuiz = async (data) => {
    try {
      setGeneratingQuiz(true);
      const response = await questionSetsService.generateQuestions(data);
      toast.showSuccess("Tạo bộ đề thành công!");
      setIsCreateQuizModalOpen(false);
      // Navigate to the new quiz
      const quizId = response?.id || response?._id || response?.data?.id;
      if (quizId) {
        navigate(`/quiz/${quizId}`);
      } else {
        navigate("/quiz");
      }
    } catch (err) {
      console.error("Generate quiz failed:", err);
      toast.showError(err.response?.data?.message || "Tạo bộ đề thất bại");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header with Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <form
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 max-w-2xl mx-auto"
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
                className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
              <svg
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
              className="px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm sm:text-base w-full sm:w-auto"
              aria-label="Tìm kiếm"
              disabled={loading}
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8 sm:space-y-12">
        {/* Môn học Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/subjects")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/subjects");
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <BookIcon size={20} strokeWidth={2} className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
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
              {/* Add new subject card */}
              <div
                onClick={() => navigate("/subjects/create")}
                className="group cursor-pointer bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 flex items-center justify-center transition-colors">
                  <span className="text-2xl sm:text-3xl font-light text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">+</span>
                </div>
                <span className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium transition-colors">
                  Thêm môn học
                </span>
              </div>
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
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <BookIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">Chưa có môn học nào</p>
              <button
                onClick={() => navigate("/subjects/create")}
                className="mt-4 text-sm sm:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Tạo môn học đầu tiên
              </button>
            </div>
          )}
        </section>

        {/* Tài liệu Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/documents")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/documents");
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
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
              {/* Add new document card */}
              <div
                onClick={handleOpenUploadDocModal}
                className="group cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 flex items-center justify-center transition-colors">
                  <span className="text-2xl sm:text-3xl font-light text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">+</span>
                </div>
                <span className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium transition-colors">
                  Thêm tài liệu
                </span>
              </div>
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
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <DocumentIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">Chưa có tài liệu nào</p>
              <button
                onClick={handleOpenUploadDocModal}
                className="mt-4 text-sm sm:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Tải lên tài liệu đầu tiên
              </button>
            </div>
          )}
        </section>

        {/* Đề thi cá nhân Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/quiz")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/quiz");
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 8h8M8 12h8"></path><path d="M16 2v20"></path></svg>
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
              {/* Add new question set card */}
              <div
                onClick={() => setIsCreateQuizModalOpen(true)}
                className="group cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 flex items-center justify-center transition-colors">
                  <span className="text-2xl sm:text-3xl font-light text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">+</span>
                </div>
                <span className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium transition-colors">
                  Tạo bộ đề
                </span>
              </div>
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
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <BookIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">Chưa có bộ đề nào</p>
              <button
                onClick={() => setIsCreateQuizModalOpen(true)}
                className="mt-4 text-sm sm:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Tạo bộ đề đầu tiên
              </button>
            </div>
          )}
        </section>

        {/* Đề thi công khai Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/public")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/public");
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2c1.5 0 2.92.69 3.82 1.97l1.38 2.16c.5.78 1.3 1.3 2.21 1.46l1.96.31c.95.15 1.73.86 2 1.8l.5 1.81c.22.8.77 1.48 1.5 1.85l1.3.66c.74.37 1.25 1.08 1.37 1.88l.25 1.65c.08.51.33.97.7 1.28l.96.82c.6.5.95 1.23.95 2 0 .77-.35 1.5-.95 2l-.96.82c-.37.31-.62.77-.7 1.28l-.25 1.65c-.12.8-.63 1.51-1.37 1.88l-1.3.66c-.73.37-1.28 1.05-1.5 1.85l-.5 1.81c-.27.94-1.05 1.65-2 1.8l-1.96.31c-.91.16-1.71.68-2.21 1.46l-1.38 2.16c-.9 1.28-2.32 1.97-3.82 1.97s-2.92-.69-3.82-1.97l-1.38-2.16c-.5-.78-1.3-1.3-2.21-1.46l-1.96-.31c-.95-.15-1.73-.86-2-1.8l-.5-1.81c-.22-.8-.77-1.48-1.5-1.85l-1.3-.66c-.74-.37-1.25-1.08-1.37-1.88l-.25-1.65c-.08-.51-.33-.97-.7-1.28l-.96-.82c-.6-.5-.95-1.23-.95-2 0-.77.35-1.5.95-2l.96-.82c.37-.31.62-.77.7-1.28l.25-1.65c.12-.8.63-1.51 1.37-1.88l1.3-.66c.73-.37 1.28-1.05 1.5-1.85l.5-1.81c.27-.94 1.05-1.65 2-1.8l1.96-.31c.91-.16 1.71-.68 2.21-1.46l1.38-2.16C9.08 2.69 10.5 2 12 2z"></path><path d="M2.5 12h19"></path></svg>
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
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <GlobeIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">Chưa có bộ đề công khai</p>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <Footer />

      {/* Search Results Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-slide-up sm:animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
              <h3
                id="search-modal-title"
                className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate pr-2"
              >
                Kết quả{submittedQ ? `: "${submittedQ}"` : ""}
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex-shrink-0"
                onClick={() => setModalOpen(false)}
                aria-label="Đóng"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-60px)] sm:max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Môn học */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BookIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                    Môn học
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {results.subjects.map((s) => (
                      <li
                        key={s._id || s.id}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-700 text-gray-900 dark:text-gray-200 text-sm"
                        onClick={() => {
                          navigate(`/subjects/${s._id || s.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {s.subjectName || s.name || s.title || "Môn học"}
                      </li>
                    ))}
                    {results.subjects.length === 0 && (
                      <li className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-400 dark:text-gray-500 text-xs sm:text-sm italic">
                        Không có kết quả
                      </li>
                    )}
                  </ul>
                </div>

                {/* Bộ đề */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <PenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 dark:text-secondary-400" />
                    Bộ đề
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {results.sets.map((s) => (
                      <li
                        key={s._id || s.id}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900/30 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors cursor-pointer border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700 text-gray-900 dark:text-gray-200 text-sm"
                        onClick={() => {
                          navigate(`/quiz/${s._id || s.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {s.name || s.title || "Bộ đề"}
                      </li>
                    ))}
                    {results.sets.length === 0 && (
                      <li className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-400 dark:text-gray-500 text-xs sm:text-sm italic">
                        Không có kết quả
                      </li>
                    )}
                  </ul>
                </div>

                {/* Tài liệu */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-600 dark:text-success-400" />
                    Tài liệu
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {results.documents.map((d) => (
                      <li
                        key={d._id || d.id}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-success-50 dark:hover:bg-success-900/30 hover:text-success-700 dark:hover:text-success-300 transition-colors cursor-pointer border border-transparent hover:border-success-200 dark:hover:border-success-700 text-gray-900 dark:text-gray-200 text-sm"
                        onClick={() => {
                          navigate(`/documents/${d._id || d.id}`);
                          setModalOpen(false);
                        }}
                      >
                        {d.name || d.filename || d.title || "Tài liệu"}
                      </li>
                    ))}
                    {results.documents.length === 0 && (
                      <li className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-400 dark:text-gray-500 text-xs sm:text-sm italic">
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

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
        onGenerate={handleGenerateQuiz}
        loading={generatingQuiz}
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => {
          setIsUploadDocModalOpen(false);
          setSelectedUploadSubject(null);
          setUploadFile(null);
        }}
        title="Thêm tài liệu mới"
        size="md"
      >
        <div className="space-y-6">
          {/* Subject Selection - Dropdown like CreateQuizModal */}
          <div className="form-group">
            <label htmlFor="upload-subject-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn môn học <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              id="upload-subject-select"
              value={selectedUploadSubject?.id || selectedUploadSubject?._id || ""}
              onChange={(e) => {
                const subject = uploadSubjects.find((s) => (s.id || s._id) === e.target.value);
                setSelectedUploadSubject(subject || null);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">-- Chọn môn học --</option>
              {uploadSubjects.map((subject) => (
                <option key={subject.id || subject._id} value={subject.id || subject._id}>
                  {subject.subjectName || subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show subject info if selected */}
          {selectedUploadSubject && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 dark:text-blue-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Môn học: {selectedUploadSubject.subjectName || selectedUploadSubject.name}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Tài liệu sẽ được thêm vào môn học này
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload - Only show when subject is selected */}
          {selectedUploadSubject && (
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn file <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-primary-500", "bg-primary-50", "dark:bg-primary-900/20");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary-500", "bg-primary-50", "dark:bg-primary-900/20");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary-500", "bg-primary-50", "dark:bg-primary-900/20");
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const file = files[0];
                    const validTypes = [".pdf", ".docx", ".txt"];
                    const ext = "." + file.name.split(".").pop().toLowerCase();
                    if (validTypes.includes(ext)) {
                      setUploadFile(file);
                    }
                  }
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  uploadFile 
                    ? "border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20" 
                    : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <DocumentIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{uploadFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadFile(null);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
                      >
                        Xóa và chọn file khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <DocumentIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Kéo thả file vào đây hoặc click để chọn
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Hỗ trợ: PDF, DOCX, TXT (tối đa 20MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Đang tải lên...</span>
                <span className="text-primary-600 dark:text-primary-400 font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => {
                setIsUploadDocModalOpen(false);
                setSelectedUploadSubject(null);
                setUploadFile(null);
              }}
              disabled={uploading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUploadDocument}
              disabled={!selectedUploadSubject || !uploadFile || uploading}
              loading={uploading}
            >
              {uploading ? "Đang tải..." : "Tải lên"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LearnerHomePage;