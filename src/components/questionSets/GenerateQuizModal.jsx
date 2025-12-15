/**
 * GenerateQuizModal Component
 * Modal for generating quiz from subject with customizable options
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import SubjectsIcon from "@/components/icons/SubjectsIcon";

const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

function GenerateQuizModal({ isOpen, onClose, subject, onGenerate, loading }) {
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicDistribution, setTopicDistribution] = useState({});
  const [language, setLanguage] = useState("vi"); // Default to Vietnamese
  
  // Difficulty distribution - stored as question counts for precision
  const [difficultyMode, setDifficultyMode] = useState("percentage"); // "percentage" or "count"
  const [difficultyQuestions, setDifficultyQuestions] = useState({
    "Ghi nhớ": 2,
    "Hiểu": 2,
    "Áp dụng": 2,
    "Phân tích": 2,
    "Đánh giá": 1,
    "Sáng tạo": 1,
  });

  // Difficulty levels config - Bloom's Taxonomy (6 levels)
  const difficultyLevels = [
    { key: "Ghi nhớ", label: "Ghi nhớ", color: "bg-green-500", textColor: "text-green-600 dark:text-green-400", description: "Nhớ, nhận biết" },
    { key: "Hiểu", label: "Hiểu", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", description: "Giải thích, so sánh" },
    { key: "Áp dụng", label: "Áp dụng", color: "bg-cyan-500", textColor: "text-cyan-600 dark:text-cyan-400", description: "Sử dụng kiến thức" },
    { key: "Phân tích", label: "Phân tích", color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400", description: "Phân tích, so sánh" },
    { key: "Đánh giá", label: "Đánh giá", color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400", description: "Đánh giá, phê phán" },
    { key: "Sáng tạo", label: "Sáng tạo", color: "bg-red-500", textColor: "text-red-600 dark:text-red-400", description: "Tạo ra, thiết kế" },
  ];

  // Calculate total questions assigned
  const totalAssigned = Object.values(difficultyQuestions).reduce((sum, val) => sum + val, 0);
  const remainingQuestions = numQuestions - totalAssigned;

  // Update difficulty distribution when numQuestions changes
  useEffect(() => {
    if (numQuestions !== totalAssigned) {
      // Redistribute proportionally
      const ratio = numQuestions / (totalAssigned || 1);
      const newDistribution = {};
      let assigned = 0;
      const keys = Object.keys(difficultyQuestions);
      
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          // Last one gets the remainder to ensure total matches
          newDistribution[key] = Math.max(0, numQuestions - assigned);
        } else {
          const newCount = Math.round(difficultyQuestions[key] * ratio);
          newDistribution[key] = Math.max(0, newCount);
          assigned += newDistribution[key];
        }
      });
      
      setDifficultyQuestions(newDistribution);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numQuestions]);

  // Handle difficulty change by count
  const handleDifficultyCountChange = (level, newValue) => {
    const value = Math.max(0, parseInt(newValue) || 0);
    
    // Don't allow more than total questions
    const maxAllowed = numQuestions;
    const clampedValue = Math.min(value, maxAllowed);
    
    setDifficultyQuestions(prev => ({ ...prev, [level]: clampedValue }));
  };

  // Handle difficulty change by percentage
  const handleDifficultyPercentageChange = (level, newPercentage) => {
    const percentage = Math.max(0, Math.min(100, parseInt(newPercentage) || 0));
    const newCount = Math.round((percentage / 100) * numQuestions);
    handleDifficultyCountChange(level, newCount);
  };

  // Smart auto-balance: distribute remaining questions proportionally
  const handleAutoBalance = () => {
    if (remainingQuestions === 0) return;
    
    const keys = Object.keys(difficultyQuestions);
    
    if (remainingQuestions > 0) {
      // Distribute extra questions to levels with higher current percentages
      const newDistribution = { ...difficultyQuestions };
      let toDistribute = remainingQuestions;
      
      // Sort by current count (descending) to give more to higher levels
      const sortedKeys = [...keys].sort((a, b) => difficultyQuestions[b] - difficultyQuestions[a]);
      
      for (const key of sortedKeys) {
        if (toDistribute <= 0) break;
        newDistribution[key] += 1;
        toDistribute -= 1;
      }
      
      setDifficultyQuestions(newDistribution);
    } else {
      // Need to reduce - take from levels with most questions
      const newDistribution = { ...difficultyQuestions };
      let toRemove = Math.abs(remainingQuestions);
      
      const sortedKeys = [...keys].sort((a, b) => difficultyQuestions[b] - difficultyQuestions[a]);
      
      for (const key of sortedKeys) {
        if (toRemove <= 0) break;
        const canRemove = Math.min(newDistribution[key], toRemove);
        newDistribution[key] -= canRemove;
        toRemove -= canRemove;
      }
      
      setDifficultyQuestions(newDistribution);
    }
  };

  // Quick presets - Bloom's Taxonomy (6 levels)
  const applyPreset = (preset) => {
    let distribution;
    switch (preset) {
      case "easy":
        distribution = { "Ghi nhớ": 30, "Hiểu": 30, "Áp dụng": 20, "Phân tích": 10, "Đánh giá": 5, "Sáng tạo": 5 };
        break;
      case "balanced":
        distribution = { "Ghi nhớ": 20, "Hiểu": 25, "Áp dụng": 20, "Phân tích": 15, "Đánh giá": 10, "Sáng tạo": 10 };
        break;
      case "hard":
        distribution = { "Ghi nhớ": 10, "Hiểu": 15, "Áp dụng": 20, "Phân tích": 20, "Đánh giá": 20, "Sáng tạo": 15 };
        break;
      case "equal":
        distribution = { "Ghi nhớ": 16.67, "Hiểu": 16.67, "Áp dụng": 16.67, "Phân tích": 16.67, "Đánh giá": 16.66, "Sáng tạo": 16.66 };
        break;
      default:
        return;
    }
    
    // Convert percentages to counts
    const newCounts = {};
    let assigned = 0;
    const keys = Object.keys(distribution);
    
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        newCounts[key] = numQuestions - assigned;
      } else {
        newCounts[key] = Math.round((distribution[key] / 100) * numQuestions);
        assigned += newCounts[key];
      }
    });
    
    setDifficultyQuestions(newCounts);
  };

  // Get percentage for display
  const getPercentage = (key) => {
    return numQuestions > 0 ? Math.round((difficultyQuestions[key] / numQuestions) * 100) : 0;
  };

  // Flatten nested topics structure
  const flattenTopics = (topics, result = []) => {
    topics.forEach((topic) => {
      result.push({ topicId: topic.topicId, topicName: topic.topicName });
      if (topic.childTopics && topic.childTopics.length > 0) {
        flattenTopics(topic.childTopics, result);
      }
    });
    return result;
  };

  // Initialize selected topics and distribution when modal opens
  useEffect(() => {
    if (isOpen && subject?.tableOfContents) {
      const allTopics = flattenTopics(subject.tableOfContents);
      const topicIds = allTopics.map((t) => t.topicId);
      setSelectedTopics(topicIds);

      // Initialize equal distribution
      const equalPercentage = topicIds.length > 0 ? 100 / topicIds.length : 0;
      const initialDistribution = {};
      topicIds.forEach((id) => {
        initialDistribution[id] = equalPercentage;
      });
      setTopicDistribution(initialDistribution);
      setTitle(`Bộ đề thi ${subject.subjectName}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subject]);

  const allTopics = subject?.tableOfContents ? flattenTopics(subject.tableOfContents) : [];

  // Toggle topic selection
  const handleTopicToggle = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      // Deselect
      const newSelected = selectedTopics.filter((id) => id !== topicId);
      setSelectedTopics(newSelected);

      // Redistribute percentages
      const newDistribution = { ...topicDistribution };
      delete newDistribution[topicId];

      if (newSelected.length > 0) {
        const equalPercentage = 100 / newSelected.length;
        newSelected.forEach((id) => {
          newDistribution[id] = equalPercentage;
        });
      }
      setTopicDistribution(newDistribution);
    } else {
      // Select
      const newSelected = [...selectedTopics, topicId];
      setSelectedTopics(newSelected);

      // Redistribute percentages
      const equalPercentage = 100 / newSelected.length;
      const newDistribution = {};
      newSelected.forEach((id) => {
        newDistribution[id] = equalPercentage;
      });
      setTopicDistribution(newDistribution);
    }
  };

  // Handle topic distribution change
  const handleDistributionChange = (topicId, newValue) => {
    const value = Math.max(0, Math.min(100, parseFloat(newValue) || 0));
    const otherTopics = selectedTopics.filter((id) => id !== topicId);

    if (otherTopics.length === 0) {
      setTopicDistribution({ [topicId]: 100 });
      return;
    }

    // Calculate remaining percentage for other topics
    const remaining = 100 - value;
    const currentOtherTotal = otherTopics.reduce(
      (sum, id) => sum + (topicDistribution[id] || 0),
      0
    );

    const newDistribution = { ...topicDistribution, [topicId]: value };

    // Redistribute remaining percentage proportionally
    if (currentOtherTotal > 0) {
      otherTopics.forEach((id) => {
        const proportion = topicDistribution[id] / currentOtherTotal;
        newDistribution[id] = remaining * proportion;
      });
    } else {
      // Equal distribution if no previous values
      const equalShare = remaining / otherTopics.length;
      otherTopics.forEach((id) => {
        newDistribution[id] = equalShare;
      });
    }

    setTopicDistribution(newDistribution);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedTopics.length === 0) {
      alert("Vui lòng chọn ít nhất một chương!");
      return;
    }

    if (totalAssigned !== numQuestions) {
      alert(`Tổng số câu hỏi phân bổ (${totalAssigned}) phải bằng ${numQuestions}!`);
      return;
    }

    // Build topics array with distribution
    const topics = selectedTopics.map((topicId) => ({
      topicId,
      topicName: allTopics.find((t) => t.topicId === topicId)?.topicName || "",
      percentage: Math.round(topicDistribution[topicId] || 0),
    }));

    // Build topicDistribution for backend: { topicId: questionCount }
    const topicDistributionForBackend = {};
    selectedTopics.forEach((topicId) => {
      const percentage = topicDistribution[topicId] || 0;
      const questionCount = Math.round((percentage / 100) * numQuestions);
      if (questionCount > 0) {
        topicDistributionForBackend[topicId] = questionCount;
      }
    });

    const data = {
      subjectId: subject.id,
      title,
      numQuestions,
      language, // Language for question generation
      topics, // Keep for display purposes
      topicDistribution: topicDistributionForBackend, // Backend format: { topicId: count }
      difficultyDistribution: difficultyQuestions, // Backend format: { "Biết": 3, "Hiểu": 4, ... }
    };

    onGenerate(data);
  };

  const handleReset = () => {
    const topicIds = allTopics.map((t) => t.topicId);
    setSelectedTopics(topicIds);
    const equalPercentage = topicIds.length > 0 ? 100 / topicIds.length : 0;
    const initialDistribution = {};
    topicIds.forEach((id) => {
      initialDistribution[id] = equalPercentage;
    });
    setTopicDistribution(initialDistribution);
    setNumQuestions(10);
    setDifficultyQuestions({
      "Biết": 3,
      "Hiểu": 4,
      "Vận dụng": 2,
      "Vận dụng cao": 1,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bộ đề thi mới" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Info */}
        {subject && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400">
                <SubjectsIcon size={24} stroke={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Môn học: {subject.subjectName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{allTopics.length} chương</p>
              </div>
            </div>
          </div>
        )}

        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên bộ đề <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            id="quiz-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Đề thi cuối kỳ"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            required
            maxLength={100}
          />
        </div>

        {/* Language Selection */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ngôn ngữ đề thi
          </label>
          <div className="flex gap-3">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLanguage(opt.value)}
                className={`flex items-center justify-center gap-2 min-w-[140px] px-4 py-2.5 rounded-lg border-2 transition-all ${
                  language === opt.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions Slider */}
        <div className="form-group">
          <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số lượng câu hỏi: <strong className="text-primary-600 dark:text-primary-400">{numQuestions}</strong>
          </label>
          <input
            id="num-questions"
            type="range"
            min="1"
            max="50"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 câu</span>
            <span>50 câu</span>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phân bổ mức độ khó
            </label>
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setDifficultyMode("percentage")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  difficultyMode === "percentage"
                    ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setDifficultyMode("count")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  difficultyMode === "count"
                    ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Số câu
              </button>
            </div>
          </div>
          
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => applyPreset("easy")}
              className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              Dễ
            </button>
            <button
              type="button"
              onClick={() => applyPreset("balanced")}
              className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Cân bằng
            </button>
            <button
              type="button"
              onClick={() => applyPreset("hard")}
              className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Khó
            </button>
            <button
              type="button"
              onClick={() => applyPreset("equal")}
              className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Đều nhau
            </button>
          </div>

          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
            {difficultyLevels.map(({ key, label, color, textColor, description }) => {
              const count = difficultyQuestions[key] || 0;
              const percentage = getPercentage(key);
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">({description})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {difficultyMode === "percentage" ? (
                        <>
                          <span className={`text-xs ${textColor} font-medium`}>
                            {count} câu
                          </span>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={percentage}
                              onChange={(e) => handleDifficultyPercentageChange(key, e.target.value)}
                              className="w-14 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500"
                            />
                            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {percentage}%
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDifficultyCountChange(key, count - 1)}
                              disabled={count <= 0}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={numQuestions}
                              value={count}
                              onChange={(e) => handleDifficultyCountChange(key, e.target.value)}
                              className="w-12 px-1 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleDifficultyCountChange(key, count + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} transition-all duration-300`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            
            {/* Summary Footer */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tổng:</span>
                  <span className={`text-sm font-bold ${
                    totalAssigned === numQuestions 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {totalAssigned}/{numQuestions} câu
                  </span>
                  {remainingQuestions !== 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({remainingQuestions > 0 ? `còn ${remainingQuestions}` : `thừa ${Math.abs(remainingQuestions)}`})
                    </span>
                  )}
                </div>
                {remainingQuestions !== 0 && (
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                    Tự động cân bằng
                  </button>
                )}
              </div>
              
              {/* Visual distribution bar */}
              <div className="mt-2 h-3 w-full rounded-full overflow-hidden flex">
                {difficultyLevels.map(({ key, color }) => {
                  const percentage = getPercentage(key);
                  return percentage > 0 ? (
                    <div
                      key={key}
                      className={`${color} transition-all duration-300 relative group`}
                      style={{ width: `${percentage}%` }}
                      title={`${key}: ${difficultyQuestions[key]} câu (${percentage}%)`}
                    >
                      {percentage >= 15 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                          {difficultyQuestions[key]}
                        </span>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Topic Selection and Distribution */}
        {allTopics.length > 0 && (
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn chương và tỉ lệ câu hỏi ({selectedTopics.length}/{allTopics.length} đã chọn)
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-3 bg-white dark:bg-gray-800/50">
              {allTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.topicId);
                const percentage = topicDistribution[topic.topicId] || 0;

                return (
                  <div
                    key={topic.topicId}
                    className={`p-3 rounded-lg border ${
                      isSelected ? "border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTopicToggle(topic.topicId)}
                        className="w-4 h-4 text-primary-600 dark:text-primary-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
                      />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"
                        }`}
                      >
                        {topic.topicName}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-600"
                        }`}
                      >
                        {Math.round(percentage)}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={percentage}
                      onChange={(e) => handleDistributionChange(topic.topicId, e.target.value)}
                      disabled={!isSelected}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                        isSelected ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tổng:{" "}
              <strong
                className={`${
                  Math.round(
                    Object.values(topicDistribution).reduce((sum, val) => sum + val, 0)
                  ) === 100
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {Math.round(Object.values(topicDistribution).reduce((sum, val) => sum + val, 0))}%
              </strong>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
            Đặt lại
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" loading={loading} disabled={selectedTopics.length === 0}>
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2" ry="2"></rect><path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6"></path></svg>
              Tạo đề thi
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

GenerateQuizModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subject: PropTypes.shape({
    id: PropTypes.string.isRequired,
    subjectName: PropTypes.string.isRequired,
    tableOfContents: PropTypes.array,
  }),
  onGenerate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default GenerateQuizModal;
