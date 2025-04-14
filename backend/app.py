# /backend/app.py

# Update these lines in your app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import DistilBertForSequenceClassification, DistilBertTokenizer
import torch
import numpy as np

app = Flask(__name__)
# More explicit CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Load model
print("Loading model...")
try:
    tokenizer = DistilBertTokenizer.from_pretrained('./model')
    model = DistilBertForSequenceClassification.from_pretrained('./model')
    model.eval()  # Set model to evaluation mode
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    # Continue without model for testing API endpoints

# Function to process text with sliding window for long texts
def process_text_with_sliding_window(text, window_size=256, overlap=128):
    # Tokenize the entire text
    tokens = tokenizer.tokenize(text)
    
    # If text is shorter than window size, just process it directly
    if len(tokens) <= window_size:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=window_size)
        with torch.no_grad():
            outputs = model(**inputs)
            temperature = 2
            predictions = torch.softmax(outputs.logits / temperature, dim=-1)
        return predictions[0][1].item()  # Return AI probability
    
    # For longer texts, use sliding window
    windows = []
    for i in range(0, len(tokens), window_size - overlap):
        window_tokens = tokens[i:i + window_size]
        if len(window_tokens) < window_size / 2:  # Skip very small final windows
            continue
        window_text = tokenizer.convert_tokens_to_string(window_tokens)
        windows.append(window_text)
    
    # Process each window
    probabilities = []
    for window_text in windows:
        inputs = tokenizer(window_text, return_tensors="pt", padding=True, truncation=True, max_length=window_size)
        with torch.no_grad():
            outputs = model(**inputs)
            temperature = 2.0
            predictions = torch.softmax(outputs.logits / temperature, dim=-1)
        probabilities.append(predictions[0][1].item())
    
    # Return the average probability
    return np.mean(probabilities) if probabilities else 0.5

@app.route('/api/detect', methods=['POST'])
def detect_ai_text():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Process text with sliding window approach
        ai_probability = process_text_with_sliding_window(text)
        ai_percentage = round(ai_probability * 100, 2)
        
        # Get stats about the text
        word_count = len(text.split())
        char_count = len(text)
        
        return jsonify({
            'result': "AI-generated" if ai_probability > 0.5 else "Human-written",
            'ai_probability': ai_probability,
            'ai_percentage': ai_percentage,
            'stats': {
                'word_count': word_count,
                'character_count': char_count
            }
        })
    except Exception as e:
        return jsonify({'error': f'Error processing text: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})



# Add this new endpoint to your /backend/app.py file

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


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)