from flask import Blueprint, jsonify
import os
from google.cloud import firestore

teachers_api = Blueprint('teachers_api', __name__)

# Lấy đường dẫn file service account key và project_id từ biến môi trường
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")

@teachers_api.route('/api/teachers', methods=['GET'])
def get_teachers():
    try:
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
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
        db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists and user_doc.to_dict().get('role') == 'teacher':
            display_name = user_doc.to_dict().get('displayName', '')
            return jsonify({'success': True, 'user_id': user_id, 'displayName': display_name})
        else:
            return jsonify({'success': False, 'error': 'Teacher not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
