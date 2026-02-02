const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseLink = document.querySelector('.browse-link');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const fileNameDisplay = document.getElementById('file-name');
const messageContainer = document.getElementById('message-container');
const messageText = document.getElementById('message-text');
const downloadContainer = document.getElementById('download-container');
const downloadBtn = document.getElementById('download-btn');

const UPLOAD_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://127.0.0.1:5000/upload'
    : '/upload'; // Relative path for Vercel deployment

// Allowed file types and size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Store the blob URL to revoke it later
let currentDownloadUrl = null;

// Event Listeners
browseLink.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Drag & Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('drag-over');
}

function unhighlight(e) {
    dropZone.classList.remove('drag-over');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];

    resetUI();

    if (validateFile(file)) {
        uploadFile(file);
    }
}

function validateFile(file) {
    // Validate Type
    if (!ALLOWED_TYPES.includes(file.type)) {
        showMessage('Invalid file type. Only JPG, JPEG, and PNG are allowed.', 'error');
        return false;
    }

    // Validate Size
    if (file.size > MAX_SIZE) {
        showMessage('File size exceeds 5MB limit.', 'error');
        return false;
    }

    return true;
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // Important: Set responseType to blob to handle binary data
    xhr.responseType = 'blob';

    // Progress Handler
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            updateProgress(percentComplete);
        }
    });

    // Load Handler
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Success! We received a binary file (blob)
            handleSuccess(xhr.response, file.name);
        } else {
            // Error: Response is likely a JSON error message, but it comes as a blob
            // We need to read the blob to get the text
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const response = JSON.parse(reader.result);
                    showMessage(response.error || 'An error occurred during upload.', 'error');
                } catch (e) {
                    showMessage('An unknown error occurred.', 'error');
                }
            };
            reader.readAsText(xhr.response);

            progressContainer.classList.add('hidden');
        }
    };

    // Error Handler
    xhr.onerror = function () {
        showMessage('Network error. Is the backend server running?', 'error');
        progressContainer.classList.add('hidden');
    };

    // Setup UI for upload
    fileNameDisplay.textContent = file.name;
    progressContainer.classList.remove('hidden');

    xhr.open('POST', UPLOAD_URL, true);
    xhr.send(formData);
}

function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
}

function handleSuccess(blob, originalFilename) {
    showMessage('File processed successfully!', 'success');

    // Create a URL for the blob
    if (currentDownloadUrl) {
        URL.revokeObjectURL(currentDownloadUrl);
    }
    currentDownloadUrl = URL.createObjectURL(blob);

    // Determine extension based on MIME type or default to jpg
    const extension = blob.type === 'image/png' ? '.png' : '.jpg';
    const filenameBase = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
    const downloadName = `compressed_${filenameBase}${extension}`;

    // Update Download Button
    downloadBtn.href = currentDownloadUrl;
    downloadBtn.download = downloadName;
    downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16M12 12V3M12 3L8 7M12 3L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Download Compressed Image
    `;

    downloadContainer.classList.remove('hidden');
}

function showMessage(text, type) {
    messageText.textContent = text;
    messageContainer.className = 'message-container'; // Reset classes
    messageContainer.classList.add(`message-${type}`);
    messageContainer.classList.remove('hidden');
}

function resetUI() {
    messageContainer.classList.add('hidden');
    downloadContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    fileInput.value = ''; // Reset input
}
