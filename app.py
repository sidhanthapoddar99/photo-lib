from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
import os
from PIL import Image
import io
import base64
import json
import logging



routes_of_all_volts = {
                        "Secure": 'static/posts',
                        "Locked" : 'static/posts_nsfw'
                    }

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = routes_of_all_volts["Secure"]
logging.basicConfig(level=logging.DEBUG)
passaword_69 = "69"

@app.route('/')
def index():
    posts = []
    folders = os.listdir(app.config['UPLOAD_FOLDER'])
    folders.sort(key=lambda x: int(x), reverse=True )
    for folder in folders:
        post_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.isdir(post_path):
            images = sorted([f for f in os.listdir(post_path) if f.endswith(('.png', '.jpg', '.jpeg'))])
            posts.append({'id': folder, 'images': images})
    logging.debug(f"Posts found: {posts}")
    return render_template('index.html', posts=posts, voltname=str(app.config['UPLOAD_FOLDER']).lstrip("static/"))

##################################################################################################################
###################################### Volt and Secure ###########################################################
##################################################################################################################


@app.route('/secure_volt/', methods=['GET', 'POST'])
def secure_volt():
    
    if request.method == 'POST':
        
        password = request.form.get('Password')
        print(password)
        if password == passaword_69:
            app.config['UPLOAD_FOLDER'] = routes_of_all_volts["Locked"]
        
        return redirect(url_for('index'))
    
    return render_template('secure.html')


@app.route('/lock_volt/', methods=['GET'])
def lock_volt():
    app.config['UPLOAD_FOLDER'] = routes_of_all_volts["Secure"]
    return redirect(url_for('index'))



##################################################################################################################
###################################### Upload and File ###########################################################
##################################################################################################################


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        images_data = request.form.get('images')
        logging.debug(f"Received images data: {images_data[:100]}...")  # Log the first 100 characters

        try:
            images_list = json.loads(images_data)
            logging.debug(f"Number of images received: {len(images_list)}")

            if images_list:
                # post_id = str(len(os.listdir(app.config['UPLOAD_FOLDER'])) + 1)
                post_id = max(map(int, os.listdir(app.config['UPLOAD_FOLDER'])), default=0) + 1
                post_id = str(post_id)
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




##################################################################################################################
###################################### Post Details ##############################################################
##################################################################################################################



def get_post_details():
    posts = {}
    for folder in os.listdir(app.config['UPLOAD_FOLDER']):
        post_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.isdir(post_path):
            images = sorted([f for f in os.listdir(post_path) if f.endswith(('.png', '.jpg', '.jpeg'))],
                            key=lambda x: int(x.split('.')[0]))
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



@app.route('/posts/<id>', methods=['GET'])
def open_individual_post(id):
    post_path = os.path.join(app.config['UPLOAD_FOLDER'], id)
    # images = sorted([f for f in os.listdir(post_path) if f.endswith(('.png', '.jpg', '.jpeg'))])
    return render_template('individual_post.html', id=id, volt_name = str(app.config['UPLOAD_FOLDER']).lstrip("static/"))



@app.route('/api/all_posts_list/<current_post_id>', methods=['GET'])
def get_all_posts_list(current_post_id):
    posts = os.listdir(app.config['UPLOAD_FOLDER'])
    posts = sorted(posts, key=lambda x: int(x))
    # get one before and one after 
    if current_post_id not in posts:
        return jsonify({'error': 'Post not found'}), 404
    
    current_index = posts.index(current_post_id)
    prev_post = posts[current_index - 1] if current_index > 0 else current_post_id
    next_post = posts[current_index + 1] if current_index < len(posts) - 1 else current_post_id
    
    #send the current post and the next and previous post
    return jsonify({'current': current_post_id, 'prev': prev_post, 'next': next_post})




##################################################################################################################
###################################### Main Function #############################################################
##################################################################################################################


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    
    app.run(host="0.0.0.0", port=2300 ,debug=True)