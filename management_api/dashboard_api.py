# management_api/dashboard_api.py
from flask import Blueprint, request, jsonify
import os
from google.cloud import firestore


dashboard_api = Blueprint('dashboard_api', __name__)

# Đường dẫn mới tới file service account key
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")

# Khởi tạo Firestore client (chỉ cần 1 lần ở đầu file)
db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

@dashboard_api.route('/api/dashboard/teacher', methods=['GET'])
def dashboard_teacher():
    try:
        # Lấy danh sách lớp từ Firestore
        classes_ref = db.collection('classes')
        docs = classes_ref.stream()
        classes = []
        total_students = 0
        for doc in docs:
            data = doc.to_dict()
            total_students += data.get('totalStudents', 0)
            classes.append({
                "id": doc.id,
                "name": data.get("name", ""),
                "code": data.get("code", ""),
                "totalStudents": data.get("totalStudents", 0),
                "presentToday": data.get("presentToday", 0),
            })
        # Bạn có thể bổ sung các trường khác tùy ý
        result = {
            "total_students": total_students,
            "present_today": 0,  # Tùy bạn xử lý
            "absent_today": 0,   # Tùy bạn xử lý
            "attendance_rate": 0, # Tùy bạn xử lý
            "classes": classes,
            "recent_attendance": []  # Có thể lấy thêm từ Firestore nếu muốn
        }
        return jsonify(result)
    except Exception as e:
        import traceback
        print(f"[ERROR /api/dashboard/teacher]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@dashboard_api.route('/api/dashboard/student', methods=['GET'])
def dashboard_student():
    try:
        # Lấy uid từ query param hoặc header (tùy frontend truyền lên)
        uid = request.args.get('uid') or request.headers.get('X-User-Id')
        if not uid:
            return jsonify({'error': 'Missing user id'}), 400

        # Lấy thông tin user từ Firestore
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        user_data = user_doc.to_dict()

        # Lấy danh sách lớp mà sinh viên này tham gia
        classes_ref = db.collection('classes')
        classes_query = classes_ref.where('students', 'array_contains', uid)
        classes_docs = classes_query.stream()
        classes = []
        for doc in classes_docs:
            data = doc.to_dict()
            classes.append({
                'id': doc.id,
                'name': data.get('name', ''),
                'code': data.get('code', ''),
                # Thêm trường khác nếu cần
            })

        # Thống kê
        total_classes = len(classes)
        attendance_rate = 0  # Có thể tính toán nếu có bảng điểm danh
        next_class = classes[0] if classes else None  # Demo: lấy lớp đầu tiên
        attendance_history = []  # Có thể lấy từ bảng attendance nếu có
        by_class = []  # Có thể tổng hợp theo lớp nếu có dữ liệu

        data = {
            'total_classes': total_classes,
            'attendance_rate': attendance_rate,
            'next_class': next_class,
            'attendance_history': attendance_history,
            'by_class': by_class
        }
        return jsonify(data)
    except Exception as e:
        import traceback
        print(f"[ERROR /api/dashboard/student]: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500