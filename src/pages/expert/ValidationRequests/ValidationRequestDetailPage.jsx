import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validationRequestsService } from '@/services/api';
import { Button, Input, useToast } from '@/components/common';

function ValidationRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedMessage, setCompletedMessage] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [viewMode, setViewMode] = useState('view');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await validationRequestsService.getValidationRequestDetail(id);
      setData(res);
      setFeedback(res?.request?.feedback || '');
      if (res?.questionSet?.questions) {
        setEditedQuestions(res.questionSet.questions.map(q => ({ ...q })));
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Không tải được chi tiết yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const canComplete = data?.request?.status === 'Assigned' || data?.request?.status === 'RevisionRequested';

  const handleQuestionChange = (index, field, value) => {
    setEditedQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const submitCompletion = async (decision) => {
    if (!canComplete) return;
    setSaving(true);
    setError('');
    setCompletedMessage('');
    try {
      const payload = { decision, feedback: feedback || undefined };
      if (decision === 'Approved') payload.correctedQuestions = editedQuestions;
      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      await validationRequestsService.complete(id, payload);
      const msg = decision === 'Approved' ? 'Phê duyệt thành công' : 'Đã từ chối bộ đề';
      if (decision === 'Approved') {
        showSuccess(msg);
      } else {
        showError(msg);
      }
    } catch (e) {
      console.error('Error completing validation:', e);
      console.error('Error response:', e?.response?.data);
      console.error('Error details:', JSON.stringify(e?.response?.data?.details, null, 2));
      const details = e?.response?.data?.details;
      const msg = details ? `Validation failed: ${JSON.stringify(details)}` : (e?.response?.data?.message || 'Hoàn thành thất bại');
      setError(msg);
      showError(msg);
      setSaving(false);
      return;
    }
    // Navigate after success (outside try-catch)
    setSaving(false);
    navigate('/expert/validation-requests');
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">Chi tiết kiểm duyệt</h1>
          <Button variant="secondary" onClick={() => navigate('/expert/validation-requests')} className="w-full sm:w-auto">Quay lại</Button>
        </div>
      {loading && <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center py-8">Đang tải...</div>}
      {error && !loading && <div className="mb-4 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
      {!loading && data && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-3 sm:p-4">
            <h2 className="font-medium text-base sm:text-lg text-gray-900 dark:text-gray-100">Thông tin yêu cầu</h2>
            <div className="mt-2 text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-gray-700 dark:text-gray-300">
              <div><span className="font-medium">ID:</span> {data.request.id}</div>
              <div><span className="font-medium">Trạng thái:</span> {data.request.status}</div>
              <div><span className="font-medium">Quyết định:</span> {data.request.decision || '—'}</div>
              <div><span className="font-medium">Người tạo:</span> {data.learner?.name || '—'} ({data.learner?.email || '—'})</div>
              <div><span className="font-medium">Expert:</span> {data.expert?.name || '—'}</div>
              <div><span className="font-medium">Bộ câu hỏi:</span> {data.questionSet?.title || '—'}</div>
              <div><span className="font-medium">Số câu hỏi:</span> {data.questionSet?.questionCount ?? '—'}</div>
              {data.request.completionTime && (
                <div><span className="font-medium">Hoàn thành:</span> {new Date(data.request.completionTime).toLocaleString('vi-VN')}</div>
              )}
              {data.request.revisionRequestTime && (
                <div><span className="font-medium">Yêu cầu xem lại:</span> {new Date(data.request.revisionRequestTime).toLocaleString('vi-VN')}</div>
              )}
            </div>
            {data.request.status === 'RevisionRequested' && data.request.learnerResponse && (
              <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-warning-800 dark:text-warning-300 mb-1">
                      Phản hồi từ người học:
                    </div>
                    <p className="text-sm text-warning-700 dark:text-warning-400 whitespace-pre-line">
                      {data.request.learnerResponse}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <h2 className="font-medium text-base sm:text-lg text-gray-900 dark:text-gray-100">Câu hỏi trong bộ đề</h2>
              {canComplete && (
                <Button variant="secondary" size="small" onClick={() => setViewMode(m => m === 'view' ? 'edit' : 'view')} className="w-full sm:w-auto">
                  {viewMode === 'view' ? 'Chỉnh sửa' : 'Xem'}
                </Button>
              )}
            </div>
            {data.questionSet?.questions?.length ? (
              <div className="space-y-4">
                {editedQuestions.map((q, idx) => (
                  <div key={q.questionId || idx} className="border border-gray-200 dark:border-slate-700 rounded p-3 bg-gray-50 dark:bg-slate-900">
                    <div className="flex justify-between mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Câu #{idx + 1}</div>
                      {q.difficultyLevel && <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">{q.difficultyLevel}</span>}
                    </div>
                    {viewMode === 'edit' ? (
                      <Input label="Nội dung" value={q.questionText || ''} onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)} />
                    ) : (
                      <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">{q.questionText}</p>
                    )}
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Phương án trả lời {viewMode === 'edit' && <span className="text-indigo-600 dark:text-indigo-400">(Click vào radio để chọn đáp án đúng)</span>}
                      </div>
                      {q.options?.map((opt, ai) => (
                        <div key={ai} className="flex items-center gap-2">
                          {viewMode === 'edit' ? (
                            <>
                              <input
                                type="radio"
                                name={`correct-answer-${idx}`}
                                checked={q.correctAnswerIndex === ai}
                                onChange={() => handleQuestionChange(idx, 'correctAnswerIndex', ai)}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                              />
                              <div className={`text-xs px-2 py-0.5 rounded font-medium ${q.correctAnswerIndex === ai ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                                {String.fromCharCode(65 + ai)}
                              </div>
                              <Input 
                                value={opt} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditedQuestions(prev => prev.map((qq, qi) => {
                                    if (qi !== idx) return qq;
                                    const options = qq.options.map((o, oi) => oi === ai ? val : o);
                                    return { ...qq, options };
                                  }));
                                }} 
                                className="flex-1"
                              />
                            </>
                          ) : (
                            <>
                              <div className={`text-xs px-2 py-0.5 rounded font-medium ${q.correctAnswerIndex === ai ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                                {String.fromCharCode(65 + ai)}
                                {q.correctAnswerIndex === ai && ' ✓'}
                              </div>
                              <p className="text-sm flex-1 text-gray-900 dark:text-gray-100">{opt}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Giải thích</div>
                        {viewMode === 'edit' ? (
                          <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm" value={q.explanation} onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)} />
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{q.explanation}</p>
                        )}
                      </div>
                    )}
                    {q.topicTags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.topicTags.map(tag => (
                          <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Không có câu hỏi để hiển thị.</div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-3 sm:p-4 relative">
            {saving && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-2" />
                <div className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-400">Đang xử lý...</div>
              </div>
            )}
            <h2 className="font-medium text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100">Phản hồi</h2>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Nhận xét của bạn..." className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm" />
            {canComplete ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                <Button disabled={saving} onClick={() => submitCompletion('Approved')} className="w-full sm:w-auto">Phê duyệt</Button>
                <Button variant="secondary" disabled={saving} onClick={() => submitCompletion('Rejected')} className="w-full sm:w-auto">Từ chối</Button>
              </div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {data.request.status === 'Completed' && 'Yêu cầu đã hoàn thành.'}
                {data.request.status === 'Rejected' && 'Yêu cầu đã bị từ chối.'}
                {!['Completed','Rejected','Assigned'].includes(data.request.status) && 'Không thể hoàn thành vì trạng thái hiện tại không phải Assigned.'}
              </div>
            )}
            {completedMessage && <div className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-400">{completedMessage}</div>}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ValidationRequestDetailPage;
