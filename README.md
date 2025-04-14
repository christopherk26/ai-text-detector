# AI Text Detector

A neural network-based application that distinguishes between human-written and AI-generated text using DistilBERT.

## Overview

This project implements a machine learning model that can classify text as either human-written or AI-generated, served through a modern web interface. The system analyzes input text and provides both binary classification results and confidence scores for its predictions, along with text statistics.

## Project Structure

```
ai-text-detector/
├── backend/                   # Flask API server
│   ├── app.py                # Main server file with ML model integration
│   ├── model/                # Pre-trained DistilBERT model files
│   │   ├── config.json
│   │   ├── model.safetensors
│   │   ├── special_tokens_map.json
│   │   ├── tokenizer_config.json
│   │   └── vocab.txt
│   └── requirements.txt      # Python dependencies
└── frontend/                 # Next.js frontend
    ├── app/                  # Next.js app router
    │   ├── api/              # API routes for backend proxy
    │   │   └── detect/       # Proxy endpoint to Flask
    │   │       └── route.js
    │   ├── globals.css       # Global styles
    │   ├── layout.tsx        # App layout
    │   └── page.tsx          # Main page component
    ├── components/           # UI components
    │   └── ui/               # shadcn UI components
    │       ├── alert.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── progress.tsx
    │       └── textarea.tsx
    ├── lib/                  # Utility functions
    │   └── utils.ts
    ├── public/               # Static assets
    └── package.json          # Node.js dependencies
```

## Model Architecture

- **Base Model**: DistilBERT (lightweight BERT variant)
- **Dataset**: "dmitva/human_ai_generated_text" from Hugging Face
- **Training Data**: 5,000 samples (80% training, 20% validation)
- **Performance**:
  - Accuracy: >99% on validation set
  - High F1 scores, precision, and recall
- **Input Processing**: Handles texts up to 256 tokens with sliding window approach for longer texts

## Technical Stack

### Backend
- **Flask**: Lightweight Python web framework
- **HuggingFace Transformers**: For the DistilBERT model implementation
- **PyTorch**: Deep learning framework
- **Flask-CORS**: For handling Cross-Origin Resource Sharing

### Frontend
- **Next.js**: React framework with built-in API routes
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components built on Radix UI
- **TypeScript**: Type-safe JavaScript
- **Lucide React**: Beautifully crafted icons

## Technical Features

- **Binary Classification**: Model classifies text as human-written or AI-generated
- **Confidence Scores**: Provides probability percentage of AI generation
- **Sliding Window Processing**: Handles long texts by breaking them into overlapping chunks
- **Server-Side Proxy**: Next.js API routes proxy requests to Flask to avoid CORS issues
- **Responsive UI**: Clean, modern interface that works on various screen sizes
- **Real-time Feedback**: Loading states and error handling
- **Text Statistics**: Word count and character count metrics

## How It Works

1. **User Interface**: User enters or pastes text into the textarea
2. **API Request Flow**:
   - Frontend sends text to Next.js API route
   - Next.js proxies the request to the Flask backend
   - Flask processes the text through the DistilBERT model
   - Results are sent back through the same path
3. **ML Processing**:
   - Text is tokenized using the DistilBERT tokenizer
   - For texts longer than 256 tokens, a sliding window approach is used
   - Model outputs probability scores using softmax
   - Final classification is determined (AI-generated if probability > 50%)
4. **Results Display**:
   - Binary result (Human-written or AI-generated)
   - Confidence percentage with visual progress bar
   - Text statistics (word and character counts)

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-text-detector.git
cd ai-text-detector

# Setup the backend
cd backend
pip install -r requirements.txt

# Run the Flask server
python app.py
```

### Frontend Setup

```bash
# In another terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev
```

The application will be available at:
- Frontend: http://localhost:4000
- Backend API: http://localhost:5000

## Usage

1. Navigate to http://localhost:4000 in your web browser
2. Enter or paste text into the text area
3. Click the "Analyze Text" button
4. View the results showing classification and confidence score
5. The statistics section provides additional information about the text

## API Endpoints

### `/api/detect` (POST)
- **Input**: JSON object with `text` field containing the text to analyze
- **Output**: JSON object with:
  - `result`: "Human-written" or "AI-generated"
  - `ai_probability`: Float between 0 and 1
  - `ai_percentage`: Float between 0 and 100
  - `stats`: Object containing `word_count` and `character_count`

### `/api/health` (GET)
- **Output**: JSON object with status and model loading information

## Model Performance

The model achieves impressive results with:
- Over 99% accuracy on the validation set
- High F1 scores, precision, and recall metrics
- Confidence scoring for predictions

## Technical Considerations

- **Text Length**: Maximum 256 tokens per chunk
- **Long Text Processing**: Implemented through sliding window with 128-token overlap
- **Probability Calculation**: Uses softmax output from classification head
- **Cross-Origin Communication**: Next.js API routes serve as a proxy to avoid CORS issues
- **Model Size**: The DistilBERT model is a lightweight alternative to BERT, balancing performance and resource usage

## Future Improvements

- **Enhanced sliding window implementation** for longer texts with better context preservation
- **Additional model performance metrics** including confusion matrix and ROC curves
- **User interface improvements** such as history tracking and result sharing
- **Comprehensive API documentation** with Swagger/OpenAPI
- **Expanded text statistics** including readability scores, sentence complexity, etc.
- **Multi-language support** with language detection and appropriate models
- **Deployment options** including Docker containers and cloud deployment guides
- **User authentication** for tracking usage and securing the API

## License

[MIT License](LICENSE)

## Acknowledgements

- HuggingFace for providing the Transformers library and model hosting
- The creators of DistilBERT for the model architecture
- The dataset creators and contributors