import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, Send, CheckCircle, AlertCircle, Loader, Eye, X, Database, BarChart3 } from 'lucide-react';

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploadUrl, setUploadUrl] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showAllDataModal, setShowAllDataModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Calculate question type counts
  const questionTypeCounts = useMemo(() => {
    const counts = {};
    parsedData.forEach(item => {
      const questionType = item.qnType?.trim() || 'Not Specified';
      counts[questionType] = (counts[questionType] || 0) + 1;
    });
    return counts;
  }, [parsedData]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
      setParsedData([]);
    }
  };

  const parseExcelFile = async () => {
    if (!file) {
      setMessage('Please select an Excel file first');
      setStatus('error');
      return;
    }

    setStatus('parsing');
    setMessage('Parsing Excel file...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row, index) => ({
        serialNumber: row['Serial Number']?.toString() || row["Q.No"] || '',
        question: row['Question'] || '',
        optionA: row['Option A'] || row['Option a'] || '',
        optionB: row['Option B'] || row['Option b'] || '',
        optionC: row['Option C'] || row['Option c'] || '',
        optionD: row['Option D'] || row['Option d'] || '',
        answers: row['Answers'] || row['Correct option'] || '',
        qnType: row['Question Type'] || '',
        topic: row['Topic'] || '',
        chapter: row['Chapter'] || '',
        subject: row['Subject'] || '',
        exam: row['Exam'] || ''
      }));

      setParsedData(formattedData);
      setStatus('success');
      setMessage(`Successfully parsed ${formattedData.length} questions from the Excel file`);
    } catch (error) {
      setStatus('error');
      setMessage(`Error parsing Excel file: ${error.message}`);
    }
  };

  const uploadData = async () => {
    if (!uploadUrl.trim()) {
      setMessage('Please enter a valid upload URL');
      setStatus('error');
      return;
    }

    if (parsedData.length === 0) {
      setMessage('No data to upload. Please parse an Excel file first.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('Uploading data...');
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: parsedData,
          totalQuestions: parsedData.length,
          questionTypeCounts: questionTypeCounts,
          timestamp: new Date().toISOString()
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const result = await response.json();
        setStatus('success');
        setMessage(`Successfully uploaded ${parsedData.length} questions!`);
      } else {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Upload failed: ${error.message}`);
      setProgress(0);
    }
  };

  const openQuestionModal = (question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuestion(null);
  };

  const openAllDataModal = () => {
    setShowAllDataModal(true);
  };

  const closeAllDataModal = () => {
    setShowAllDataModal(false);
  };

  const isFieldMissing = (value) => {
    return !value || value.toString().trim() === '';
  };

  const getRowCompleteness = (item) => {
    const requiredFields = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'answers'];
    const missingRequired = requiredFields.filter(field => isFieldMissing(item[field]));
    
    const optionalFields = ['qnType', 'topic', 'chapter', 'subject', 'exam'];
    const missingOptional = optionalFields.filter(field => isFieldMissing(item[field]));
    
    return {
      missingRequired: missingRequired.length,
      missingOptional: missingOptional.length,
      isComplete: missingRequired.length === 0
    };
  };

  const getMissingFieldsText = (item) => {
    const requiredFields = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'answers'];
    const optionalFields = ['qnType', 'topic', 'chapter', 'subject', 'exam'];
    
    const missingRequired = requiredFields.filter(field => isFieldMissing(item[field]));
    const missingOptional = optionalFields.filter(field => isFieldMissing(item[field]));
    
    let text = '';
    if (missingRequired.length > 0) {
      text += `Missing required: ${missingRequired.join(', ')}`;
    }
    if (missingOptional.length > 0) {
      if (text) text += ' | ';
      text += `Missing optional: ${missingOptional.join(', ')}`;
    }
    return text || 'Complete';
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setStatus('idle');
    setMessage('');
    setProgress(0);
    setUploadUrl('');
    document.getElementById('file-input').value = '';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'parsing':
      case 'uploading':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Excel Question Uploader</h1>
        <p className="text-gray-600">Upload Excel files with question data to your server</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Step 1: Select Excel File
        </h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block"
          >
            Choose Excel File
          </label>
          {file && (
            <div className="mt-4 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>

        <button
          onClick={parseExcelFile}
          disabled={!file || status === 'parsing'}
          className="mt-4 w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'parsing' ? 'Parsing...' : 'Parse Excel File'}
        </button>
      </div>

      {/* URL Input Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2" />
          Step 2: Enter Upload URL
        </h2>
        
        <input
          type="url"
          placeholder="https://your-api-endpoint.com/upload"
          value={uploadUrl}
          onChange={(e) => setUploadUrl(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Question Types Analysis */}
      {Object.keys(questionTypeCounts).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Question Types Analysis
          </h2>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {Object.entries(questionTypeCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800 truncate" title={type}>
                        {type}
                      </span>
                      <span className="text-lg font-bold text-blue-600 bg-white px-2 py-1 rounded">
                        {count}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {((count / parsedData.length) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                ))
              }
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Question Type Counts Object:</h4>
              <div className="bg-gray-100 rounded-lg p-3 text-sm font-mono overflow-x-auto">
                <pre className="text-gray-800">
                  {JSON.stringify(questionTypeCounts, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview Section */}
      {parsedData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Data Preview ({parsedData.length} questions)
            </h2>
            <button
              onClick={openAllDataModal}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Database className="w-4 h-4" />
              View All Data
            </button>
          </div>
          
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left min-w-16">Serial</th>
                    <th className="px-3 py-2 text-left min-w-64">Question</th>
                    <th className="px-3 py-2 text-left min-w-20">Options</th>
                    <th className="px-3 py-2 text-left min-w-16">Answer</th>
                    <th className="px-3 py-2 text-left min-w-20">Type</th>
                    <th className="px-3 py-2 text-left min-w-20">Subject</th>
                    <th className="px-3 py-2 text-left min-w-20">Status</th>
                    <th className="px-3 py-2 text-left min-w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((item, index) => {
                    const completeness = getRowCompleteness(item);
                    return (
                      <tr key={index} className={`border-t hover:bg-gray-50 ${!completeness.isComplete ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 font-medium">{item.serialNumber}</td>
                        <td className="px-3 py-2">
                          <div className="max-w-xs">
                            <p className={`truncate ${isFieldMissing(item.question) ? 'text-red-500 italic' : ''}`} title={item.question}>
                              {item.question || 'Missing question'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs space-y-1">
                            <div className={isFieldMissing(item.optionA) ? 'text-red-500 italic' : ''}>
                              A: {item.optionA || 'Missing'}
                            </div>
                            <div className={isFieldMissing(item.optionB) ? 'text-red-500 italic' : ''}>
                              B: {item.optionB || 'Missing'}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`font-semibold px-2 py-1 rounded text-xs ${
                            isFieldMissing(item.answers) 
                              ? 'text-red-600 bg-red-100 italic' 
                              : 'text-green-600 bg-green-100'
                          }`}>
                            {item.answers || 'Missing'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isFieldMissing(item.qnType)
                              ? 'bg-gray-100 text-gray-500 italic'
                              : 'bg-purple-100 text-purple-800 font-medium'
                          }`}>
                            {item.qnType || 'Not specified'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{item.subject || 'Not specified'}</td>
                        <td className="px-3 py-2">
                          {completeness.isComplete ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Complete
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded" title={getMissingFieldsText(item)}>
                              ⚠ {completeness.missingRequired} missing
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => openQuestionModal(item)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                            title="View full question"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {parsedData.length > 5 && (
              <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center border-t">
                Showing 5 of {parsedData.length} questions. Click "View All Data" to see everything.
              </div>
            )}
          </div>

          {/* Data Summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {parsedData.filter(q => getRowCompleteness(q).isComplete).length}
              </div>
              <div className="text-sm text-gray-600">Complete Rows</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">
                {parsedData.filter(q => !getRowCompleteness(q).isComplete).length}
              </div>
              <div className="text-sm text-gray-600">Incomplete Rows</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {parsedData.filter(q => q.answers.trim()).length}
              </div>
              <div className="text-sm text-gray-600">With Answers</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(parsedData.map(q => q.subject).filter(s => s.trim())).size}
              </div>
              <div className="text-sm text-gray-600">Unique Subjects</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-indigo-600">
                {Object.keys(questionTypeCounts).length}
              </div>
              <div className="text-sm text-gray-600">Question Types</div>
            </div>
          </div>
        </div>
      )}

      {/* All Data Modal */}
      {showAllDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-[95vw] max-h-[90vh] overflow-hidden w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Database className="w-5 h-5" />
                All Questions Data ({parsedData.length} questions)
              </h3>
              <button
                onClick={closeAllDataModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable Table */}
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Serial</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-80">Question</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-40">Option A</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-40">Option B</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-40">Option C</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-40">Option D</th>
                    <th className="px-3 py-3 text-left font-semibold">Answer</th>
                    <th className="px-3 py-3 text-left font-semibold">Type</th>
                    <th className="px-3 py-3 text-left font-semibold">Topic</th>
                    <th className="px-3 py-3 text-left font-semibold">Chapter</th>
                    <th className="px-3 py-3 text-left font-semibold">Subject</th>
                    <th className="px-3 py-3 text-left font-semibold">Exam</th>
                    <th className="px-3 py-3 text-left font-semibold">Status</th>
                    <th className="px-3 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((item, index) => {
                    const completeness = getRowCompleteness(item);
                    return (
                      <tr key={index} className={`border-t hover:bg-gray-50 ${!completeness.isComplete ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-3 font-medium text-blue-600">{item.serialNumber}</td>
                        <td className="px-3 py-3">
                          <div className="max-w-80">
                            <p className={`line-clamp-3 leading-relaxed ${isFieldMissing(item.question) ? 'text-red-500 italic' : 'text-gray-800'}`}>
                              {item.question || 'Missing question'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-40">
                            <span className={`text-xs px-2 py-1 rounded block ${
                              isFieldMissing(item.optionA) 
                                ? 'bg-red-100 text-red-800 italic' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.optionA || 'Missing'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-40">
                            <span className={`text-xs px-2 py-1 rounded block ${
                              isFieldMissing(item.optionB) 
                                ? 'bg-red-100 text-red-800 italic' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.optionB || 'Missing'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-40">
                            <span className={`text-xs px-2 py-1 rounded block ${
                              isFieldMissing(item.optionC) 
                                ? 'bg-red-100 text-red-800 italic' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.optionC || 'Missing'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-40">
                            <span className={`text-xs px-2 py-1 rounded block ${
                              isFieldMissing(item.optionD) 
                                ? 'bg-red-100 text-red-800 italic' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.optionD || 'Missing'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`font-bold px-3 py-1 rounded text-sm ${
                            isFieldMissing(item.answers) 
                              ? 'text-red-600 bg-red-100 italic' 
                              : 'text-green-600 bg-green-100'
                          }`}>
                            {item.answers || 'Missing'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isFieldMissing(item.qnType)
                              ? 'bg-gray-100 text-gray-500 italic'
                              : 'bg-purple-100 text-purple-800 font-medium'
                          }`}>
                            {item.qnType || 'Not specified'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{item.topic || 'Not specified'}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{item.chapter || 'Not specified'}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs font-medium">{item.subject || 'Not specified'}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{item.exam || 'Not specified'}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            {completeness.isComplete ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded text-center">
                                ✓ Complete
                              </span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded text-center" title={getMissingFieldsText(item)}>
                                ⚠ Missing {completeness.missingRequired}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => {
                              closeAllDataModal();
                              openQuestionModal(item);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Total: {parsedData.length} questions | 
                Complete: {parsedData.filter(q => getRowCompleteness(q).isComplete).length} | 
                Incomplete: {parsedData.filter(q => !getRowCompleteness(q).isComplete).length} |
                Subjects: {new Set(parsedData.map(q => q.subject).filter(s => s.trim())).size} |
                Question Types: {Object.keys(questionTypeCounts).length}
              </div>
              <button
                onClick={closeAllDataModal}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
      {showModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Question Details - Serial #{selectedQuestion.serialNumber}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Question */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Question:</h4>
                <p className="text-blue-800 leading-relaxed">{selectedQuestion.question}</p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Option A:</h5>
                  <p className="text-blue-800">{selectedQuestion.optionA || 'Not provided'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">Option B:</h5>
                  <p className="text-green-800">{selectedQuestion.optionB || 'Not provided'}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-900 mb-2">Option C:</h5>
                  <p className="text-yellow-800">{selectedQuestion.optionC || 'Not provided'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-purple-900 mb-2">Option D:</h5>
                  <p className="text-purple-800">{selectedQuestion.optionD || 'Not provided'}</p>
                </div>
              </div>

              {/* Correct Answer */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Correct Answer:</h4>
                <p className="text-red-800 text-lg font-bold">{selectedQuestion.answers || 'Not provided'}</p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Question Type:</span>
                    <p className="text-gray-600 mt-1">{selectedQuestion.qnType || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Topic:</span>
                    <p className="text-gray-600 mt-1">{selectedQuestion.topic || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Chapter:</span>
                    <p className="text-gray-600 mt-1">{selectedQuestion.chapter || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Subject:</span>
                    <p className="text-gray-600 mt-1">{selectedQuestion.subject || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Exam:</span>
                    <p className="text-gray-600 mt-1">{selectedQuestion.exam || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Step 3: Upload Data
        </h2>
        
        {status === 'uploading' && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Uploading... {progress}%</p>
          </div>
        )}

        <button
          onClick={uploadData}
          disabled={parsedData.length === 0 || !uploadUrl.trim() || status === 'uploading'}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload to Server'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`rounded-lg p-4 mb-6 flex items-center ${
          status === 'error' ? 'bg-red-50 text-red-800' : 
          status === 'success' ? 'bg-green-50 text-green-800' : 
          'bg-blue-50 text-blue-800'
        }`}>
          {getStatusIcon()}
          <span className="ml-2">{message}</span>
        </div>
      )}

      {/* Reset Button */}
      {(parsedData.length > 0 || status === 'success') && (
        <div className="text-center">
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset Form
          </button>
        </div>
      )}

      {/* Expected Format Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Expected Excel Format:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Required Columns:</strong> Serial Number, Question, Option A/a, Option B/b, Option C/c, Option D/d</p>
          <p><strong>Optional Columns:</strong> Answers/Correct option, Question Type, Topic, Chapter, Subject, Exam</p>
          <p><strong>Note:</strong> Column names are case-insensitive for options (e.g., 'Option A' or 'Option a')</p>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;