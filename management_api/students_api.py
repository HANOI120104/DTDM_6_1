from google.cloud import firestore, storage
from datetime import datetime
import os

import base64
import re
from flask import Blueprint, request, jsonify
from flask_cors import CORS



# Config
BUCKET_NAME = "face-attendance"  # Thay bằng tên bucket thật
# Đường dẫn mới tới file service account key
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")

# Hàm upload ảnh base64 lên GCS
def upload_student_image(student_id, image_base64):
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"students/{student_id}.jpg")
    # Loại bỏ tiền tố data:image/...;base64, nếu có
    base64_str = re.sub('^data:image/.+;base64,', '', image_base64)
    # Đảm bảo là ASCII
    base64_bytes = base64_str.encode('ascii')
    image_data = base64.b64decode(base64_bytes)
    blob.upload_from_string(image_data, content_type='image/jpeg')
    return f"https://storage.googleapis.com/{BUCKET_NAME}/students/{student_id}.jpg"

def add_student(student_id, name, email, class_name, status, image_base64):
    # Khi khởi tạo Firestore client:
    db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
    image_url = upload_student_image(student_id, image_base64)
    student = {
        'student_id': student_id,
        'name': name,
        'email': email,
        'class': class_name,
        'status': status,
        'image_url': image_url,
        'created_at': firestore.SERVER_TIMESTAMP
    }
    # Tạo document id duy nhất cho mỗi sinh viên - mỗi lớp
    doc_id = f"{student_id}_{class_name}"
    doc_ref = db.collection('students').document(doc_id)
    doc_ref.set(student)
    print(f"✅ Sinh viên {student_id} ({class_name}) đã được thêm vào Firestore với doc_id {doc_id} và ảnh đã upload lên GCS.")
    print("image_base64 (first 100 chars):", image_base64[:100])

students_api = Blueprint('students_api', __name__)
CORS(students_api)

# Lấy danh sách sinh viên từ collection users (role=student)
@students_api.route('/api/students', methods=['GET'])
def get_students():
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        users_ref = db.collection('users').where('role', '==', 'student')
        docs = users_ref.stream()
        students = []
        for doc in docs:
            data = doc.to_dict()
            student = {
                'id': doc.id,
                'name': data.get('name', ''),
                'studentId': doc.id,
                'email': data.get('email', ''),
                'avatar_url': data.get('avatar_url', ''),
                'status': data.get('status', 'active'),
                'createdAt': data.get('createdAt')
            }
            students.append(student)
        return jsonify({"success": True, "students": students})
    except Exception as e:
        import traceback
        print(f"[ERROR /api/students GET]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e), "trace": traceback.format_exc()}), 500

# Thêm sinh viên mới vào users và cập nhật mảng students của lớp
@students_api.route('/api/students', methods=['POST'])
def add_student_api():
    data = request.get_json()
    user_id = data['user_id']  # documentId của user đã đăng ký (uid)
    student_id = data.get('student_id', '')  # mã sinh viên, chỉ là field
    class_id = data.get('class_id', '')
    status = data.get('status', 'active')
    image_base64 = data.get('image_base64', '')
    name = data.get('name', '')
    email = data.get('email', '')
    avatar_url = ''

    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

        # Upload ảnh lên GCS nếu có
        if image_base64:
            avatar_url = upload_student_image(user_id, image_base64)

        # Cập nhật thông tin user (nếu có)
        user_update = {}
        if student_id:
            user_update['student_id'] = student_id
        if avatar_url:
            user_update['avatar_url'] = avatar_url
        if status:
            user_update['status'] = status
        if name:
            user_update['name'] = name
        if email:
            user_update['email'] = email
        if user_update:
            user_ref = db.collection('users').document(user_id)
            if not user_ref.get().exists:
                return jsonify({'error': f'User {user_id} chưa đăng ký tài khoản!'}), 400
            user_ref.update(user_update)

        # Thêm user_id vào mảng students của lớp
        if class_id:
            class_ref = db.collection('classes').document(class_id)
            class_doc = class_ref.get()
            if class_doc.exists:
                class_data = class_doc.to_dict()
                students_list = class_data.get('students', [])
                if user_id not in students_list:
                    students_list.append(user_id)
                    class_ref.update({'students': students_list})

        return jsonify({'success': True, 'user_id': user_id})
    except Exception as e:
        import traceback
        print(f"[ERROR /api/students POST]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

# Sửa thông tin sinh viên (users)
@students_api.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.json
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        user_ref = db.collection('users').document(student_id)
        user_ref.update(data)
        return jsonify({"success": True})
    except Exception as e:
        import traceback
        print(f"[ERROR /api/students/<student_id> PUT]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e), "trace": traceback.format_exc()}), 500

# Xóa sinh viên (users)
@students_api.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        user_ref = db.collection('users').document(student_id)
        user_ref.delete()
        return jsonify({"success": True})
    except Exception as e:
        import traceback
        print(f"[ERROR /api/students/<student_id> DELETE]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e), "trace": traceback.format_exc()}), 500

# Lấy danh sách lớp từ collection classes
@students_api.route('/api/classes', methods=['GET'])
def get_classes():
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        classes_ref = db.collection('classes')
        docs = classes_ref.stream()
        classes = []
        for doc in docs:
            data = doc.to_dict()
            classes.append({
                'id': doc.id,
                'name': data.get('name', ''),
                'teacherId': data.get('teacherId', ''),
                'students': data.get('students', []),
                'code': data.get('code', ''),
            })
        return jsonify({'success': True, 'classes': classes})
    except Exception as e:
        import traceback
        print(f"[ERROR /api/classes GET]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e), 'trace': traceback.format_exc()}), 500

# Lấy danh sách lớp mà sinh viên tham gia dựa vào mảng students
@students_api.route('/api/classes/student/<student_id>', methods=['GET'])
def get_classes_of_student(student_id):
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        classes_ref = db.collection('classes').where('students', 'array_contains', student_id)
        docs = classes_ref.stream()
        classes = []
        for doc in docs:
            data = doc.to_dict()
            classes.append({
                'id': doc.id,
                'name': data.get('name', ''),
                'teacherId': data.get('teacherId', ''),
                'code': data.get('code', ''),
            })
        return jsonify({'success': True, 'classes': classes})
    except Exception as e:
        import traceback
        print(f"[ERROR /api/classes/student/<student_id> GET]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e), 'trace': traceback.format_exc()}), 500

# Lấy displayName của sinh viên theo userId
@students_api.route('/api/students/<user_id>/displayName', methods=['GET'])
def get_student_display_name(user_id):
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists and user_doc.to_dict().get('role') == 'student':
            display_name = user_doc.to_dict().get('displayName', '')
            return jsonify({'success': True, 'user_id': user_id, 'displayName': display_name})
        else:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
    except Exception as e:
        import traceback
        print(f"[ERROR /api/students/<user_id>/displayName GET]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e), 'trace': traceback.format_exc()}), 500

# Không import teachers_api ở đây nữa vì đã tách sang file riêng
