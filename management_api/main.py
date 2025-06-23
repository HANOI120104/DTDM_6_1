import os
from dotenv import load_dotenv

# Nạp biến môi trường trước khi import các module khác
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

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
CORS(app)

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

if __name__ == "__main__":
    app.run(port=5002, debug=True)
