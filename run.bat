docker build -t personal_insta .

docker run -p 2300:2300 -v "$(pwd):/app" personal_insta python app.py personal_insta_instance