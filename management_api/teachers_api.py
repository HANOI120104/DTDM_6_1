from flask import Blueprint, jsonify
from google.cloud import firestore

teachers_api = Blueprint('teachers_api', __name__)

@teachers_api.route('/api/teachers', methods=['GET'])
def get_teachers():
    try:
        db = firestore.Client(project="face-attendance-463704")
        users_ref = db.collection('users').where('role', '==', 'teacher')
        docs = users_ref.stream()
        teachers = []
        for doc in docs:
            data = doc.to_dict()
            teachers.append({
                'id': doc.id,
                'name': data.get('name', ''),
                'email': data.get('email', ''),
                'avatar_url': data.get('avatar_url', ''),
            })
        return jsonify({'success': True, 'teachers': teachers})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@teachers_api.route('/api/teachers/<user_id>/displayName', methods=['GET'])
def get_teacher_display_name(user_id):
    try:
        db = firestore.Client(project="face-attendance-463704")
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists and user_doc.to_dict().get('role') == 'teacher':
            display_name = user_doc.to_dict().get('displayName', '')
            return jsonify({'success': True, 'user_id': user_id, 'displayName': display_name})
        else:
            return jsonify({'success': False, 'error': 'Teacher not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
