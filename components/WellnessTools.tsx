

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { JournalEntry, Mood, MoodLog } from '../types';
import CloseIcon from './icons/CloseIcon';
import Loader from './Loader';
import StopCircleIcon from './icons/StopCircleIcon';

// --- Reusable Modal Component ---
interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
    // Handle Escape key press
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col m-4"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <header className="flex items-center justify-between p-4 border-b border-border-color dark:border-dark-border flex-shrink-0">
                    <h2 id="modal-title" className="text-lg font-bold text-primary dark:text-dark-primary">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

// --- Journal View Component ---
export const JournalView: React.FC = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
    }, []);

    const saveEntry = () => {
        if (!currentEntry.trim()) return;
        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            content: currentEntry.trim(),
        };
        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        setCurrentEntry('');
    };
    
    const getPrompt = async () => {
        setIsLoading(true);
        setCurrentEntry('');
         try {
            // FIX: Use process.env.API_KEY as per the coding guidelines for API key management.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Generate a single, thoughtful, and concise journaling prompt (less than 20 words) for someone feeling stressed and anxious about their job search.",
            });
            setCurrentEntry(response.text);
        } catch (error) {
            console.error("Failed to get journal prompt:", error);
            setCurrentEntry("Error getting a prompt. How are you feeling right now?");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <textarea
              rows={8}
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="What's on your mind? Write it down..."
              className="w-full bg-background dark:bg-dark-background border border-border-color dark:border-dark-border rounded-lg p-4 focus:ring-2 focus:ring-accent transition-colors duration-300 placeholder-gray-400 dark:placeholder-slate-500 mb-4"
              aria-label="Journal Entry"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mb-6">
                <button onClick={getPrompt} disabled={isLoading} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-slate-700 text-primary dark:text-dark-primary rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                    {isLoading ? 'Getting Prompt...' : 'Get a Thoughtful Prompt'}
                </button>
                 <button onClick={saveEntry} className="px-6 py-2 font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
                    Save Entry
                </button>
            </div>
            <h3 className="font-bold text-md text-primary dark:text-dark-primary mb-2 border-t border-border-color dark:border-dark-border pt-4">Past Entries</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {entries.length > 0 ? entries.map(entry => (
                    <div key={entry.id} className="bg-background dark:bg-dark-background p-3 rounded-lg">
                        <p className="text-xs text-secondary dark:text-dark-secondary mb-1">
                            {new Date(entry.date).toLocaleString()}
                        </p>
                        <p className="text-sm text-primary dark:text-dark-primary truncate">{entry.content}</p>
                    </div>
                )) : <p className="text-sm text-secondary dark:text-dark-secondary text-center py-4">No entries yet.</p>}
            </div>
        </div>
    );
};


// --- Mindfulness View Component ---
type Exercise = 'Breathing' | 'Meditation' | 'Grounding';

const exerciseScripts = {
    Breathing: [
        { instruction: 'Breathe In', anim: 'scale-150 duration-[4000ms]', speech: 'Breathe in, for four seconds.', duration: 4000 },
        { instruction: 'Hold', anim: 'scale-150 duration-[4000ms]', speech: 'And hold.', duration: 4000 },
        { instruction: 'Breathe Out', anim: 'scale-100 duration-[6000ms]', speech: 'Slowly breathe out, for six seconds.', duration: 6000 },
        { instruction: '', anim: 'scale-100 duration-[6000ms]', speech: '', duration: 2000 },
    ],
    Meditation: [
        { instruction: 'Welcome', speech: 'Welcome to this short meditation. Find a comfortable position, and gently close your eyes.', duration: 8000 },
        { instruction: 'Focus on your breath', speech: 'Bring your attention to your breath. Notice the sensation of the air entering and leaving your body.', duration: 10000 },
        { instruction: 'Observe', speech: 'Don\'t try to change your breathing. Just observe.', duration: 8000 },
        { instruction: 'Acknowledge thoughts', speech: 'Your mind may wander. That\'s okay. When you notice, gently guide your focus back to your breath.', duration: 10000 },
        { instruction: 'Be present', speech: 'Let\'s stay with the breath for a few more moments, being present in this moment.', duration: 10000 },
        { instruction: 'Return', speech: 'Now, gently bring your awareness back to the room. When you\'re ready, slowly open your eyes.', duration: 8000 },
    ],
    Grounding: [
        { instruction: 'Begin', speech: 'Let\'s begin the 5-4-3-2-1 grounding technique. Take a deep breath in... and out.', duration: 7000 },
        { instruction: '5 Things You See', speech: 'First, name five things you can see around you.', duration: 10000 },
        { instruction: '4 Things You Feel', speech: 'Next, notice four things you can feel. The chair beneath you, or the fabric of your clothes.', duration: 10000 },
        { instruction: '3 Things You Hear', speech: 'Now, listen for three things you can hear.', duration: 8000 },
        { instruction: '2 Things You Smell', speech: 'Next, name two things you can smell.', duration: 7000 },
        { instruction: '1 Thing You Taste', speech: 'Finally, notice one thing you can taste.', duration: 6000 },
        { instruction: 'Complete', speech: 'Take one more deep breath. You are now more connected to the present moment.', duration: 7000 },
    ]
};


export const MindfulnessView: React.FC = () => {
    const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
    const [instruction, setInstruction] = useState('');
    const [animationClass, setAnimationClass] = useState('scale-100');
    // FIX: The return type of `setTimeout` in the browser is `number`, not `NodeJS.Timeout`.
    const timeoutsRef = useRef<number[]>([]);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

    useEffect(() => {
        const populateVoiceList = () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const availableVoices = window.speechSynthesis.getVoices();
                const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
                setVoices(englishVoices);

                if (!selectedVoiceURI && englishVoices.length > 0) {
                    const googleVoice = englishVoices.find(v => v.name.includes('Google'));
                    setSelectedVoiceURI(googleVoice ? googleVoice.voiceURI : englishVoices[0].voiceURI);
                }
            }
        };

        populateVoiceList();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [selectedVoiceURI]);
    
    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window) || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoiceURI) {
            const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
            if (voice) {
                utterance.voice = voice;
            }
        }
        window.speechSynthesis.speak(utterance);
    }, [voices, selectedVoiceURI]);

    const stopExercise = useCallback(() => {
        // FIX: Use window.clearTimeout to avoid ambiguity with Node.js types.
        timeoutsRef.current.forEach(window.clearTimeout);
        timeoutsRef.current = [];
        window.speechSynthesis.cancel();
        setActiveExercise(null);
        setInstruction('');
        setAnimationClass('scale-100');
    }, []);

    useEffect(() => {
        if (activeExercise) {
            const script = exerciseScripts[activeExercise];
            let currentIndex = -1;
            
            const runSequence = () => {
                currentIndex = (activeExercise === 'Breathing') 
                    ? (currentIndex + 1) % script.length 
                    : currentIndex + 1;

                if (currentIndex >= script.length) {
                    stopExercise();
                    return;
                }

                const step = script[currentIndex];
                setInstruction(step.instruction || '');
                // FIX: The `anim` property is optional on exercise script steps. Use the `in` operator
                // to check for the property's existence before accessing it, satisfying TypeScript's type checker.
                if('anim' in step && step.anim) setAnimationClass(step.anim);
                speak(step.speech);

                // FIX: Use window.setTimeout to ensure the return type is 'number' in a browser environment.
                const timeout = window.setTimeout(runSequence, step.duration);
                timeoutsRef.current.push(timeout);
            };
            
            runSequence();
        }

        return () => {
            // FIX: Use window.clearTimeout to match the type of IDs stored from window.setTimeout.
            timeoutsRef.current.forEach(window.clearTimeout);
            window.speechSynthesis.cancel();
        };
    }, [activeExercise, speak, stopExercise]);

    if (activeExercise) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[350px] text-center">
                 <style>{`
                    @keyframes pulse-slow {
                        50% { opacity: 0.5; }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                `}</style>
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-accent/20 dark:bg-accent/30 rounded-full animate-pulse-slow"></div>
                    <div 
                        className={`w-24 h-24 bg-accent rounded-full transition-transform ease-in-out ${animationClass}`}
                    ></div>
                </div>
                <p className="text-xl font-semibold text-primary dark:text-dark-primary h-8 mb-6">{instruction}</p>
                 <button 
                    onClick={stopExercise} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-slate-700 text-primary dark:text-dark-primary rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                    <StopCircleIcon />
                    End Session
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[350px]">
            <p className="text-sm text-center text-secondary dark:text-dark-secondary mb-6">Choose an interactive, voice-guided exercise to help you relax and recenter.</p>
             {voices.length > 0 && (
                <div className="mb-6">
                    <label htmlFor="voice-select" className="block text-sm font-medium text-secondary dark:text-dark-secondary mb-2">
                        Select a Voice:
                    </label>
                    <select
                        id="voice-select"
                        value={selectedVoiceURI || ''}
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        className="w-full bg-background dark:bg-dark-background border border-border-color dark:border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-accent transition-colors duration-300"
                        aria-label="Select a voice for guided exercises"
                    >
                        {voices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {`${voice.name} (${voice.lang})`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => setActiveExercise('Breathing')} className="w-full p-4 text-left font-semibold bg-gray-100 dark:bg-slate-700 text-primary dark:text-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                    <h4 className="font-bold">Guided Breathing</h4>
                    <p className="text-xs font-normal text-secondary dark:text-dark-secondary mt-1">Calm anxiety with a simple box breathing animation.</p>
                </button>
                <button onClick={() => setActiveExercise('Meditation')} className="w-full p-4 text-left font-semibold bg-gray-100 dark:bg-slate-700 text-primary dark:text-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                    <h4 className="font-bold">1-Min Meditation</h4>
                    <p className="text-xs font-normal text-secondary dark:text-dark-secondary mt-1">A short mindfulness meditation for beginners.</p>
                </button>
                <button onClick={() => setActiveExercise('Grounding')} className="w-full p-4 text-left font-semibold bg-gray-100 dark:bg-slate-700 text-primary dark:text-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                    <h4 className="font-bold">Grounding Technique</h4>
                     <p className="text-xs font-normal text-secondary dark:text-dark-secondary mt-1">Reconnect with the present using the 5-4-3-2-1 method.</p>
                </button>
            </div>
        </div>
    );
};


// --- Mood Tracker View Component ---
const moodOptions: { mood: Mood; emoji: string; color: string }[] = [
    { mood: 'ecstatic', emoji: '😁', color: 'text-green-500' },
    { mood: 'happy', emoji: '🙂', color: 'text-lime-500' },
    { mood: 'neutral', emoji: '😐', color: 'text-yellow-500' },
    { mood: 'sad', emoji: '😟', color: 'text-blue-500' },
    { mood: 'anxious', emoji: '😥', color: 'text-purple-500' },
];

export const MoodTrackerView: React.FC = () => {
    const [logs, setLogs] = useState<MoodLog[]>([]);

    useEffect(() => {
        const savedLogs = localStorage.getItem('moodLogs');
        if (savedLogs) {
            setLogs(JSON.parse(savedLogs));
        }
    }, []);

    const logMood = (mood: Mood) => {
        const newLog: MoodLog = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mood,
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('moodLogs', JSON.stringify(updatedLogs));
    };
    
    const getMoodEmoji = (mood: Mood) => moodOptions.find(m => m.mood === mood)?.emoji || '❓';

    return (
        <div>
            <p className="text-center text-sm text-secondary dark:text-dark-secondary mb-4">How are you feeling right now?</p>
            <div className="flex justify-around items-center bg-background dark:bg-dark-background p-4 rounded-lg mb-6">
                {moodOptions.map(({ mood, emoji }) => (
                    <button 
                        key={mood} 
                        onClick={() => logMood(mood)} 
                        className="text-4xl transform hover:scale-125 transition-transform duration-200"
                        aria-label={`Log mood as ${mood}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <h3 className="font-bold text-md text-primary dark:text-dark-primary mb-2 border-t border-border-color dark:border-dark-border pt-4">Recent Moods</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {logs.length > 0 ? logs.slice(0, 10).map(log => (
                     <div key={log.id} className="flex items-center justify-between bg-background dark:bg-dark-background p-3 rounded-lg">
                        <p className="text-sm text-secondary dark:text-dark-secondary">
                            {new Date(log.date).toLocaleString()}
                        </p>
                        <span className="text-2xl">{getMoodEmoji(log.mood)}</span>
                    </div>
                )) : <p className="text-sm text-secondary dark:text-dark-secondary text-center py-4">No moods logged yet.</p>}
            </div>
        </div>
    );
};