import os
import io
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
from utils.validators import validate_file_type, validate_file_size, is_valid_image

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handle file upload, validation, compression, and direct streaming response.
    Everything happens in memory (RAM), no files are saved to disk.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    # 1. Validate File Type
    if not validate_file_type(file.filename):
        return jsonify({'error': 'Invalid file type. Only JPG, JPEG, and PNG files are allowed.'}), 415

    # 2. Validate File Size
    # Note: Flask request.files are usually streamed or spooled.
    # To check size reliably without saving, we can check Content-Length header 
    # OR read the file into memory (if safe) or checking the spool size.
    # Our validator uses seek(0, os.SEEK_END) which works on the file object.
    if not validate_file_size(file):
        return jsonify({'error': 'File size exceeds 5 MB limit.'}), 413

    # 3. Validate Image Integrity
    if not is_valid_image(file):
         return jsonify({'error': 'Invalid image file. The file is corrupted or not an image.'}), 400

    try:
        # Secure filename
        original_filename = secure_filename(file.filename)
        filename_only, ext = os.path.splitext(original_filename)
        ext = ext.lower()
        
        # Prepare in-memory binary stream
        img_io = io.BytesIO()
        
        # Process Image in Memory
        # 'file' is at the beginning because is_valid_image resets it
        with Image.open(file) as img:
            # Convert RGBA to RGB if saving as JPEG
            if img.mode in ('RGBA', 'P') and ext in ['.jpg', '.jpeg']:
                img = img.convert('RGB')
            
            # Compress and save to BytesIO object
            img.save(img_io, format='JPEG' if ext in ['.jpg', '.jpeg'] else 'PNG', optimize=True, quality=60)
            
        # Reset cursor of the output stream to the beginning
        img_io.seek(0)
        
        # Generate a nice filename for download
        download_filename = f"compressed_{filename_only}{ext}"

        # Send the file directly back to the client
        return send_file(
            img_io, 
            mimetype=f'image/{ext.replace(".", "")}',
            as_attachment=True,
            download_name=download_filename
        )

    except Exception as e:
        return jsonify({'error': f'An internal error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
