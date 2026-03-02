from flask import Flask, jsonify, request, send_from_directory
import os

# use absolute imports so the module can be executed directly
# when running `python app.py` from the backend directory
from db import get_db_connection
from utils import parse_page
from filters import filter_by_session, filter_observations

BASE_DIR = os.path.dirname(__file__)
FRONTEND_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "frontend"))

app = Flask(__name__)


@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route('/css/<path:filename>')
def css_file(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, 'css'), filename)


@app.route('/js/<path:filename>')
def js_file(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, 'js'), filename)


@app.route("/metrics")
def metrics():
    return "OK", 200
    
@app.route("/api/session", methods=["GET"])
def search_session():
    session_input = request.args.get("session_id", "").strip()
    if session_input == "":
        return jsonify({"error": "Session ID is required"}), 400
    # paginate by *sessions*, not observations. We still return the
    # observations for the selected sessions so the frontend can group
    # and render timelines as before.
    page = parse_page(request.args.get("page"))
    per_page = 10
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT o.*, s.SESS_ID
        FROM observation o
        JOIN session_observation s
        ON o.REFOBS_ID = s.REFOBS_ID
    """)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()

    matched = filter_by_session(rows, session_input)

    # group observations by session id
    grouped = {}
    for r in matched:
        sid = r.get("SESS_ID") or "Unknown"
        grouped.setdefault(sid, []).append(r)

    session_ids = list(grouped.keys())
    total_sessions = len(session_ids)

    # pick the sessions for this page
    selected = session_ids[offset:offset + per_page]

    paginated = []
    for sid in selected:
        # keep the original order of observations within a session
        paginated.extend(grouped.get(sid, []))

    return jsonify({
        "data": paginated,
        "total": total_sessions,
        "page": page,
        "per_page": per_page
    })


@app.route("/api/observation", methods=["GET"])
def search_observations():
    pattern = request.args.get("pattern")
    config = request.args.get("config")
    imaging = request.args.get("imaging")
    cmd_start = request.args.get("cmd_start")
    cmd_end = request.args.get("cmd_end")

    page = parse_page(request.args.get("page"))
    per_page = 10
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM observation")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    filtered = filter_observations(
        rows,
        pattern=pattern,
        config=config,
        imaging=imaging,
        cmd_start=cmd_start,
        cmd_end=cmd_end
    )

    total = len(filtered)
    paginated = filtered[offset:offset + per_page]

    return jsonify({
        "data": paginated,
        "total": total,
        "page": page,
        "per_page": per_page
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True) 