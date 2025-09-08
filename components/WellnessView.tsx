
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from '../types';
import UserIcon from './icons/UserIcon';
import SmartToyIcon from './icons/SmartToyIcon';
import SendIcon from './icons/SendIcon';
import TypingIndicator from './TypingIndicator';
import JournalIcon from './icons/JournalIcon';
import MindfulnessIcon from './icons/MindfulnessIcon';
import MoodLogIcon from './icons/MoodLogIcon';
import { Modal, JournalView, MindfulnessView, MoodTrackerView } from './WellnessTools';

type ActiveModal = 'journal' | 'mindfulness' | 'mood' | null;

const WellnessView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sendMessageToAI = useCallback(async (text: string) => {
        const userMessage: ChatMessage = { sender: 'user', text };
        setMessages(prev => [...prev, userMessage, { sender: 'bot', text: '' }]);
        setUserInput('');
        setIsLoading(true);

        const systemInstruction = `You are a compassionate and empathetic wellness coach. Your goal is to provide a safe and supportive space for the user to discuss their feelings, stress, and anxiety related to their job search. Be a good listener, validate their feelings, and offer gentle, encouraging advice. Avoid giving medical advice. Keep your responses concise and warm. Your response MUST be a single JSON object with one key: "response" (string).`;
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                response: { type: Type.STRING },
            },
            required: ["response"],
        };
        
        try {
            // FIX: Use process.env.API_KEY as per the coding guidelines for API key management.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const history = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }));
            const contents = [...history, { role: 'user', parts: [{ text }] }];

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                }
            });
            
            const resultText = response.text.trim();
            const resultJson = JSON.parse(resultText);
            
            const newBotMessage: ChatMessage = { sender: 'bot', text: resultJson.response };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = newBotMessage;
                return newMessages;
            });

        } catch (error) {
            console.error("Failed to get AI response:", error);
            const errorMessage = { sender: 'bot' as const, text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    useEffect(() => {
        const initCoach = async () => {
            setIsLoading(true);
            setMessages([]);
            const initialPrompt = "Hello, welcome to your wellness space. How are you feeling today?";
            await sendMessageToAI(initialPrompt);
        };
        initCoach();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTextSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        sendMessageToAI(userInput.trim());
    };

    const renderModalContent = () => {
        switch (activeModal) {
          case 'journal': return <JournalView />;
          case 'mindfulness': return <MindfulnessView />;
          case 'mood': return <MoodTrackerView />;
          default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border shadow-sm h-[80vh] flex flex-col transition-all duration-300 overflow-hidden">
                <div className="p-4 border-b border-border-color dark:border-dark-border flex-shrink-0">
                    <h3 className="text-lg font-bold text-primary dark:text-dark-primary text-center">
                        Your Empathetic Wellness Coach
                    </h3>
                </div>
                <div className="flex-grow p-4 overflow-y-auto bg-background dark:bg-dark-background">
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-accent"><SmartToyIcon/></div>}
                                <div className={`max-w-md p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-surface dark:bg-dark-surface text-secondary dark:text-dark-secondary'}`}>
                                    {msg.sender === 'bot' && !msg.text && isLoading ? <TypingIndicator /> : <p className="whitespace-pre-wrap text-sm">{msg.text}</p>}
                                </div>
                                {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-secondary dark:text-dark-secondary"><UserIcon/></div>}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="p-4 border-t border-border-color dark:border-dark-border flex-shrink-0 bg-surface dark:bg-dark-surface">
                    <div className="mb-3 p-2 bg-background dark:bg-dark-background rounded-lg flex justify-around items-center">
                        <span className="text-sm font-semibold text-secondary dark:text-dark-secondary">Wellness Tools:</span>
                        <button onClick={() => setActiveModal('journal')} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"><JournalIcon /> Journal</button>
                        <button onClick={() => setActiveModal('mindfulness')} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"><MindfulnessIcon /> Mindfulness</button>
                        <button onClick={() => setActiveModal('mood')} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"><MoodLogIcon /> Mood Log</button>
                    </div>
                    <form onSubmit={handleTextSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isLoading ? "Waiting for response..." : "Type your thoughts here..."}
                            className="w-full bg-background dark:bg-dark-background border-border-color dark:border-dark-border border rounded-lg p-3 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-300 placeholder-gray-400 dark:placeholder-slate-500"
                            disabled={isLoading}
                            aria-label="Your message to the wellness coach"
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-accent text-white p-3 rounded-lg disabled:opacity-50 hover:bg-accent-hover transition-opacity">
                            <SendIcon />
                        </button>
                    </form>
                </div>
                {activeModal && (
                    <Modal title={`${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} Tool`} onClose={() => setActiveModal(null)}>
                        {renderModalContent()}
                    </Modal>
                )}
            </div>
             {/* Simple CSS for animations */}
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default WellnessView;
