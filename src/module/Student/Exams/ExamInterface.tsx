import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import FullscreenWrapper from './FullscreenWrapper';
import ExamTimer from './ExamTimer';

interface Question {
  question_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

const ExamInterface: React.FC = () => {
  const { examId, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const { getStudent } = useUser();
  const student = getStudent();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [flags, setFlags] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const api = useMemo(() => {
    return axios.create({
      baseURL: 'http://localhost:3301',
      withCredentials: true,
      headers: { Authorization: `Bearer ${student?.token}` },
    });
  }, [student?.token]);

  const loadExamData = useCallback(async () => {
    try {
      if (!student?.student_id) throw new Error('Not authenticated');
      const [qRes, pRes, tRes] = await Promise.all([
        api.get<Question[]>(
          `/student/exams/${examId}/attempts/${attemptId}/questions/${student.student_id}`,
        ),
        api.get<{ flags_count: number }>(
          `/student/exams/${examId}/attempts/${attemptId}/progress/${student.student_id}`,
        ),
        api.get<{ remaining_time: number }>(
          `/student/exams/${examId}/attempts/${attemptId}/time/${student.student_id}`,
        ),
      ]);

      setQuestions(qRes.data);
      setFlags(pRes.data.flags_count);
      setTimeLeft(tRes.data.remaining_time);

      const answeredIds = Object.keys(responses).map(Number);
      const newOrder = [
        ...qRes.data.filter((q) => !answeredIds.includes(q.question_id)),
        ...qRes.data.filter((q) => answeredIds.includes(q.question_id)),
      ].map((q) => q.question_id);
      setQuestionOrder(newOrder);
      setCurrentIndex(0);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  }, [api, examId, attemptId, student?.student_id, responses]);

  useEffect(() => {
    loadExamData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadExamData]);

  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1000) {
          clearInterval(timerRef.current);
          if (!isSubmitted) handleSubmit();
          return 0;
        }
        return t - 1000;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [loading, isSubmitted]);

  const saveResponse = async () => {
    const qId = questionOrder[currentIndex];
    const q = questions.find((q) => q.question_id === qId);
    if (!q || !selectedAnswer || !student) return;
    await api.post(
      `/student/exams/${examId}/attempts/${attemptId}/responses/${student.student_id}`,
      {
        question_id: q.question_id,
        selected_option: selectedAnswer.toLowerCase(),
      },
    );
    setResponses((r) => ({ ...r, [q.question_id]: selectedAnswer }));
  };

  const handleNavigation = async (dir: 'next' | 'prev') => {
    if (selectedAnswer) {
      try {
        await saveResponse();
      } catch {
        setError('Failed to save answer');
        return;
      }
    }

    if (dir === 'next') {
      // find next unattempted question
      const nextIdx = questionOrder.findIndex(
        (id, idx) => idx > currentIndex && !(id in responses),
      );
      setCurrentIndex(
        nextIdx !== -1
          ? nextIdx
          : Math.min(questionOrder.length - 1, currentIndex + 1),
      );
    } else {
      setCurrentIndex((i) => Math.max(0, i - 1));
    }
    setSelectedAnswer(null);
  };

  const handleSkip = () => {
    if (!questionOrder.length) return;
    setQuestionOrder((prev) => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(currentIndex, 1);
      newOrder.push(moved);
      // after reordering, navigate to first unattempted
      const nextUnattempted = newOrder.findIndex((id) => !(id in responses));
      setCurrentIndex(nextUnattempted !== -1 ? nextUnattempted : 0);
      return newOrder;
    });
    setSelectedAnswer(null);
  };

  const handleViolation = async (reason: string) => {
    if (!student) return setError('Not authenticated');
    try {
      const res = await api.post<{ status?: string; flags: number }>(
        `/student/exams/${examId}/attempts/${attemptId}/flags/${student.student_id}`,
        { reason: reason.slice(0, 200) },
      );
      setFlags(res.data.flags);
      if (res.data.status === 'disqualified') {
        setIsSubmitted(true);
        navigate('/student/exams', { state: { disqualified: true } });
      }
    } catch {
      setError('Failed to record violation');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted || !student) return;
    setIsSubmitting(true);
    try {
      if (selectedAnswer) await saveResponse();
      await api.post(
        `/student/exams/${examId}/attempts/${attemptId}/submit/${student.student_id}`,
      );
      setIsSubmitted(true);
      setShowSuccessModal(true);
    } catch {
      setError('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-4 bg-red-100">{error}</div>;
  if (loading) return <div className="p-4">Loading exam…</div>;
  if (!questions.length)
    return <div className="p-4 bg-yellow-50">No questions available.</div>;

  const currentQId = questionOrder[currentIndex];
  const q = questions.find((q) => q.question_id === currentQId);

  return (
    <FullscreenWrapper onViolation={handleViolation}>
      <div className="h-screen bg-gray-100 p-4">
        <ExamTimer timeLeft={timeLeft} onTimeout={handleSubmit} flags={flags} />
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Question {currentIndex + 1} of {questions.length}
          </h3>
          <p className="mb-6">{q?.question_text}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {(['a', 'b', 'c', 'd'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() =>
                  q && !(q.question_id in responses) && setSelectedAnswer(opt)
                }
                className={`p-3 border rounded-lg ${
                  selectedAnswer === opt ||
                  (q && responses[q.question_id] === opt)
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                } ${
                  q && responses[q.question_id]
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
                disabled={q ? !!responses[q.question_id] : true}
              >
                {q?.[`option_${opt}` as keyof Question]}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => handleNavigation('prev')}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleNavigation('next')}
                  disabled={!(selectedAnswer || currentQId in responses)}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Answered: {Object.keys(responses).length}/{questions.length}
          </p>
        </div>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4">
              Exam Submitted Successfully!
            </h3>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/student/exams')}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </FullscreenWrapper>
  );
};

export default ExamInterface;
