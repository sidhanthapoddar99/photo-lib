docker build -t personal_insta .

docker run -p 2300:2300 -v "$(pwd):/app" --name personal_insta_instance personal_insta python app.py 

docker run -d -p 2300:2300 -v "$(pwd):/app" --name personal_insta_instance personal_insta python app.py 