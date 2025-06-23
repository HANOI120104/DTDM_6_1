from flask import Blueprint, request, jsonify
from google.cloud import firestore

report_api = Blueprint('report_api', __name__)

# Lấy báo cáo điểm danh từng sinh viên trong lớp
@report_api.route('/api/reports/attendance', methods=['GET'])
def get_attendance_report():
    class_id = request.args.get('class')
    db = firestore.Client()
    attendance_ref = db.collection('attendance')
    query = attendance_ref
    if class_id:
        query = query.where('classId', '==', class_id)
    docs = query.stream()

    # Gom theo studentId
    student_stats = {}
    for doc in docs:
        data = doc.to_dict()
        sid = data.get('studentId')
        status = data.get('status')
        if not sid:
            continue
        if sid not in student_stats:
            student_stats[sid] = {'present': 0, 'absent': 0, 'late': 0, 'total': 0}
        if status == 'present':
            student_stats[sid]['present'] += 1
        elif status == 'absent':
            student_stats[sid]['absent'] += 1
        elif status == 'late':
            student_stats[sid]['late'] += 1
        student_stats[sid]['total'] += 1

    # Lấy tên sinh viên từ users
    db_users = db.collection('users')
    data = []
    for sid, stats in student_stats.items():
        user_doc = db_users.document(sid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        name = user_data.get('displayName') or user_data.get('name') or sid
        attendance_rate = round(100 * stats['present'] / stats['total'], 2) if stats['total'] else 0
        data.append({
            "studentId": sid,
            "name": name,
            "present": stats['present'],
            "absent": stats['absent'],
            "late": stats['late'],
            "attendanceRate": attendance_rate
        })
    return jsonify({"success": True, "data": data})

# Lấy báo cáo tổng quan các lớp
@report_api.route('/api/reports/class', methods=['GET'])
def get_class_attendance():
    db = firestore.Client()
    classes_ref = db.collection('classes')
    attendance_ref = db.collection('attendance')
    classes_docs = classes_ref.stream()
    data = []
    for class_doc in classes_docs:
        class_data = class_doc.to_dict()
        class_id = class_doc.id
        class_name = class_data.get('name', '')
        students = class_data.get('students', [])
        # Đếm số lần present/absent của lớp
        attendance_docs = attendance_ref.where('classId', '==', class_id).stream()
        present, total = 0, 0
        for att_doc in attendance_docs:
            att_data = att_doc.to_dict()
            if att_data.get('status') == 'present':
                present += 1
            total += 1
        attendance_rate = round(100 * present / total, 2) if total else 0
        data.append({
            "class": class_name,
            "attendanceRate": attendance_rate,
            "studentCount": len(students)
        })
    return jsonify({"success": True, "data": data})

@report_api.route('/api/reports/export', methods=['POST'])
def export_report():
    req = request.json
    export_type = req.get('type')
    # TODO: Thực tế: sinh file, trả về link tải hoặc file trực tiếp
    # Ở đây trả về link giả lập
    if export_type == 'pdf':
        return jsonify({"success": True, "url": "/static/report.pdf"})
    elif export_type == 'excel':
        return jsonify({"success": True, "url": "/static/report.xlsx"})
    else:
        return jsonify({"success": False, "error": "Invalid export type"}), 400