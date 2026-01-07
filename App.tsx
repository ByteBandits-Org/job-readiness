

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from './types';
import UploadView from './components/UploadView';
import DashboardView from './components/DashboardView';
import Loader from './components/Loader';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import ActivityView from './components/ActivityView';
import InsightsView from './components/InsightsView';
import WellnessView from './components/WellnessView';
import OnboardingTour from './components/OnboardingTour';

type AppState = 'ready' | 'analyzing' | 'complete' | 'error';
type ActiveView = 'home' | 'activity' | 'insights' | 'wellness';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('ready');
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    // Check if the user has completed the onboarding tour before
    const hasCompletedTour = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedTour) {
        setIsTourActive(true);
    }
  }, []);

  const handleFinishTour = () => {
      localStorage.setItem('hasCompletedOnboarding', 'true');
      setIsTourActive(false);
  };

  const handleAnalysis = async (cv: string, jobDescription: string) => {
    setAppState('analyzing');
    setError(null);
    setCurrentAnalysis(null);
    setActiveView('home');

    try {
      // FIX: Use process.env.API_KEY as per the coding guidelines for API key management.
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `First, identify the user's full name from the CV and the job title from the job description. Then, act as a friendly and encouraging expert career coach. Use the identified name to personalize your feedback where appropriate. Based on the following CV and job description, provide: 1. Actionable, concise, and constructive feedback to improve the CV for this specific job. 2. A list of the top 3-5 skill gaps with recommendations for courses or projects. 3. Suggest 2-3 alternative career streams or industries where the user's skills would be valuable, explaining why. 4. Provide one powerful CV structure tip with a clear 'before' and 'after' example. The 'before' should be a common mistake (e.g., passive language), and the 'after' should be the improved version (e.g., using action verbs and quantifiable results) that is more attractive to a hiring manager. The tip should explain *why* the 'after' is better.

        **CV:**
        ${cv}

        **Job Description:**
        ${jobDescription}`,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The full name of the user as identified from the CV.",
              },
              jobTitle: {
                type: Type.STRING,
                description: "The job title extracted from the job description (e.g., 'Senior Software Engineer').",
              },
              cvFeedback: {
                type: Type.ARRAY,
                description: "Actionable feedback points to improve the CV.",
                items: { type: Type.STRING },
              },
              skillRecommendations: {
                type: Type.ARRAY,
                description: "Recommended skills to learn based on skill gaps.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING, description: "The skill to learn." },
                    recommendation: { type: Type.STRING, description: "How to learn the skill (e.g., type of course or project)." },
                  },
                   required: ["skill", "recommendation"],
                },
              },
              careerStreams: {
                type: Type.ARRAY,
                description: "Alternative career streams or industries where the user's skills would be valuable.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        stream: { type: Type.STRING, description: "The name of the career stream or industry." },
                        reason: { type: Type.STRING, description: "The reason why the user's skills are a good fit for this stream." },
                    },
                    required: ["stream", "reason"],
                },
              },
              cvStructureTip: {
                type: Type.OBJECT,
                description: "A tip for structuring the CV with a before/after example.",
                properties: {
                    tip: { type: Type.STRING, description: "The explanation of the structuring tip." },
                    before: { type: Type.STRING, description: "The 'before' example showing a common mistake." },
                    after: { type: Type.STRING, description: "The 'after' example showing the improved, attractive version." },
                },
                required: ["tip", "before", "after"],
              },
            },
             required: ["name", "jobTitle", "cvFeedback", "skillRecommendations", "careerStreams", "cvStructureTip"],
          },
        },
      });

      const resultText = response.text.trim();
      const resultJson: Omit<AnalysisResult, 'id' | 'date' | 'jobDescription'> = JSON.parse(resultText);
      const newAnalysis: AnalysisResult = {
          ...resultJson,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          jobDescription,
      };
      
      setCurrentAnalysis(newAnalysis);
      setHistory(prev => [newAnalysis, ...prev]);
      setAppState('complete');

    } catch (e) {
      console.error(e);
      setError("An error occurred while analyzing your documents. Please try again.");
      setAppState('error');
    }
  };
  
  const handleStartNew = () => {
      setAppState('ready');
      setCurrentAnalysis(null);
      setError(null);
      setActiveView('home');
  };

  const handleViewReport = (id: string) => {
    const report = history.find(item => item.id === id);
    if (report) {
        setCurrentAnalysis(report);
        setActiveView('home');
        setAppState('complete');
    }
  };

  const renderContent = () => {
    if (activeView === 'activity') {
        return <ActivityView history={history} onViewReport={handleViewReport} />;
    }
    if (activeView === 'insights') {
        return <InsightsView history={history} />;
    }
    if (activeView === 'wellness') {
        return <WellnessView />;
    }

    // Home View Logic
    if (appState === 'analyzing') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 h-full">
            <Loader />
            <p className="text-secondary dark:text-dark-secondary text-lg animate-pulse">Analyzing your documents...</p>
        </div>
      );
    }

    if (appState === 'ready' || (appState === 'error' && !currentAnalysis)) {
      return <UploadView onAnalyze={handleAnalysis} />;
    }

    if (appState === 'complete' && currentAnalysis) {
      return <DashboardView result={currentAnalysis} />;
    }

    return null;
  };

  const currentName = activeView === 'home' && currentAnalysis ? currentAnalysis.name : undefined;

  return (
    <div className="flex min-h-screen text-primary dark:text-dark-primary font-sans bg-background dark:bg-dark-background">
      {isTourActive && appState === 'ready' && <OnboardingTour onFinish={handleFinishTour} />}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          name={currentName}
          activeView={activeView}
          showResetButton={appState === 'complete' || appState === 'error'}
          onReset={handleStartNew}
        />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-8 text-center">{error}</div>}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;