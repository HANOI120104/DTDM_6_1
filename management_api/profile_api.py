from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import os
from google.cloud import firestore


app = Flask(__name__)
CORS(app)

profile_api = Blueprint('profile_api', __name__)
CORS(profile_api)

# Đường dẫn mới tới file service account key
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
# Khởi tạo Firestore client
db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

# Lấy thông tin profile theo user id (uid)
@profile_api.route('/api/profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        return jsonify({"success": True, "profile": user_doc.to_dict()})
    return jsonify({"success": False, "error": "User not found"}), 404

# Cập nhật thông tin profile
@profile_api.route('/api/profile/<user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.json
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({"success": False, "error": "User not found"}), 404
    # Chỉ cập nhật một số trường cho demo
    update_fields = {}
    for field in ["displayName", "email", "photoURL", "department"]:
        if field in data:
            update_fields[field] = data[field]
    if update_fields:
        user_ref.update(update_fields)
    # Lấy lại profile mới
    new_doc = user_ref.get()
    return jsonify({"success": True, "profile": new_doc.to_dict()})