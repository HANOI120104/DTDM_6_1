from flask import Blueprint, request, jsonify
from google.cloud import firestore
from datetime import datetime
import os

class_api = Blueprint('class_api', __name__)

# Đường dẫn mới tới file service account key
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

# Lấy danh sách lớp
@class_api.route('/api/classes', methods=['GET'])
def get_classes():
    try:
        classes_ref = db.collection('classes')
        docs = classes_ref.stream()
        classes = []
        user_cache = {}
        for doc in docs:
            c = doc.to_dict()
            c['id'] = doc.id
            instructor = c.get('instructor')
            if isinstance(instructor, str):
                # Nếu instructor là uid, lấy tên từ users
                if instructor not in user_cache:
                    user_doc = db.collection('users').document(instructor).get()
                    if user_doc.exists:
                        user_cache[instructor] = user_doc.to_dict().get('name', instructor)
                    else:
                        user_cache[instructor] = instructor
                c['instructorName'] = user_cache[instructor]
            elif isinstance(instructor, dict):
                c['instructorName'] = instructor.get('name', '')
            else:
                c['instructorName'] = ''
            classes.append(c)
        return jsonify({"success": True, "classes": classes})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Thêm lớp mới
@class_api.route('/api/classes', methods=['POST'])
def add_class():
    data = request.json
    class_id = data.get("code")  # Dùng code làm classId
    new_class = {
        "name": data.get("name"),
        "code": class_id,
        "room": data.get("room", ""),
        "schedule": data.get("schedule", {}),
        "instructor": data.get("instructor", {}),
        "numberStudent": data.get("numberStudent", 0),
        "students": data.get("students", []),
        "createdAt": datetime.utcnow()
    }
    try:
        doc_ref = db.collection('classes').document(class_id)
        new_class['id'] = class_id
        doc_ref.set(new_class)
        return jsonify({"success": True, "class": new_class})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Sửa thông tin lớp
@class_api.route('/api/classes/<class_id>', methods=['PUT'])
def update_class(class_id):
    data = request.json
    try:
        class_ref = db.collection('classes').document(class_id)
        update_data = {}
        for field in ["name", "room", "schedule", "instructor", "numberStudent", "students"]:
            if field in data:
                update_data[field] = data[field]
        if update_data:
            class_ref.update(update_data)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Xóa lớp
@class_api.route('/api/classes/<class_id>', methods=['DELETE'])
def delete_class(class_id):
    try:
        class_ref = db.collection('classes').document(class_id)
        class_ref.delete()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Lấy danh sách lớp mà sinh viên tham gia (dựa vào mảng students)
@class_api.route('/api/classes/student/<studentId>', methods=['GET'])
def get_classes_of_student(studentId):
    try:
        # studentId phải là mã sinh viên, không phải email/uid
        classes_ref = db.collection('classes').where('students', 'array_contains', studentId)
        docs = classes_ref.stream()
        classes = []
        for doc in docs:
            c = doc.to_dict()
            c['id'] = doc.id
            classes.append(c)
        return jsonify({'success': True, 'classes': classes})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    

# Thêm sinh viên vào lớp (chỉ thêm studentId vào mảng students của class, không tạo user mới)
@class_api.route('/api/classes/<class_id>/add_student', methods=['POST'])
def add_student_to_class(class_id):
    data = request.get_json()
    studentId = data.get('studentId') or data.get('student_id')
    if not studentId:
        return jsonify({'success': False, 'error': 'Missing studentId'}), 400
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        class_ref = db.collection('classes').document(class_id)
        class_doc = class_ref.get()
        if not class_doc.exists:
            return jsonify({'success': False, 'error': 'Class not found'}), 404
        class_data = class_doc.to_dict()
        students_list = class_data.get('students', [])
        if studentId not in students_list:
            students_list.append(studentId)
            class_ref.update({'students': students_list})
        return jsonify({'success': True, 'class_id': class_id, 'student_id': studentId})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500