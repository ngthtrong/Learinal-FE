import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validationRequestsService } from '@/services/api';
import { Button, Input, useToast } from '@/components/common';

function ValidationRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
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

  const canComplete = data?.request?.status === 'Assigned';

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
      await validationRequestsService.complete(id, payload);
      await fetchDetail();
      const msg = decision === 'Approved' ? '✅ Phê duyệt thành công' : '❌ Đã từ chối bộ đề';
      setCompletedMessage(msg);
      pushToast({ type: decision === 'Approved' ? 'success' : 'error', message: msg });
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || 'Hoàn thành thất bại';
      setError(msg);
      pushToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Chi tiết kiểm duyệt</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && !loading && <div className="mb-4 text-sm text-red-600">{error}</div>}
      {!loading && data && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded p-4">
            <h2 className="font-medium text-lg">Thông tin yêu cầu</h2>
            <div className="mt-2 text-sm space-y-1">
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
            </div>
          </div>
          <div className="bg-white shadow rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-lg">Câu hỏi trong bộ đề</h2>
              {canComplete && (
                <Button variant="secondary" size="small" onClick={() => setViewMode(m => m === 'view' ? 'edit' : 'view')}>
                  {viewMode === 'view' ? 'Chỉnh sửa' : 'Xem'}
                </Button>
              )}
            </div>
            {data.questionSet?.questions?.length ? (
              <div className="space-y-4">
                {editedQuestions.map((q, idx) => (
                  <div key={q.questionId || idx} className="border rounded p-3">
                    <div className="flex justify-between mb-2">
                      <div className="text-xs text-gray-500">Câu #{idx + 1}</div>
                      {q.difficultyLevel && <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{q.difficultyLevel}</span>}
                    </div>
                    {viewMode === 'edit' ? (
                      <Input label="Nội dung" value={q.questionText || ''} onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)} />
                    ) : (
                      <p className="text-sm font-medium leading-relaxed">{q.questionText}</p>
                    )}
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-medium text-gray-600">Phương án trả lời</div>
                      {q.options?.map((opt, ai) => (
                        <div key={ai} className="flex items-start gap-2">
                          <div className={`text-xs px-2 py-0.5 rounded ${q.correctAnswerIndex === ai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{String.fromCharCode(65 + ai)}</div>
                          {viewMode === 'edit' ? (
                            <Input value={opt} onChange={(e) => {
                              const val = e.target.value;
                              setEditedQuestions(prev => prev.map((qq, qi) => {
                                if (qi !== idx) return qq;
                                const options = qq.options.map((o, oi) => oi === ai ? val : o);
                                return { ...qq, options };
                              }));
                            }} />
                          ) : (
                            <p className="text-sm">{opt}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">Giải thích</div>
                        {viewMode === 'edit' ? (
                          <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm" value={q.explanation} onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)} />
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-line">{q.explanation}</p>
                        )}
                      </div>
                    )}
                    {q.topicTags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.topicTags.map(tag => (
                          <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Không có câu hỏi để hiển thị.</div>
            )}
          </div>
          <div className="bg-white shadow rounded p-4 relative">
            {saving && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2" />
                <div className="text-sm text-indigo-700">Đang xử lý...</div>
              </div>
            )}
            <h2 className="font-medium text-lg mb-2">Phản hồi</h2>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Nhận xét của bạn..." className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-sm" />
            {canComplete ? (
              <div className="flex gap-3 mt-4">
                <Button disabled={saving} onClick={() => submitCompletion('Approved')}>Phê duyệt</Button>
                <Button variant="secondary" disabled={saving} onClick={() => submitCompletion('Rejected')}>Từ chối</Button>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-2">
                {data.request.status === 'Completed' && 'Yêu cầu đã hoàn thành.'}
                {data.request.status === 'Rejected' && 'Yêu cầu đã bị từ chối.'}
                {!['Completed','Rejected','Assigned'].includes(data.request.status) && 'Không thể hoàn thành vì trạng thái hiện tại không phải Assigned.'}
              </div>
            )}
            {completedMessage && <div className="mt-4 text-sm font-medium text-indigo-700">{completedMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationRequestDetailPage;
