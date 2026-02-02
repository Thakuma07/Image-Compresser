import os
from PIL import Image

# Allowed extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
# Max file size in bytes (5 MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

def validate_file_type(filename):
    """
    Checks if the file has an allowed extension.
    
    Args:
        filename (str): The name of the file to check.
        
    Returns:
        bool: True if valid, False otherwise.
    """
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def validate_file_size(file_storage):
    """
    Checks if the file is within the size limit.
    Note: specific handling might be needed depending on how file is read.
    Here we assume we can seek to end to get length or rely on content_length if available.
    
    Args:
        file_storage: The werkzeug FileStorage object.
        
    Returns:
        bool: True if valid size, False otherwise.
    """
    # Check if content_length is available (it usually is from Content-Length header)
    # However, to be safe, we can seek to end to get actual size
    file_storage.seek(0, os.SEEK_END)
    size = file_storage.tell()
    file_storage.seek(0) # Reset cursor
    
    return size <= MAX_FILE_SIZE

def is_valid_image(file_storage):
    """
    Verifies that the file is actually a valid image using Pillow.
    
    Args:
        file_storage: The werkzeug FileStorage object.
        
    Returns:
        bool: True if it opens as an image, False otherwise.
    """
    try:
        image = Image.open(file_storage)
        image.verify() # Verify if it's broken or not
        file_storage.seek(0) # Reset cursor after reading
        return True
    except (IOError, SyntaxError):
        return False
