from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
import os
from PIL import Image
import io
import base64
import json
import logging

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/posts'
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    posts = []
    for folder in os.listdir(app.config['UPLOAD_FOLDER']):
        post_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.isdir(post_path):
            images = sorted([f for f in os.listdir(post_path) if f.endswith(('.png', '.jpg', '.jpeg'))])
            posts.append({'id': folder, 'images': images})
    logging.debug(f"Posts found: {posts}")
    return render_template('index.html', posts=posts)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        images_data = request.form.get('images')
        logging.debug(f"Received images data: {images_data[:100]}...")  # Log the first 100 characters

        try:
            images_list = json.loads(images_data)
            logging.debug(f"Number of images received: {len(images_list)}")

            if images_list:
                post_id = str(len(os.listdir(app.config['UPLOAD_FOLDER'])) + 1)
                post_folder = os.path.join(app.config['UPLOAD_FOLDER'], post_id)
                os.makedirs(post_folder, exist_ok=True)
                
                for i, image_data in enumerate(images_list, start=1):
                    try:
                        if ',' in image_data:
                            image_data = image_data.split(',')[1]
                        image = Image.open(io.BytesIO(base64.b64decode(image_data)))
                        filename = f"{i}{get_extension(image)}"
                        image_path = os.path.join(post_folder, filename)
                        image.save(image_path)
                        logging.debug(f"Saved image {i} to {image_path}")
                    except Exception as e:
                        logging.error(f"Error processing image {i}: {str(e)}")
                
                logging.debug(f"Finished processing post {post_id}")
                return redirect(url_for('index'))
            else:
                logging.warning("No images received in the request")
        except json.JSONDecodeError:
            logging.error("Failed to parse JSON data")
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")

    return render_template('upload.html')

def get_extension(image):
    if image.format == 'JPEG':
        return '.jpg'
    elif image.format == 'PNG':
        return '.png'
    else:
        return '.jpg'  # Default to jpg if format is unknown

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


def get_post_details():
    posts = {}
    for folder in os.listdir(app.config['UPLOAD_FOLDER']):
        post_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.isdir(post_path):
            images = sorted([f for f in os.listdir(post_path) if f.endswith(('.png', '.jpg', '.jpeg'))])
            posts[folder] = {'id': folder, 'images': images}
    logging.debug(f"Posts found: {posts}")
    return posts

@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    posts = get_post_details()
    post = posts.get(post_id)
    if post:
        return jsonify(post)
    else:
        return jsonify({'error': 'Post not found'}), 404


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)