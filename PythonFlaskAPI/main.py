from flask import Flask, jsonify, request, make_response, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
#from passlib.context import CryptContext
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask_jwt_extended import decode_token

app = Flask(__name__)
# Create Database
app.config['SECRET_KEY'] = 'GiveASecretKeyHavingAtleast32Characters'
# app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{app.root_path}/tasks.db"
# app.config['SQLALCHEMY_BINDS'] = {"users": f"sqlite:///{app.root_path}/users.db"}
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///tasks.db"
app.config['SQLALCHEMY_BINDS'] = {"users": f"sqlite:///users.db"}
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

cors = CORS(app, resources={r'/api/*': {"origins": "http://localhost:4200"}})

class User(db.Model):
    __bind_key__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)  
    email = db.Column(db.String(100), nullable=False) 
    password = db.Column(db.String(100), nullable=False) 
    fullName = db.Column(db.String(100), nullable=False) 
    isAdmin = db.Column(db.Boolean, default=False, nullable=False) 

    def to_dict(self):
        return {
            "id": self.id,
            "public_id": self.public_id,
            "email": self.email,
            "password": self.password,
            "fullName": self.fullName,
            "isAdmin": self.isAdmin
        }
    
    def user_name(self):
        return {
            "fullName": self.fullName
        }
    
    def user__public_id(self):
        return {
            "public_id": self.public_id
        }
    
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(100), unique=True)  
    description = db.Column(db.String(100), nullable=False) 
    user_id = db.Column(db.String(50), nullable=False) 
    status = db.Column(db.String(100), nullable=False) 

    def to_dict(self):
        return {
            "id": self.id,
            "task": self.task,
            "description": self.description,
            "user_id": self.user_id,
            "status": self.status
        }

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message' : 'Token is missing!'}), 401

        try: 
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(public_id=data['public_id']).first()
        except:
            return jsonify({'message' : 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
    
with app.app_context():
    db.create_all()

# Route to register a new user to the database (POST method)
@app.route('/api/signup', methods=['POST'], strict_slashes=False)
def register_user():
    # Parse the incoming JSON request body to extract data
    data = request.get_json()

    emailData = data["email"]
    passwordData = data["password"]
    nameData = data["fullName"]
    adminData = data["isAdmin"]

    existing_user = User.query.filter_by(email=emailData).first()
    if existing_user:
            return jsonify({'message': 'User already created!'}), 404
    
    hashed_password = generate_password_hash(passwordData)

    new_user = User(
        public_id=str(uuid.uuid4()),
        email=emailData,
        password=hashed_password,
        fullName=nameData,
        isAdmin=adminData
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

@app.route('/api/signin', methods=['POST'])
def login():
        data = request.get_json()

        emailData = data["email"]
        passwordData = data["password"]
        user = User.query.filter_by(email=emailData).first()

        if not user or not check_password_hash(user.password, passwordData):
            return jsonify({'message': 'Invalid email or password'}), 401

        token = jwt.encode({'public_id': user.public_id, 'exp': datetime.now(timezone.utc) + timedelta(hours=1)}, 
                           app.config['SECRET_KEY'], algorithm="HS256")

        #esponse = make_response(redirect(url_for('api/dashboard')))
        #response.set_cookie('jwt_token', token)

        successLogin={'status':True, 'msg':'Login Success', 'token':token}
        response=make_response(successLogin)
        #response.set_cookie('x-auth-token', token)
        response.set_cookie('jwt-token', token)

        return response

# Create Routes
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Python Backend API!"})

##USER

# Route to get all users from the database (GET method)
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# Route to get a specific user by its ID (GET method)
# Get Full Name of User from its ID
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify(user.to_dict())
    else:
        return jsonify({"error": "user not found"}), 404
    
# Route to get a specific user by its Public ID (GET method)
@app.route('/api/users/<public_id>', methods=['GET'])
def get_user_name_by_public_id(public_id):
    user = User.query.filter_by(public_id=public_id).first()
    if user:
        return jsonify(user.user_name())
    else:
        return jsonify({"error": "user not found"}), 404
    
# Route to add a new user to the database (POST method)
@app.route('/api/users', methods=['POST'])
def add_user():
    # Parse the incoming JSON request body to extract data
    data = request.get_json()

    new_user = User(
        email=data["email"],
        password=data["password"],
        fullName=data["fullName"]
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

# Route to update an existing user by its ID (PUT method)
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # Parse the incoming JSON request body to extract data
    data = request.get_json()
    
    user = User.query.get(user_id)
    if user:
        user.email = data.get("email", user.email)
        user.password = data.get("password", user.password)
        user.fullName = data.get("fullName", user.fullName)
        db.session.commit()
        
        return jsonify(user.to_dict())
    else:
        return jsonify({"error": "user not found"}), 404
    
# Route to delete a user by its ID (DELETE method)
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "user deleted"})
    else:
        return jsonify({"error": "user not found"}), 404
    
##TASK
    
# Route to get all tasks from the database (GET method)
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# Route to get a specific task by its ID (GET method)
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if task:
        return jsonify(task.to_dict())
    else:
        return jsonify({"error": "task not found"}), 404
    
# Route to add a new task to the database (POST method)
@app.route('/api/tasks', methods=['POST'])
def add_task():
    # Parse the incoming JSON request body to extract data
    data = request.get_json()

    new_task = Task(
        task=data["task"],
        description=data["description"],
        user_id=data["user_id"],
        status=data["status"]
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201

# Route to update an existing task by its ID (PUT method)
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    # Parse the incoming JSON request body to extract data
    data = request.get_json()
    
    task = Task.query.get(task_id)
    if task:
        task.task = data.get("task", task.task)
        task.description = data.get("description", task.description)
        task.status = data.get("status", task.status)
        db.session.commit()
        
        return jsonify(task.to_dict())
    else:
        return jsonify({"error": "task not found"}), 404
    
# Route to delete a task by its ID (DELETE method)
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "task deleted"})
    else:
        return jsonify({"error": "task not found"}), 404
    
@app.route('/api/useronline', methods=['GET'])
@token_required
def get_user_online(current_user):
    token = request.headers['x-access-token']
    data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    return jsonify(data['public_id'])

if __name__ == "__main__":
    app.run(debug=True, port=8001)