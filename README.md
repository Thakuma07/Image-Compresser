# FileForge

<img width="1920" height="1080" alt="Screenshot (240)" src="https://github.com/user-attachments/assets/f43102de-d13d-4256-8b53-7145d74a37b6" />

FileForge is a clean, modern, and production-style web application for uploading and processing images In-Memory. It allows users to upload images via a drag-and-drop interface, which are then validated, compressed, and processed instantly without storing files on the server.


## Features


- **Drag & Drop Upload**: Intuitive user interface for file selection.
- **In-Memory Processing**: Images are processed in RAM using Python's Pillow library and streamed back instantly. No files are saved to disk.
- **Real-time Progress**: Visual upload progress indicator.
- **Secure Processing**: Robust validation for file types (JPG, PNG) and size limits (5MB).
- **Modern UI**: Aesthetics-first design with glassmorphism effects and responsive layout.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No frameworks)
- **Backend**: Python, Flask
- **Processing**: Pillow (PIL)

## Folder Structure

```
FileForge/
├── frontend/           # Client-side code
│   ├── index.html      # Main UI structure
│   ├── style.css       # Modern styling
│   └── script.js       # Drag & drop and upload logic
│
├── backend/            # Server-side code
│   ├── app.py          # Flask application entry point
│   └── utils/
│       └── validators.py # File validation logic
│
└── README.md           # Project documentation
```

## Setup & Installation

### Prerequisites
- Python 3.x installed

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
pip install flask pillow flask-cors
```

Run the Flask server:

```bash
python app.py
```
The server will start on `http://127.0.0.1:5000`.

### 2. Frontend Setup

Simply open `frontend/index.html` in any modern web browser. 

## Usage

1. Open the application in your browser.
2. Drag and drop a valid image file (.jpg, .png) or click to browse.
3. Watch the upload progress bar.
4. Once processed, click the "Download Compressed Image" button to instantly save your optimized file.

## Design Decisions

- **In-Memory Processing**: Switched to `io.BytesIO` streams to avoid disk I/O, reduce storage cleanup maintenance, and improve speed for a smoother user experience.
- **Vanilla JS**: Chosen to demonstrate core DOM manipulation concepts without the overhead of heavy frameworks like React or Vue.
- **Flask**: Selected for its lightweight nature, making it perfect for microservices like image processing.
