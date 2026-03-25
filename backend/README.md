# Smart Reader Backend (SR-Backend)

This is the FastAPI backend for the Smart Reader application, designed to assist visually impaired users by converting images (documents/banknotes) to text and then to speech.

## Features

- **Document Analysis**: Converts images of documents into structured, spoken-word-friendly text using Gemini AI.
- **Currency Identification**: Identifies banknotes and their values from images using Gemini AI.
- **Text-to-Speech (TTS)**: Synthesizes text into high-quality audio using Google Cloud Text-to-Speech.

## Prerequisites

- Python 3.9 or higher
- [Google Cloud Account](https://cloud.google.com/) (for Gemini and TTS services)
- A Service Account Key (JSON) for Google Cloud

## Environment Setup

### 1. Create a Virtual Environment
It's recommended to use a virtual environment to manage dependencies:
```bash
python -m venv venv
```

### 2. Activate the Virtual Environment
- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

## Configuration

1. Create a `.env` file by copying the `.env.example` file:
   ```bash
   copy .env.example .env
   ```
2. Open the `.env` file and provide your credentials:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `GOOGLE_APPLICATION_CREDENTIALS`: Absolute path to your Google Cloud service account JSON key file.

## Running the Application

You can start the backend server by running the `main.py` file:

```bash
python main.py
```

The server will start at `http://localhost:8000` with auto-reload enabled.

Alternatively, you can use `uvicorn` directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### 1. Root
- **GET** `/`
  Returns a simple health check message.

### 2. Image to Text
- **POST** `/image-to-text/`
  - **Input**: Image file (multipart/form-data)
  - **Output**: JSON containing the transcribed text.

### 3. Currency Analysis
- **POST** `/cash-to-text/`
  - **Input**: Image file (multipart/form-data)
  - **Output**: JSON containing the identified currency value.

### 4. Text to Speech
- **POST** `/synthesize`
  - **Input**: JSON `{"text": "...", "lang_code": "..."}` (e.g., `lang_code`: `en-US`, `si-LK`)
  - **Output**: MPEG audio stream.

## Project Structure
- `app/`: Main application logic.
  - `api/`: API route definitions.
  - `core/`: Configuration and settings.
  - `services/`: External service integrations (Gemini, Google Cloud).
- `main.py`: Application entry point.
- `requirements.txt`: Python dependencies.
