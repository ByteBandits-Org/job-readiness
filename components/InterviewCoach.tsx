

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from '../types';
import UserIcon from './icons/UserIcon';
import SmartToyIcon from './icons/SmartToyIcon';
import SendIcon from './icons/SendIcon';
import TypingIndicator from './TypingIndicator';
import MicIcon from './icons/MicIcon';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import VoiceFeedback from './VoiceFeedback';


interface InterviewCoachProps {
  jobDescription: string;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
        webkitAudioContext: any;
    }
}

type QuestionCategory = 'General' | 'Behavioral' | 'Technical' | 'For Interviewer';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            // result is "data:audio/webm;codecs=opus;base64,..."
            // we need to remove the prefix
            resolve((reader.result as string).split(',')[1]);
        } else {
            reject('Failed to convert blob to base64');
        }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


const InterviewCoach: React.FC<InterviewCoachProps> = ({ jobDescription }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [questionCategory, setQuestionCategory] = useState<QuestionCategory>('General');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Voice state
  const [isTTSAvailable, setIsTTSAvailable] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isSTTAvailable, setIsSTTAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Audio Visualizer refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const speak = useCallback((text: string) => {
    if (!isTTSAvailable || !isTTSEnabled || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, [isTTSAvailable, isTTSEnabled]);

  // --- Audio Visualizer Functions ---
  const stopVisualizer = useCallback(() => {
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (canvasRef.current) {
        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    sourceNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();
    // Use a try-catch block for closing AudioContext as it can throw an error if already closed
    try {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    } catch (e) {
      console.error("Error closing audio context:", e);
    }

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceNodeRef.current = null;
    animationFrameIdRef.current = null;
  }, []);

  const drawVisualizer = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteTimeDomainData(dataArray);

    if (canvasCtx) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#2DD4BF'; // accent color
        canvasCtx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  const startVisualizer = useCallback((stream: MediaStream) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      
      drawVisualizer();
  }, [drawVisualizer]);


  const sendMessageToAI = useCallback(async (text: string, audio?: { data: string; mimeType: string }) => {
    const userMessage: ChatMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage, { sender: 'bot', text: '' }]);
    setUserInput('');
    setIsLoading(true);

    const categoryInstructions = {
        General: "Start by introducing yourself briefly and ask the first question. After the user answers, provide brief, constructive feedback before asking the next question.",
        Behavioral: "You are focusing on behavioral questions. Start by explaining the STAR method (Situation, Task, Action, Result) briefly. Then, ask a behavioral question. After the user answers, provide feedback specifically on their use of the STAR method.",
        Technical: "You are conducting a technical screen. Ask relevant technical questions based on the job description. Dive deep into one or two topics. Provide feedback on the correctness and clarity of their answers.",
        'For Interviewer': "You are role-playing as the candidate, and the user is now the interviewer. Your goal is to help the user practice asking good questions. Start by saying 'Great, now it's your turn to ask me some questions. What's on your mind?'. After they ask a question, give them one or two powerful, insightful alternative questions they could ask a real interviewer."
    };
    const systemInstruction = `You are an expert interviewer conducting a mock interview for a role based on the following job description. ${categoryInstructions[questionCategory]} Be encouraging and professional. Keep your responses concise.

When the user provides audio input, you MUST also provide feedback on their vocal delivery. Analyze the audio for:
1. Pace: Was it too fast, too slow, or just right?
2. Clarity & Filler Words: Were there filler words (like "um", "ah")?
3. Confidence: How confident did they sound?

Your entire response MUST be a single JSON object.
- If audio IS provided, the JSON must have two top-level keys: "interviewFeedback" (string) and "voiceFeedback" (an object with "pace", "clarity", and "confidence" string keys).
- If audio IS NOT provided, the JSON must have only one top-level key: "interviewFeedback" (string).

Job Description:
${jobDescription}`;
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            interviewFeedback: { type: Type.STRING },
            voiceFeedback: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                    pace: { type: Type.STRING },
                    clarity: { type: Type.STRING },
                    confidence: { type: Type.STRING },
                }
            }
        },
        required: ["interviewFeedback"],
    };


    try {
        // FIX: Use process.env.API_KEY as per the coding guidelines for API key management.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const history = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const userParts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [{ text }];
        if (audio) {
            userParts.push({
                inlineData: {
                    mimeType: audio.mimeType,
                    data: audio.data,
                },
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [...history, { role: 'user', parts: userParts }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            }
        });
        
        const resultText = response.text.trim();
        const resultJson = JSON.parse(resultText);

        const newBotMessage: ChatMessage = {
            sender: 'bot',
            text: resultJson.interviewFeedback,
            voiceFeedback: resultJson.voiceFeedback,
        };
        
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = newBotMessage;
            return newMessages;
        });
        speak(newBotMessage.text);

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
  }, [messages, jobDescription, questionCategory, speak]);

   // Effect for initializing the chat and speech APIs
  useEffect(() => {
    setIsTTSAvailable('speechSynthesis' in window);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSTTAvailable(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            alert('Microphone permission denied. Please allow microphone access in your browser settings to use this feature.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    // Cleanup function
    return () => {
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }
        recognitionRef.current?.abort();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        stopVisualizer();
    };
  }, [stopVisualizer]);

  // Effect for handling the initial message or category changes
  useEffect(() => {
    const initCoach = async () => {
        setIsLoading(true);
        setMessages([]);
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }
       
        const initialPrompt = "Hello";
        await sendMessageToAI(initialPrompt);
    };
    initCoach();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDescription, questionCategory]);


  useEffect(() => {
    // When the component first loads, initCoach runs and fetches the first message.
    // We want to prevent the page from scrolling down automatically at this point.
    // The `isInitialLoad` ref helps us track this. Once the user sends their
    // first message (i.e., we have more than one user message including the initial hidden one),
    // we can disable this check and scroll normally.
    if (isInitialLoad.current) {
      const userMessages = messages.filter(m => m.sender === 'user');
      if (userMessages.length > 1) {
          isInitialLoad.current = false;
      }
      
      if (isInitialLoad.current) {
          return;
      }
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTextSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    sendMessageToAI(userInput.trim());
  };

  const handleToggleListening = async () => {
    if (!isSTTAvailable) return;

    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const transcript = userInput.trim();
                
                if (audioBlob.size > 100 && transcript) {
                    const audioBase64 = await blobToBase64(audioBlob);
                    sendMessageToAI(transcript, { data: audioBase64, mimeType: 'audio/webm' });
                } else if (transcript) {
                    // Fallback to text-only if recording is empty but we have a transcript
                    sendMessageToAI(transcript);
                }
                
                audioChunksRef.current = [];
                // Stop visualizer before stopping tracks
                stopVisualizer();
                // Stop the media stream tracks to turn off the mic indicator
                stream.getTracks().forEach(track => track.stop());
            };
            
            recorder.start();
            recognitionRef.current?.start();
            startVisualizer(stream); // Start visualizer with the new stream
            setIsListening(true);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access the microphone. Please check your browser permissions.");
        }
    }
  };

  const handleToggleTTS = () => {
    const newIsEnabled = !isTTSEnabled;
    setIsTTSEnabled(newIsEnabled);
    if (!newIsEnabled && window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const categories: QuestionCategory[] = ['General', 'Behavioral', 'Technical', 'For Interviewer'];

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border shadow-sm h-[700px] flex flex-col transition-all duration-300 overflow-hidden">
       <div className="p-4 border-b border-border-color dark:border-dark-border flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary dark:text-dark-primary">
                Interview Coach
            </h3>
            {isTTSAvailable && (
                <button 
                    onClick={handleToggleTTS}
                    className={`p-2 rounded-full transition-colors ${isTTSEnabled ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-dark-border text-secondary dark:text-dark-secondary hover:bg-gray-300'}`}
                    aria-label={isTTSEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
                >
                    {isTTSEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                </button>
            )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-secondary dark:text-dark-secondary mr-2">Focus on:</span>
            {categories.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setQuestionCategory(cat)} 
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                        questionCategory === cat 
                        ? 'bg-accent text-white shadow-sm' 
                        : 'bg-gray-100 dark:bg-slate-700 text-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                >
                    {cat === 'For Interviewer' ? 'Questions for Them' : cat}
                </button>
            ))}
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-background dark:bg-dark-background">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-accent"><SmartToyIcon/></div>}
              <div className={`max-w-md p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-surface dark:bg-dark-surface text-secondary dark:text-dark-secondary'}`}>
                {msg.sender === 'bot' && !msg.text && isLoading ? (
                  <TypingIndicator />
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                    {msg.voiceFeedback && <VoiceFeedback feedback={msg.voiceFeedback} />}
                  </>
                )}
              </div>
              {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-secondary dark:text-dark-secondary"><UserIcon/></div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-border-color dark:border-dark-border flex-shrink-0 bg-surface dark:bg-dark-surface">
        {isListening && (
            <div className="flex justify-center items-center h-12 -mt-2 mb-2 rounded-lg">
                <canvas ref={canvasRef} width="300" height="40" aria-label="Audio waveform visualizer" />
            </div>
        )}
        <form onSubmit={handleTextSendMessage} className="flex items-end gap-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                }
            }}
            placeholder={isListening ? "Listening..." : (isLoading ? "Waiting for response..." : "Type your answer...")}
            className="w-full bg-background dark:bg-dark-background border-border-color dark:border-dark-border border rounded-lg p-3 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-300 placeholder-gray-400 dark:placeholder-slate-500 resize-none"
            disabled={isLoading}
            aria-label="Your interview response"
            rows={3}
          />
          {isSTTAvailable && (
             <button 
                type="button" 
                onClick={handleToggleListening} 
                disabled={isLoading}
                className={`p-3 rounded-lg transition-all duration-300 text-white relative ${isListening ? 'bg-red-500' : 'bg-accent hover:bg-accent-hover'} disabled:opacity-50`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                <MicIcon />
                {isListening && <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-red-400 animate-ping"></span>}
              </button>
          )}
          <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-accent text-white p-3 rounded-lg disabled:opacity-50 hover:bg-accent-hover transition-opacity">
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewCoach;