# /backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import DistilBertForSequenceClassification, DistilBertTokenizer
import torch
import numpy as np
import time

app = Flask(__name__)
# More explicit CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Load model
print("Loading improved model...")
try:
    tokenizer = DistilBertTokenizer.from_pretrained('./improved_ai_detector_model')
    model = DistilBertForSequenceClassification.from_pretrained('./improved_ai_detector_model')
    model.eval()  # Set model to evaluation mode
    
    # Move model to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    print(f"Model loaded successfully on {device}!")
except Exception as e:
    print(f"Error loading model: {e}")
    # Continue without model for testing API endpoints

# Function to process text with sliding window for long texts
def process_text_with_sliding_window(text, window_size=512, overlap=256, temperature=2.0):
    start_time = time.time()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Get text length metrics
    word_count = len(text.split())
    char_count = len(text)
    
    # Tokenize the entire text
    tokens = tokenizer.tokenize(text)
    token_count = len(tokens)
    
    # If text is shorter than window size, just process it directly
    if token_count <= window_size:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=window_size)
        # Move inputs to the same device as the model
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.softmax(outputs.logits / temperature, dim=-1)
        
        human_prob = predictions[0][0].item()
        ai_prob = predictions[0][1].item()
        
        windows_info = [{
            "text": text[:100] + "..." if len(text) > 100 else text,
            "tokens": token_count,
            "human_prob": human_prob,
            "ai_prob": ai_prob
        }]
        
        return {
            "result": "AI-generated" if ai_prob > human_prob else "Human-written",
            "human_probability": human_prob,
            "ai_probability": ai_prob,
            "human_percentage": round(human_prob * 100, 2),
            "ai_percentage": round(ai_prob * 100, 2),
            "confidence": round(max(human_prob, ai_prob) * 100, 2),
            "processing_time": round(time.time() - start_time, 3),
            "windows_used": 1,
            "windows_info": windows_info,
            "stats": {
                "word_count": word_count,
                "character_count": char_count,
                "token_count": token_count
            }
        }
    
    # For longer texts, use sliding window
    windows = []
    window_texts = []
    
    for i in range(0, token_count, window_size - overlap):
        window_tokens = tokens[i:i + window_size]
        if len(window_tokens) < window_size / 2:  # Skip very small final windows
            continue
        window_text = tokenizer.convert_tokens_to_string(window_tokens)
        windows.append(window_tokens)
        window_texts.append(window_text)
    
    # Process each window
    human_probs = []
    ai_probs = []
    windows_info = []
    
    for idx, window_text in enumerate(window_texts):
        inputs = tokenizer(window_text, return_tensors="pt", padding=True, truncation=True, max_length=window_size)
        # Move inputs to the same device as the model
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.softmax(outputs.logits / temperature, dim=-1)
        
        human_prob = predictions[0][0].item()
        ai_prob = predictions[0][1].item()
        
        human_probs.append(human_prob)
        ai_probs.append(ai_prob)
        
        # Create window info for diagnostics
        windows_info.append({
            "window_num": idx + 1,
            "text": window_text[:100] + "..." if len(window_text) > 100 else window_text,
            "tokens": len(windows[idx]),
            "human_prob": human_prob,
            "ai_prob": ai_prob
        })
    
    # Calculate final probabilities
    # Use weighted average based on window size
    window_sizes = [len(w) for w in windows]
    total_size = sum(window_sizes)
    weights = [size / total_size for size in window_sizes]
    
    weighted_human_prob = sum(p * w for p, w in zip(human_probs, weights))
    weighted_ai_prob = sum(p * w for p, w in zip(ai_probs, weights))
    
    # Normalize to ensure they sum to 1
    total_prob = weighted_human_prob + weighted_ai_prob
    weighted_human_prob = weighted_human_prob / total_prob
    weighted_ai_prob = weighted_ai_prob / total_prob
    
    return {
        "result": "AI-generated" if weighted_ai_prob > weighted_human_prob else "Human-written",
        "human_probability": weighted_human_prob,
        "ai_probability": weighted_ai_prob,
        "human_percentage": round(weighted_human_prob * 100, 2),
        "ai_percentage": round(weighted_ai_prob * 100, 2),
        "confidence": round(max(weighted_human_prob, weighted_ai_prob) * 100, 2),
        "processing_time": round(time.time() - start_time, 3),
        "windows_used": len(windows),
        "windows_info": windows_info,
        "stats": {
            "word_count": word_count,
            "character_count": char_count,
            "token_count": token_count
        }
    }

@app.route('/api/detect', methods=['POST'])
def detect_ai_text():
    data = request.json
    text = data.get('text', '')
    
    # Get temperature parameter, use default if not provided
    temperature = float(data.get('temperature', 2.0))
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Process text with sliding window approach
        result = process_text_with_sliding_window(text, temperature=temperature)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Error processing text: {str(e)}'}), 500

@app.route('/api/tokenize', methods=['POST'])
def tokenize_text():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Tokenize the text using the DistilBERT tokenizer
        tokens = tokenizer.tokenize(text)
        
        # Convert tokens to token IDs
        token_ids = tokenizer.convert_tokens_to_ids(tokens)
        
        # Get the full encoded representation (including special tokens)
        encoded = tokenizer.encode_plus(
            text, 
            add_special_tokens=True,
            padding=False,
            truncation=True,
            max_length=512,
            return_attention_mask=True
        )
        
        # Extract the full token IDs (with special tokens)
        full_token_ids = encoded['input_ids']
        
        # Get the full tokens (with special tokens)
        full_tokens = tokenizer.convert_ids_to_tokens(full_token_ids)
        
        # Get the attention mask
        attention_mask = encoded['attention_mask']
        
        # Count words for stats
        words = text.split()
        
        return jsonify({
            'tokens': tokens,
            'token_ids': token_ids,
            'full_tokens': full_tokens,
            'full_token_ids': full_token_ids,
            'attention_mask': attention_mask,
            'stats': {
                'token_count': len(tokens),
                'word_count': len(words)
            }
        })
    except Exception as e:
        return jsonify({'error': f'Error tokenizing text: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return jsonify({
        'status': 'ok', 
        'model_loaded': model is not None,
        'model_name': 'Improved AI Text Detector',
        'device': str(device)
    })

@app.route('/api/info', methods=['GET'])
def model_info():
    return jsonify({
        'model_name': 'Improved AI Text Detector',
        'model_type': 'DistilBERT',
        'dataset': 'NabeelShar/ai_and_human_text',
        'dataset_size': '46,000+ examples',
        'features': [
            'Trained on balanced human and AI texts',
            'Uses sliding window for long texts',
            'Provides confidence scores and window analysis',
            'Supports temperature adjustment for probability calibration'
        ],
        'max_tokens': 512,
        'default_temperature': 2.0
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)