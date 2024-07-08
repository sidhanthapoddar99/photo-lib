from flask import Flask, render_template, request, redirect, url_for
import os
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'posts'

@app.route('/')
def index():
    posts = []
    for folder in os.listdir(app.config['UPLOAD_FOLDER']):
        post_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.isdir(post_path):
            images = sorted([f for f in os.listdir(post_path) if f.endswith(('.png', '.jpg', '.jpeg'))])
            posts.append({'id': folder, 'images': images})
    return render_template('index.html', posts=posts)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        images = request.form.getlist('images')
        if images:
            post_id = str(len(os.listdir(app.config['UPLOAD_FOLDER'])) + 1)
            post_folder = os.path.join(app.config['UPLOAD_FOLDER'], post_id)
            os.makedirs(post_folder, exist_ok=True)
            
            for i, image_data in enumerate(images, start=1):
                image_data = image_data.split(',')[1]
                image = Image.open(io.BytesIO(base64.b64decode(image_data)))
                filename = f"{i}{get_extension(image)}"
                image.save(os.path.join(post_folder, filename))
            
            return redirect(url_for('index'))
    return render_template('upload.html')

def get_extension(image):
    if image.format == 'JPEG':
        return '.jpg'
    elif image.format == 'PNG':
        return '.png'
    else:
        return '.jpg'  # Default to jpg if format is unknown

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)