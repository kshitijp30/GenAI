import React, { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeText } from '../services/geminiService';
import { Verdict } from '../types';
import type { AnalysisResult, GroundingSource } from '../types';

// Speech recognition type definitions
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

const verdictStyles: { [key in Verdict]: { badge: string; text: string; bg: string; border: string; label: string } } = {
  [Verdict.VERIFIED_TRUE]: { label: 'Verified True', badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-gray-800/30', border: 'border-green-200 dark:border-green-500/30' },
  [Verdict.MISLEADING]: { label: 'Misleading', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-gray-800/30', border: 'border-yellow-200 dark:border-yellow-500/30' },
  [Verdict.PARTIALLY_TRUE]: { label: 'Partially True', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-gray-800/30', border: 'border-blue-200 dark:border-blue-500/30' },
  [Verdict.POTENTIALLY_FALSE]: { label: 'Potentially False', badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-gray-800/30', border: 'border-red-200 dark:border-red-500/30' },
  [Verdict.UNVERIFIABLE]: { label: 'Unverifiable', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300', text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/30', border: 'border-gray-200 dark:border-gray-500/30' },
};

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const MicrophoneIcon = ({ listening }: { listening: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ResultCard = ({ result, sources }: { result: AnalysisResult; sources: GroundingSource[] }) => {
  const styles = verdictStyles[result.verdict] || verdictStyles[Verdict.UNVERIFIABLE];
  return (
    <div className={`p-6 border rounded-lg shadow-sm transition-all duration-300 ${styles.bg} ${styles.border}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Result</h2>
          <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.badge}`}>
            {styles.label}
          </span>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Confidence</div>
            <div className={`text-4xl font-bold ${styles.text}`}>{result.confidenceScore}%</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-300">Explanation</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{result.explanation}</p>
      </div>
      {sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-300">Sources Found</h3>
          <ul className="mt-2 space-y-2">
            {sources.map((source, index) => (
              <li key={index}>
                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-colors duration-200">
                  {source.web.title || source.web.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const Detector = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ result: AnalysisResult; sources: GroundingSource[] } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  
  const speechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!speechRecognitionSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(`Speech recognition error: ${event.error}. Please ensure microphone access is allowed.`);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) setInputText(prev => (prev.trim() ? prev.trim() + ' ' : '') + finalTranscript.trim());
    };
    speechRecognitionRef.current = recognition;
    return () => recognition.stop();
  }, [speechRecognitionSupported]);

  const toggleListening = () => {
    if (!speechRecognitionRef.current) return;
    isListening ? speechRecognitionRef.current.stop() : speechRecognitionRef.current.start();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(event.target) event.target.value = '';
    if (!file) return;
    if (file.type !== 'text/plain') {
      setError(`Unsupported file type (${file.name}). Please upload a plain text file (.txt). For other documents, please copy and paste the content.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if(text) { setInputText(text); setError(null); } 
      else { setError("File appears to be empty."); }
    };
    reader.onerror = () => setError("Failed to read the file.");
    reader.readAsText(file);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const { result, sources } = await analyzeText(inputText);
      if (result) setAnalysisResult({ result, sources });
      else setError("The AI returned an unexpected response format. Please try rephrasing your text.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
          Live Demo
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          TruthLens – AI-Powered Misinformation Detector & Educator
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          Paste text or a link. Get an AI verdict with explainability and credible sources. Learn to spot misinformation with built-in tips and quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Input & Processing</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paste content or provide a URL. We preprocess and analyze it.</p>
          <div className="mt-4">
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-900/50 p-1 rounded-md">
              <button onClick={() => setInputType('text')} className={`w-full py-2 text-sm font-medium rounded ${inputType === 'text' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>Text</button>
              <button onClick={() => setInputType('url')} className={`w-full py-2 text-sm font-medium rounded ${inputType === 'url' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>URL</button>
            </div>
          </div>
          <div className="mt-4">
            {inputType === 'text' ? (
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Paste article, post, or claim here..." className="w-full h-48 p-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" disabled={isLoading} />
            ) : (
              <input type="url" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="https://example.com/article" className="w-full p-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" disabled={isLoading} />
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt" />
          <div className="mt-4 flex items-center space-x-2">
            <button onClick={handleAnalyze} disabled={isLoading || !inputText} className="flex-grow flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
              {isLoading ? <><Spinner /> Analyzing...</> : 'Analyze'}
            </button>
            <button onClick={handleUploadClick} disabled={isLoading} className="flex-shrink-0 flex justify-center items-center p-3 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" aria-label="Upload a document"><UploadIcon /></button>
            {speechRecognitionSupported && (
              <button onClick={toggleListening} disabled={isLoading} className={`flex-shrink-0 flex justify-center items-center p-3 border rounded-md shadow-sm transition-colors ${isListening ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`} aria-label={isListening ? 'Stop listening' : 'Start voice input'}><MicrophoneIcon listening={isListening} /></button>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Verdicts: True, False, Misleading, Partially True (with confidence).</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Verdict & Explainability</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confidence, reasoning, and links to verify claims.</p>
          <div className="mt-4">
            {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/50 rounded-md">{error}</div>}
            {analysisResult ? <ResultCard result={analysisResult.result} sources={analysisResult.sources} /> : !isLoading && (
              <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
                <p>Run an analysis to see the verdict, confidence, and sources.</p>
                <div className="mt-4 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="mt-3 h-2 w-10/12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                <div className="mt-3 h-2 w-11/12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
              </div>
            )}
            {isLoading && (<div className="mt-6 text-center text-gray-500 dark:text-gray-400"><p>Analyzing... this may take a moment.</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};