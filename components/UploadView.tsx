import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import UploadIcon from './icons/UploadIcon';

// Add type declarations for libraries loaded via script tags
declare global {
  interface Window {
    mammoth: any;
    pdfjsLib: any;
  }
}

interface UploadViewProps {
  onAnalyze: (cv: string, jobDescription: string) => void;
}

// --- Helper Functions for File Parsing ---

const parseTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error('Failed to read the file content.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read the file. Please try again.'));
        };
        reader.readAsText(file);
    });
};

const parsePdfFile = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) {
        throw new Error('PDF parsing library is not loaded.');
    }
    // Set worker path
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((s: any) => s.str).join(' ') + '\n';
    }
    return fullText;
};

const parseDocxFile = async (file: File): Promise<string> => {
    if (!window.mammoth) {
        throw new Error('DOCX parsing library is not loaded.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
};


const UploadView: React.FC<UploadViewProps> = ({ onAnalyze }) => {
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state for new upload
    setError('');
    setCv('');
    setFileName('');
    setIsParsing(true);

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      setError('File is too large. Please upload a file smaller than 25MB.');
      setIsParsing(false);
      e.target.value = ''; // Reset file input
      return;
    }

    setFileName(file.name);

    try {
      let extractedText = '';
      const fileType = file.type;
      const fileNameLower = file.name.toLowerCase();

      if (fileType === 'application/pdf' || fileNameLower.endsWith('.pdf')) {
        extractedText = await parsePdfFile(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileNameLower.endsWith('.docx')) {
        extractedText = await parseDocxFile(file);
      } else if (['text/plain', 'text/markdown'].includes(fileType) || fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.md')) {
        extractedText = await parseTextFile(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, TXT, or MD file.');
      }
      
      setCv(extractedText);
    } catch (err: any) {
        console.error("File parsing error:", err);
        setError(err.message || 'An unexpected error occurred during file parsing.');
        setFileName('');
    } finally {
        setIsParsing(false);
        e.target.value = ''; // Reset file input to allow re-uploading the same file
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isParsing) return;
    if (!cv.trim() || !jobDescription.trim()) {
      setError('Please provide your CV and the job description.');
      return;
    }
    setError('');
    onAnalyze(cv, jobDescription);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-dark-primary">
          Get Your Personalized Career Plan
        </h2>
        <p className="mt-3 text-lg text-secondary dark:text-dark-secondary max-w-2xl mx-auto">
          Upload your CV and paste a job description. Our AI will analyze them to give you tailored feedback and a roadmap to success.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CV Column */}
          <div id="tour-step-1" className="bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center min-h-8 mb-2">
                <label htmlFor="cv" className="block text-sm font-medium text-secondary dark:text-dark-secondary">
                    Your CV
                </label>
                <label htmlFor="cv-file" className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isParsing ? 'bg-gray-200 dark:bg-dark-border cursor-not-allowed' : 'bg-gray-100 dark:bg-slate-700 text-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                    <UploadIcon />
                    <span>{isParsing ? 'Parsing...' : 'Upload File'}</span>
                </label>
                <input 
                    id="cv-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    aria-label="Upload CV File"
                    disabled={isParsing}
                />
            </div>
             <div className="h-5 text-right mb-2">
                {fileName && <p className="text-xs text-secondary dark:text-dark-secondary italic">Selected: {fileName}</p>}
             </div>
            <textarea
              id="cv"
              rows={15}
              value={cv}
              onChange={(e) => {
                setCv(e.target.value);
                if (fileName) setFileName(''); // Clear filename if user edits manually
              }}
              placeholder="Upload a file or paste your full CV here..."
              className="w-full bg-background dark:bg-dark-background border border-border-color dark:border-dark-border rounded-lg p-4 focus:ring-2 focus:ring-accent transition-colors duration-300 placeholder-gray-400 dark:placeholder-slate-500"
              aria-label="Your CV Text Area"
              disabled={isParsing}
            />
          </div>
          {/* Job Description Column */}
          <div id="tour-step-2" className="bg-surface dark:bg-dark-surface border border-border-color dark:border-dark-border rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center min-h-8 mb-2">
                <label htmlFor="job-description" className="block text-sm font-medium text-secondary dark:text-dark-secondary">
                  Job Description
                </label>
            </div>
            <div className="h-5 mb-2" />
            <textarea
              id="job-description"
              rows={15}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full bg-background dark:bg-dark-background border border-border-color dark:border-dark-border rounded-lg p-4 focus:ring-2 focus:ring-accent transition-colors duration-300 placeholder-gray-400 dark:placeholder-slate-500"
              aria-label="Job Description Text Area"
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="text-center pt-4">
          <button
            type="submit"
            id="tour-step-3"
            disabled={isParsing}
            className="inline-flex items-center gap-3 px-8 py-3 font-semibold text-lg bg-accent text-white rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:bg-accent-hover"
          >
            <SparklesIcon />
            Analyze and Coach Me
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadView;