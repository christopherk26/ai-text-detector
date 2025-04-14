# AI Text Detector

A neural network-based application that distinguishes between human-written and AI-generated text using DistilBERT.

## Overview

This project implements a machine learning model that can classify text as either human-written or AI-generated, served through a web interface. The system provides both binary classification results and confidence scores for its predictions.

## Project Structure

```
ai-text-detector/
├── backend/           # Flask API server
│   ├── app.py        # Main server file
│   └── requirements.txt
└── frontend/         # React + Vite frontend
    ├── src/
    └── package.json
```

## Model Architecture

- Base Model: DistilBERT (lightweight BERT variant)
- Dataset: "dmitva/human_ai_generated_text" from Hugging Face
- Training Data: 5,000 samples (80% training, 20% validation)
- Performance:
  - Accuracy: >99% on validation set
  - High F1 scores, precision, and recall
- Input Processing: Handles texts up to 256 tokens (longer texts processed using sliding window)

## Technical Features

- Binary classification with probability scores
- Sliding window approach for long text processing
- Binary cross-entropy loss for training
- Real-time inference via REST API
- Modern React frontend with Vite

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Model Performance

The model achieves impressive results with:
- Over 99% accuracy on the validation set
- High F1 scores, precision, and recall metrics
- Confidence scoring for predictions

## Output Format

The system provides:
1. Binary classification: "Human-written" or "AI-generated"
2. Confidence score (e.g., "62% likely to be AI-generated")

## Technical Considerations

- Text Length: Maximum 256 tokens per chunk
- Long Text Processing: Implemented through sliding window approach
- Probability Calculation: Uses softmax output from classification head
- Loss Function: Binary cross-entropy

## Future Improvements

- Enhanced sliding window implementation for longer texts
- Additional model performance metrics
- User interface improvements
- API documentation
