from flask import Flask
from flask_pymongo import PyMongo

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb://localhost:27017/student_marketplace"

mongo = PyMongo(app)

@app.route("/")
def home():
    return "App is connected to MongoDB!"

if __name__ == "__main__":
    app.run(debug=True)