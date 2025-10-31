from flask import Flask, render_template, request, jsonify, send_from_directory, abort
import os
from datetime import datetime
from werkzeug.utils import secure_filename

# 🔧 Folder settings
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
ALLOWED_IMAGE = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_VIDEO = {"mp4", "webm", "ogg", "mov"}
ALLOWED_AUDIO = {"mp3", "wav", "ogg", "m4a"}

# ✅ Ensure folders exist
for sub in ("images", "videos", "audios"):
    os.makedirs(os.path.join(UPLOAD_DIR, sub), exist_ok=True)

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024  # 200MB

# 🧠 File category check
def file_category(filename):
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext in ALLOWED_IMAGE: return "images"
    if ext in ALLOWED_VIDEO: return "videos"
    if ext in ALLOWED_AUDIO: return "audios"
    return None

# 🏠 Home page
@app.route("/")
def index():
    return render_template("home.html")

# 📤 Upload files
@app.route("/upload", methods=["POST"])
def upload():
    if "files" not in request.files:
        return jsonify({"success": False, "message": "No files found"}), 400

    files = request.files.getlist("files")
    saved = []
    for f in files:
        if f.filename == "":
            continue
        filename = secure_filename(f.filename)
        cat = file_category(filename)
        if not cat:
            continue
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        name = f"{timestamp}_{filename}"
        save_path = os.path.join(UPLOAD_DIR, cat, name)
        f.save(save_path)
        saved.append({
            "name": name,
            "url": f"/static/uploads/{cat}/{name}",
            "category": cat,
            "uploaded_at": datetime.utcnow().isoformat() + "Z"
        })

    return jsonify({"success": True, "saved": saved})

# 📁 List uploaded files
@app.route("/files", methods=["GET"])
def list_files():
    result = {"images": [], "videos": [], "audios": []}
    for cat in result.keys():
        folder = os.path.join(UPLOAD_DIR, cat)
        for fname in sorted(os.listdir(folder), reverse=True):
            path = os.path.join(folder, fname)
            if os.path.isfile(path):
                stat = os.stat(path)
                result[cat].append({
                    "name": fname,
                    "url": f"/static/uploads/{cat}/{fname}",
                    "size": stat.st_size,
                    "mtime": datetime.utcfromtimestamp(stat.st_mtime).isoformat() + "Z"
                })
    return jsonify(result)

# ❌ Delete file
@app.route("/delete", methods=["POST"])
def delete_file():
    data = request.get_json() or {}
    url = data.get("url")
    if not url or not url.startswith("/static/uploads/"):
        return jsonify({"success": False, "message": "Invalid URL"}), 400

    rel = url.replace("/static/uploads/", "")
    real = os.path.join(UPLOAD_DIR, rel)
    if os.path.exists(real):
        os.remove(real)
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "File not found"}), 404

# 🔥 Run
if __name__ == "__main__":
    app.run(debug=True)
