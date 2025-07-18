import firebase_admin
from firebase_admin import auth, credentials
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from werkzeug.security import generate_password_hash
import os

register_api = Blueprint('register_api', __name__)
CORS(register_api)

cred = credentials.Certificate(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"))
firebase_admin.initialize_app(cred)

# Đường dẫn mới tới file service account key
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
# Khi khởi tạo Firestore client:
db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

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
    try:
        data = request.get_json()
        full_name = data.get('fullName')
        email = data.get('email')
        user_id = data.get('studentId') or data.get('teacherId')
        role = data.get('role')
        password = data.get('password')

        if not all([full_name, email, user_id, role, password]):
            return jsonify({'error': 'Missing required fields', 'detail': f"fullName={full_name}, email={email}, user_id={user_id}, role={role}, password={'yes' if password else 'no'}"}), 400

        # Kiểm tra email đã tồn tại
        try:
            auth.get_user_by_email(email)
            return jsonify({'error': 'Email already registered'}), 409
        except auth.UserNotFoundError:
            pass
        except Exception as e:
            return jsonify({'error': 'Firebase get_user_by_email error', 'detail': str(e)}), 500

        # Tạo user trên Firebase Auth
        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=full_name
            )
            uid = user_record.uid
        except Exception as e:
            return jsonify({'error': 'Firebase create_user error', 'detail': str(e)}), 500

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
        try:
            db.collection('users').document(uid).set(user_data)
        except Exception as e:
            return jsonify({'error': 'Firestore error', 'detail': str(e)}), 500
        return jsonify({'success': True, 'message': 'Đăng ký thành công!'})
    except Exception as e:
        import traceback
        return jsonify({'error': 'Unknown error', 'detail': str(e), 'trace': traceback.format_exc()}), 500

# API cần xác thực
@register_api.route('/some-protected-api', methods=['GET'])
def protected_api():
    try:
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
    except Exception as e:
        import traceback
        print(f"[ERROR /some-protected-api]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500
