import firebase_admin
from firebase_admin import auth, credentials
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from werkzeug.security import generate_password_hash

register_api = Blueprint('register_api', __name__)
CORS(register_api)

cred = credentials.Certificate(r'D:\2024\DTDM\DTDM_6_1\management_api\face-attendance-463704-8823b47082ba.json')
firebase_admin.initialize_app(cred)
db = firestore.Client()

def verify_firebase_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    id_token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        return None

# Đăng ký tài khoản mới
@register_api.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    user_id = data.get('studentId') or data.get('teacherId')
    role = data.get('role')
    password = data.get('password')

    if not all([full_name, email, user_id, role, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Kiểm tra email đã tồn tại
    try:
        auth.get_user_by_email(email)
        return jsonify({'error': 'Email already registered'}), 409
    except auth.UserNotFoundError:
        pass
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Tạo user trên Firebase Auth
    try:
        user_record = auth.create_user(
            email=email,
            password=password,
            display_name=full_name
        )
        uid = user_record.uid
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Dùng UID làm document ID trong Firestore
    user_data = {
        'full_name': full_name,
        'email': email,
        'role': role,
        'password': generate_password_hash(password),
        'created_at': firestore.SERVER_TIMESTAMP
    }

    if role == 'student':
        user_data['student_id'] = user_id
    elif role == 'teacher':
        user_data['teacher_id'] = user_id

    # Lưu thêm các trường khác từ form frontend (nếu có)
    extra_fields = ['displayName', 'status', 'createdAt']
    for field in extra_fields:
        if field in data:
            user_data[field] = data[field]
    # Lưu tất cả các trường khác không trùng tên
    for key in data:
        if key not in user_data and key not in ['password']:
            user_data[key] = data[key]

    print(f"[REGISTER] New user: uid={uid}, data={user_data}")
    db.collection('users').document(uid).set(user_data)
    return jsonify({'success': True, 'message': 'Đăng ký thành công!'})

# API cần xác thực
@register_api.route('/some-protected-api', methods=['GET'])
def protected_api():
    user = verify_firebase_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    uid = user['uid']

    user_doc = db.collection('users').document(uid).get()
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
    user_data = user_doc.to_dict()

    print(f"[PROTECTED_API] Current user: uid={uid}, data={user_data}")

    if user_data.get('role') != 'teacher':
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify({'success': True, 'role': user_data['role']})
