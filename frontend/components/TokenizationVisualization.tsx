// Create this file at: frontend/components/TokenizationVisualization.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Code, Hash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TokenizationProps {
  text: string;
}

interface TokenResult {
  tokens: string[];
  token_ids: number[];
  full_tokens: string[];
  full_token_ids: number[];
  attention_mask: number[];
  stats: {
    token_count: number;
    word_count: number;
  };
}

export default function TokenizationVisualization({ text }: TokenizationProps) {
  const [tokenData, setTokenData] = useState<TokenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchTokenization = async () => {
    if (!text.trim()) {
      setError('No text to tokenize');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to tokenize text: ${response.status}`);
      }
      
      const data = await response.json();
      setTokenData(data);
      setExpanded(true);
    } catch (err) {
      setError('Error getting tokens. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate random pastel colors for token highlighting
  const getTokenColor = (token: string) => {
    // Generate a deterministic but seemingly random color based on the token string
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = token.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate pastel colors
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 70%, 80%, 0.7)`;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Tokenization Visualization
        </CardTitle>
        <CardDescription>
          See how the DistilBERT tokenizer processes your text
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!tokenData && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Click the button below to see how your text would be tokenized by the DistilBERT model
            </p>
            <Button 
              onClick={fetchTokenization} 
              disabled={loading || !text.trim()}
            >
              {loading ? 'Processing...' : 'Visualize Tokenization'}
            </Button>
          </div>
        )}

        {tokenData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Text Tokenization</h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary">
                {tokenData.stats.token_count} tokens / {tokenData.stats.word_count} words
              </span>
            </div>

            {/* Tokens with special tokens (CLS, SEP) */}
            <div className="space-y-2">
              <h4 className="text-md font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Complete Token Sequence (with special tokens)
              </h4>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <div className="flex flex-wrap gap-1 font-mono text-sm">
                  {tokenData.full_tokens.map((token, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col items-center border rounded px-2 py-1"
                      style={{
                        backgroundColor: ['[CLS]', '[SEP]', '[PAD]'].includes(token) 
                          ? 'rgba(200, 200, 200, 0.3)' 
                          : getTokenColor(token)
                      }}
                    >
                      <span>{token}</span>
                      <span className="text-xs opacity-70">{tokenData.full_token_ids[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed explanation */}
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm mb-2 font-medium">How DistilBERT Tokenization Works:</p>
              <ol className="text-sm list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Special tokens like [CLS] and [SEP] are added at the beginning and end</li>
                <li>Words are split into subwords (tokens) based on frequency</li>
                <li>Tokens starting with "##" are continuations of the previous word</li>
                <li>Each token is assigned a numeric ID from the vocabulary</li>
                <li>These token IDs are what the model actually processes</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {tokenData && (
          <Button 
            variant="outline" 
            onClick={() => setTokenData(null)}
          >
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}