import os
from dotenv import load_dotenv
from google.cloud import firestore

load_dotenv()

from flask import Flask
from flask_cors import CORS
from report_api import report_api
from profile_api import profile_api
from dashboard_api import dashboard_api
from class_api import class_api
from students_api import students_api
from register_api import register_api
from login_api import login_api
from attendance_api import attendance_api
from teachers_api import teachers_api

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="*")

# Lấy đường dẫn file key và project_id từ biến môi trường
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")

# KHÔNG khởi tạo db toàn cục ở đây
# db = firestore.Client.from_service_account_json(...)

# Trong mỗi route, khi cần mới khởi tạo db:
# db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

# Đăng ký các blueprint
app.register_blueprint(report_api)
app.register_blueprint(profile_api)
app.register_blueprint(dashboard_api)
app.register_blueprint(class_api)
app.register_blueprint(students_api)
app.register_blueprint(teachers_api)
app.register_blueprint(register_api)
app.register_blueprint(login_api)
app.register_blueprint(attendance_api)

# Route debug_env để kiểm tra project id runtime
@app.route("/debug_env")
def debug_env():
    try:
        from google.cloud import firestore
        db = firestore.Client()
        return {
            "runtime_project_id": db.project
        }, 200
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }, 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), debug=True)
