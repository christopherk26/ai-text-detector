'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, FileText, Check, BrainCircuit, Code, Server, Database, Cpu, GitBranch, BarChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
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
            Paste your text below to analyze it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter or paste text here..."
            className="min-h-[200px] mb-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={analyzeText} 
            disabled={loading || !text.trim()}
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Classification</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.result === "AI-generated" 
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                }`}>
                  {result.result === "AI-generated" ? (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      AI-Generated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Human-Written
                    </span>
                  )}
                </span>
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
                <div className="flex justify-end text-sm font-medium">
                  {result.ai_percentage}% likely to be AI-generated
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

      {/* Project Technologies & Development Section */}
      <Card>
        <CardHeader>
          <CardTitle>About This Project</CardTitle>
          <CardDescription>
            How this AI Text Detector works and the technologies behind it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* AI Model Detail Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 pb-2 border-b">
              <BrainCircuit className="h-6 w-6 text-primary" />
              Machine Learning Model Details
            </h3>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                DistilBERT: A Lightweight Language Model
              </h4>
              <p className="text-muted-foreground">
                This application uses DistilBERT, a condensed version of BERT (Bidirectional Encoder Representations from Transformers) 
                that retains 97% of BERT's language understanding capabilities while being 40% smaller and 60% faster. DistilBERT 
                was created through a process called knowledge distillation, where a smaller model is trained to mimic a larger, more 
                powerful model.
              </p>
              <p className="text-muted-foreground">
                Key advantages of DistilBERT include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Reduced model size (66 million parameters vs. BERT's 110 million)</li>
                <li>Faster inference time while maintaining high accuracy</li>
                <li>Lower computational resource requirements</li>
                <li>Ability to run efficiently in production environments</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Tokenization Process
              </h4>
              <p className="text-muted-foreground">
                Before processing text through the model, it must first be tokenized. Tokenization is the process of 
                breaking text into smaller units (tokens) that the model can understand. DistilBERT uses a WordPiece tokenizer that 
                works as follows:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-4">
                <li>Split text into basic units (words, punctuation)</li>
                <li>Break words into subwords based on a pre-defined vocabulary</li>
                <li>Add special tokens: [CLS] at the beginning and [SEP] at the end</li>
                <li>Convert tokens to numeric IDs using a vocabulary lookup</li>
                <li>Generate attention masks to indicate which tokens are padding</li>
              </ol>
              <p className="text-muted-foreground mt-2">
                For example, the word "unbelievable" might be broken down into "un", "##believe", and "##able". 
                This subword tokenization allows the model to understand parts of words it hasn't seen before and helps with handling rare words.
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm font-medium mb-2">Example Tokenization:</p>
                <p className="text-sm font-mono text-muted-foreground">
                  Input: "AI detection is important"<br/>
                  Tokens: ["[CLS]", "ai", "detection", "is", "important", "[SEP]"]<br/>
                  Token IDs: [101, 1140, 6876, 1110, 1924, 102]
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Training and Fine-tuning
              </h4>
              <p className="text-muted-foreground">
                Our model was fine-tuned on the "dmitva/human_ai_generated_text" dataset from Hugging Face, which contains pairs of 
                human-written and AI-generated texts. We used a subset of 5,000 samples to create a balanced training dataset.
              </p>
              <p className="text-muted-foreground">
                The training process involved:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Splitting data into 80% training and 20% validation sets</li>
                <li>Fine-tuning the pre-trained DistilBERT model for binary classification</li>
                <li>Using binary cross-entropy loss function to optimize the model</li>
                <li>Training for one epoch with a learning rate of 3e-5</li>
                <li>Evaluating with accuracy, precision, recall, and F1 metrics</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                The model achieved over 99% accuracy on the validation set, demonstrating its effectiveness at 
                distinguishing between human and AI-generated content.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Sliding Window Approach for Long Texts
              </h4>
              <p className="text-muted-foreground">
                Because transformer models like DistilBERT have a maximum input length (typically 512 tokens), we implemented 
                a sliding window approach to handle longer texts. Here's how it works:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-4">
                <li>For texts under 256 tokens, process the entire text at once</li>
                <li>For longer texts, divide into overlapping windows of 256 tokens each</li>
                <li>Use a consistent 128-token overlap between adjacent windows</li>
                <li>Process each window separately through the model</li>
                <li>Average the probability scores from all windows for the final prediction</li>
              </ol>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm font-medium mb-2">Example for a 300-token text:</p>
                <p className="text-sm text-muted-foreground">
                  • Window 1: Tokens 0-255 (first 256 tokens)<br/>
                  • Window 2: Tokens 128-299 (remaining 172 tokens)<br/>
                  • Final score: Average of probabilities from both windows
                </p>
              </div>
              <p className="text-muted-foreground mt-2">
                This approach ensures that no content is missed and that context at window boundaries is properly captured, as each 
                boundary appears in multiple windows. It also helps maintain accuracy for long documents that would otherwise 
                exceed the model's capacity.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Inference and Classification
              </h4>
              <p className="text-muted-foreground">
                When analyzing text, the model processes the tokenized input and outputs logits (raw prediction scores). These 
                logits are then transformed using a softmax function to produce probabilities between 0 and 1, where:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Values close to 0 indicate human-written text</li>
                <li>Values close to 1 indicate AI-generated text</li>
                <li>The decision boundary is 0.5 (50%)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                The final classification uses this probability to determine whether the text is more likely to be human-written or 
                AI-generated. The confidence score displayed in the results is simply this probability expressed as a percentage.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Backend Architecture
            </h3>
            <p className="text-muted-foreground">
              The backend is built with Flask, a lightweight Python web framework, and integrates with HuggingFace's Transformers library to provide ML capabilities. The server exposes REST API endpoints for text analysis and health monitoring.
            </p>
            <p className="text-muted-foreground">
              Key components include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Flask for API routing</li>
              <li>HuggingFace Transformers for ML model hosting</li>
              <li>PyTorch as the underlying ML framework</li>
              <li>Flask-CORS for handling cross-origin requests</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Frontend Implementation
            </h3>
            <p className="text-muted-foreground">
              The frontend is built with Next.js and modern React patterns, featuring a clean UI powered by Tailwind CSS and shadcn/ui components. It includes real-time feedback, error handling, and a responsive design.
            </p>
            <p className="text-muted-foreground">
              Key technologies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Next.js for React framework and API routing</li>
              <li>TypeScript for type safety</li>
              <li>Tailwind CSS for utility-first styling</li>
              <li>shadcn/ui for high-quality UI components</li>
              <li>Lucide React for beautiful icons</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Flow
            </h3>
            <p className="text-muted-foreground">
              When you submit text for analysis, the following process occurs:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-4">
              <li>Your text is sent from the browser to a Next.js API route</li>
              <li>The API route forwards the request to the Flask backend</li>
              <li>The backend processes the text through the DistilBERT model</li>
              <li>The model calculates an AI probability score using softmax</li>
              <li>Results are returned to the frontend and displayed in the UI</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              This architecture solves cross-origin issues by using server-side proxy communication between the Next.js server and Flask backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}