'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, FileText, Check, HelpCircle, AlertTriangle, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TokenizationVisualization from '@/components/TokenizationVisualization';
import ModelExplanation from '@/components/ModelExplanation';

// Define confidence categories with their ranges and explanations
const confidenceCategories = {
  "Definitely Human": {
    range: [0, 20],
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    icon: <Check className="h-4 w-4" />,
    explanation: "The text shows strong indicators of human authorship with very high confidence."
  },
  "Likely Human": {
    range: [20, 40],
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
    icon: <Check className="h-4 w-4" />,
    explanation: "The text likely has human authorship, but shows some patterns that could be AI-like."
  },
  "Uncertain": {
    range: [40, 60],
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    icon: <HelpCircle className="h-4 w-4" />,
    explanation: "The model is uncertain about authorship. The text has mixed characteristics of both human and AI writing."
  },
  "Likely AI": {
    range: [60, 80],
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    icon: <AlertTriangle className="h-4 w-4" />,
    explanation: "The text likely has AI authorship, showing many patterns typical of AI-generated content."
  },
  "Definitely AI": {
    range: [80, 100],
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500",
    icon: <AlertCircle className="h-4 w-4" />,
    explanation: "The text shows strong indicators of AI generation with very high confidence."
  }
};

// Simple tooltip component
const Tooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block"
         onMouseEnter={() => setIsVisible(true)}
         onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 text-sm bg-black text-white rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
          {content}
          <div className="absolute w-3 h-3 bg-black transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<null | {
    result: string;
    ai_probability: number;
    ai_percentage: number;
    stats: {
      word_count: number;
      character_count: number;
    }
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to count words in text
  const countWords = (text: string): number => {
    // Remove extra whitespace and split by spaces
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Function to get confidence category based on AI percentage
  const getConfidenceCategory = (aiPercentage: number) => {
    for (const [category, details] of Object.entries(confidenceCategories)) {
      const [min, max] = details.range;
      if (aiPercentage >= min && aiPercentage <= max) {
        return { category, details };
      }
    }
    return { 
      category: "Uncertain", 
      details: confidenceCategories["Uncertain"] 
    };
  };

  const analyzeText = async () => {
    // Check if text is empty
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    // Check word count
    const wordCount = countWords(text);
    if (wordCount < 100) {
      setError(`Please enter at least 100 words for accurate analysis. Current word count: ${wordCount}`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending request with text:', text.substring(0, 100) + '...');
      // Use the Next.js API route as a proxy
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server response: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to analyze text: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error connecting to the server. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-2">AI Text Detector</h1>
      <p className="text-center text-muted-foreground mb-8">
        Analyze text to determine if it was written by a human or generated by AI. Final Project by Christopher K for CS4200.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Text Analysis</CardTitle>
          <CardDescription>
            Paste your text below to analyze it (minimum 100 words for accurate results)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter or paste text here..."
            className="min-h-[200px] mb-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            Word count: {countWords(text)} {countWords(text) < 100 && 
              <span className="text-destructive">(minimum 100 words required)</span>
            }
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={analyzeText} 
            disabled={loading || !text.trim() || countWords(text) < 100}
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Our AI model has analyzed your text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {/* Display confidence category instead of binary result */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Classification</h3>
                {(() => {
                  const { category, details } = getConfidenceCategory(result.ai_percentage);
                  return (
                    <Tooltip content={details.explanation}>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${details.color} cursor-help`}>
                        {details.icon}
                        {category}
                        <HelpCircle className="h-3 w-3 ml-1 opacity-70" />
                      </span>
                    </Tooltip>
                  );
                })()}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Human</span>
                  <span>AI</span>
                </div>
                <Progress 
                  value={result.ai_percentage} 
                  className="h-2" 
                />
                <div className="flex justify-between text-sm font-medium">
                  <span>{Math.round((100 - result.ai_percentage) * 100) / 100}% human-like</span>
                  <span>{Math.round(result.ai_percentage * 100) / 100}% AI-like</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-3">Text Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="text-lg font-medium">{result.stats.word_count}</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Character Count</p>
                    <p className="text-lg font-medium">{result.stats.character_count}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Tokenization Visualization Component */}
      {text.trim() && <TokenizationVisualization text={text} />}

      {/* Project Technologies & Development Section */}
      <Card>
        <CardHeader>
          <CardTitle>About This Project</CardTitle>
          <CardDescription>
            How this AI Text Detector works and the technologies behind it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Using our new ModelExplanation component */}
          <ModelExplanation />
        </CardContent>
      </Card>
    </div>
  );
}