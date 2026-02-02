from app import app
from PIL import Image
import io
import os

# Create a dummy image
img = Image.new('RGB', (100, 100), color = 'red')
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr.seek(0)

# Use Flask's test client
client = app.test_client()

data = {
    'file': (img_byte_arr, 'test.jpg')
}

try:
    response = client.post('/upload', data=data, content_type='multipart/form-data')
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.data.decode('utf-8')}")
except Exception as e:
    print(f"Request failed: {e}")
