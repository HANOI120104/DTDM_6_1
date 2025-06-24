from flask import Blueprint, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from werkzeug.security import check_password_hash


login_api = Blueprint('login_api', __name__)
CORS(login_api)

db = firestore.Client(project="face-attendance-463704")

# Đăng nhập
@login_api.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    users_ref = db.collection('users')
    user_docs = users_ref.where('email', '==', email).get()
    if not user_docs:
        return jsonify({'error': 'Email not found'}), 404

    user = user_docs[0].to_dict()
    if not check_password_hash(user['password'], password):
        return jsonify({'error': 'Incorrect password'}), 401

    # Trả về thông tin user (bạn có thể loại bỏ password trước khi trả về)
    user.pop('password', None)
    return jsonify({'success': True, 'user': user})