
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GroundingChunk } from '../types';
import BuildingIcon from './icons/BuildingIcon';
import Loader from './Loader';
import LinkIcon from './icons/LinkIcon';

interface CompanyInsightsProps {
    jobDescription: string;
}

const CompanyInsights: React.FC<CompanyInsightsProps> = ({ jobDescription }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<string | null>(null);
    const [sources, setSources] = useState<GroundingChunk[]>([]);

    const fetchInsights = async () => {
        setIsLoading(true);
        setError(null);
        setInsights(null);
        setSources([]);

        try {
            // FIX: Use process.env.API_KEY as per the coding guidelines for API key management.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on the provided job description, act as a research analyst and give me a concise briefing on the company for interview preparation. Use web search to find the latest information. Structure your response with the following markdown headers:

### Mission & Business
(A summary of the company's mission and primary business.)

### Company Culture
(A brief overview of the company culture, key values, and work environment.)

### Key Projects
(A bulleted list of 2-3 significant or recent projects created by the company with a brief description for each.)

Keep the entire response professional and easy to digest.

Job Description:
${jobDescription}`,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const rawText = response.text;
            // Remove markdown ### from headers
            const cleanedText = rawText.replace(/### /g, '');
            setInsights(cleanedText);
            
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks) {
                // Fix: Filter for valid web sources and map to the local GroundingChunk type to resolve type mismatch.
                const validSources = groundingChunks
                    .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
                    .map(chunk => ({
                        web: {
                            uri: chunk.web.uri as string,
                            title: chunk.web.title as string,
                        }
                    }));
                setSources(validSources);
            }
        } catch (e) {
            console.error(e);
            setError("Sorry, I couldn't fetch company insights at the moment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <Loader />
                    <p className="text-secondary dark:text-dark-secondary animate-pulse">Researching company...</p>
                </div>
            );
        }

        if (error) {
            return <p className="text-red-500 text-center py-8">{error}</p>;
        }

        if (insights) {
            return (
                <div className="text-secondary dark:text-dark-secondary whitespace-pre-wrap leading-relaxed text-sm">
                    {insights.split('\n\n').map((paragraph, pIndex) => (
                        <div key={pIndex} className="mb-4">
                            {paragraph.split('\n').map((line, lIndex) => {
                                if (line.startsWith('Mission & Business') || line.startsWith('Company Culture') || line.startsWith('Key Projects')) {
                                    return <h4 key={lIndex} className="font-bold text-primary dark:text-dark-primary text-base mb-2">{line}</h4>
                                }
                                return <p key={lIndex}>{line}</p>;
                            })}
                        </div>
                    ))}
                    {sources.length > 0 && (
                        <div className="mt-6 border-t border-border-color dark:border-dark-border pt-4">
                            <h4 className="font-semibold text-primary dark:text-dark-primary flex items-center gap-2 mb-2 text-base">
                                <LinkIcon />
                                Sources from the Web
                            </h4>
                            <ul className="space-y-2 list-disc list-inside text-sm">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a 
                                            href={source.web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-accent hover:text-accent-hover transition-colors underline decoration-dotted break-all"
                                        >
                                            {source.web.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="text-center py-8">
                <p className="text-secondary dark:text-dark-secondary mb-4 max-w-md mx-auto">Get up-to-date information about the company's culture, mission, and recent projects.</p>
                <button
                    onClick={fetchInsights}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2 font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-opacity duration-300 shadow-sm"
                >
                    Research Company
                </button>
            </div>
        );
    }

    return (
        <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                 <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <BuildingIcon />
                </div>
                <h3 className="text-lg font-bold text-primary dark:text-dark-primary">Pre-Interview Briefing</h3>
            </div>
            {renderContent()}
        </div>
    );
};

export default CompanyInsights;
