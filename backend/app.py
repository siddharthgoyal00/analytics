from flask import Flask, jsonify, request, send_from_directory
import os
from functools import lru_cache

try:
    # optional compression to reduce payload size
    from flask_compress import Compress
except Exception:
    Compress = None

# use absolute imports so the module can be executed directly
# when running `python app.py` from the backend directory
from db import get_db_connection
from utils import parse_page
from filters import filter_by_session, filter_observations

BASE_DIR = os.path.dirname(__file__)
FRONTEND_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "frontend"))

app = Flask(__name__)
if Compress:
    Compress(app)


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

    # optional cmd filters for session search
    cmd_start = request.args.get("cmd_start")
    cmd_end = request.args.get("cmd_end")

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

    # apply cmd time filtering if specified
    if cmd_start or cmd_end:
        matched = filter_observations(matched, None, None, None, cmd_start, cmd_end)

    # group observations by session id
    grouped = {}
    for r in matched:
        grp = r.get("SESS_ID") or "Unknown"
        grouped.setdefault(grp, []).append(r)

    session_ids = list(grouped.keys())
    total_sessions = len(session_ids)

    # pick the sessions for this page
    selected = session_ids[offset:offset + per_page]

    paginated = []
    for grp in selected:
        # keep the original order of observations within a session
        paginated.extend(grouped.get(grp, []))

    return jsonify({
        "data": paginated,
        "total": total_sessions,
        "page": page,
        "per_page": per_page
    })


CACHE_SIZE = 128

# cache for query results (small pages)
@lru_cache(maxsize=CACHE_SIZE)
def cached_query(sql, params):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# wrap query builder to avoid rebuilding same query repeatedly
@lru_cache(maxsize=CACHE_SIZE)
def build_observation_query(pattern, config, imaging, cmd_start, cmd_end, per_page, offset):
    where_clauses = []
    params = []

    if pattern:
        p = pattern
        if not p.lower().startswith("oid_"):
            p = f"oid_{p}"
        like = p.replace("*", "%").replace("?", "_")
        where_clauses.append("REFOBS_ID LIKE ?")
        params.append(like)

    if config:
        where_clauses.append("SSAR_CONFIG_ID = ?")
        params.append(config)

    if imaging:
        like_im = f"%{imaging}%"
        cols = ["REF_START_DATETIME", "REF_END_DATETIME", "CMD_SSAR_START_DATETIME", "CMD_SSAR_END_DATETIME", "CMD_LSAR_START_DATETIME", "CMD_LSAR_END_DATETIME"]
        cond = " OR ".join([f"{c} LIKE ?" for c in cols])
        where_clauses.append(f"({cond})")
        params.extend([like_im] * len(cols))

    if cmd_start:
        where_clauses.append("CMD_SSAR_START_DATETIME >= ?")
        params.append(cmd_start)

    if cmd_end:
        where_clauses.append("CMD_SSAR_END_DATETIME <= ?")
        params.append(cmd_end)

    where_sql = ""
    if where_clauses:
        where_sql = " WHERE " + " AND ".join(where_clauses)

    count_sql = f"SELECT COUNT(*) as cnt FROM observation{where_sql}"
    select_sql = (
        "SELECT REFOBS_ID, TYPE, REF_START_DATETIME, REF_END_DATETIME,"
        " CMD_LSAR_START_DATETIME, CMD_LSAR_END_DATETIME,"
        " CMD_SSAR_START_DATETIME, CMD_SSAR_END_DATETIME,"
        " LSAR_CONFIG_ID, SSAR_CONFIG_ID, DATATAKE_ID"
        f" FROM observation{where_sql} ORDER BY CMD_SSAR_START_DATETIME LIMIT ? OFFSET ?"
    )
    exec_params = tuple(params + [per_page, offset])
    return count_sql, select_sql, tuple(params), exec_params


@app.route("/api/observation", methods=["GET"])
def search_observations():

    pattern = request.args.get("pattern")
    configs = request.args.getlist("config")  # Get all config values
    imaging = request.args.get("imaging")
    cmd_start = request.args.get("cmd_start")
    cmd_end = request.args.get("cmd_end")

    page = parse_page(request.args.get("page"))
    # parse per_page parameter; default to 10 when not provided
    # cap at 50 for scalability
    raw_per = request.args.get("per_page")
    if raw_per is not None:
        per_page = parse_page(raw_per)
    else:
        per_page = 10
    per_page = min(50, per_page)
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor()

    # Build WHERE clauses and parameters to push filtering into SQLite (faster)
    where_clauses = []
    params = []

    if pattern:
        p = pattern
        if not p.lower().startswith("oid_"):
            p = f"oid_{p}"
        like = p.replace("*", "%").replace("?", "_")
        where_clauses.append("o.REFOBS_ID LIKE ?")
        params.append(like)

    if configs:
        # Handle multiple config IDs
        placeholders = ",".join(["?" for _ in configs])
        where_clauses.append(f"o.SSAR_CONFIG_ID IN ({placeholders})")
        params.extend(configs)

    if imaging:
        like_im = f"%{imaging}%"
        cols = ["o.REF_START_DATETIME", "o.REF_END_DATETIME", "o.CMD_SSAR_START_DATETIME", "o.CMD_SSAR_END_DATETIME", "o.CMD_LSAR_START_DATETIME", "o.CMD_LSAR_END_DATETIME"]
        cond = " OR ".join([f"{c} LIKE ?" for c in cols])
        where_clauses.append(f"({cond})")
        params.extend([like_im] * len(cols))

    if cmd_start:
        where_clauses.append("o.CMD_SSAR_START_DATETIME >= ?")
        params.append(cmd_start)

    if cmd_end:
        where_clauses.append("o.CMD_SSAR_END_DATETIME <= ?")
        params.append(cmd_end)

    where_sql = ""
    if where_clauses:
        where_sql = " WHERE " + " AND ".join(where_clauses)

    # count total matching rows for pagination
    count_sql = f"SELECT COUNT(*) as cnt FROM observation o{where_sql}"
    # use cached query for count as well (result is a single integer)
    cached_count = cached_query(count_sql, tuple(params))
    total = cached_count[0]["cnt"]

    # select only necessary columns to reduce payload
    # Use correlated subquery to gather distinct session IDs per observation
    select_sql = (
        "SELECT o.REFOBS_ID, o.TYPE, o.REF_START_DATETIME, o.REF_END_DATETIME,"
        " o.CMD_LSAR_START_DATETIME, o.CMD_LSAR_END_DATETIME,"
        " o.CMD_SSAR_START_DATETIME, o.CMD_SSAR_END_DATETIME,"
        " o.LSAR_CONFIG_ID, o.SSAR_CONFIG_ID, o.DATATAKE_ID,"
        " (SELECT GROUP_CONCAT(DISTINCT s2.SESS_ID)"
        "    FROM session_observation s2"
        "    WHERE s2.REFOBS_ID = o.REFOBS_ID) as SESS_ID"
        " FROM observation o"
        f"{where_sql}"
        " ORDER BY o.CMD_SSAR_START_DATETIME LIMIT ? OFFSET ?"
    )

    exec_params = params + [per_page, offset]
    rows = cached_query(select_sql, tuple(exec_params))
    conn.close()

    paginated = rows

    return jsonify({
        "data": paginated,
        "total": total,
        "page": page,
        "per_page": per_page
    })


@app.route("/api/observation/counts", methods=["GET"])
def observation_counts():
    """Return unique counts grouped by search filters."""
    pattern = request.args.get("pattern")
    configs = request.args.getlist("config")  # Get all config values
    imaging = request.args.get("imaging")
    cmd_start = request.args.get("cmd_start")
    cmd_end = request.args.get("cmd_end")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Build WHERE clauses
    where_clauses = []
    params = []

    if pattern:
        p = pattern
        if not p.lower().startswith("oid_"):
            p = f"oid_{p}"
        like = p.replace("*", "%").replace("?", "_")
        where_clauses.append("o.REFOBS_ID LIKE ?")
        params.append(like)

    if configs:
        # Handle multiple config IDs
        placeholders = ",".join(["?" for _ in configs])
        where_clauses.append(f"o.SSAR_CONFIG_ID IN ({placeholders})")
        params.extend(configs)

    if imaging:
        like_im = f"%{imaging}%"
        cols = ["o.REF_START_DATETIME", "o.REF_END_DATETIME", "o.CMD_SSAR_START_DATETIME", "o.CMD_SSAR_END_DATETIME", "o.CMD_LSAR_START_DATETIME", "o.CMD_LSAR_END_DATETIME"]
        cond = " OR ".join([f"{c} LIKE ?" for c in cols])
        where_clauses.append(f"({cond})")
        params.extend([like_im] * len(cols))

    if cmd_start:
        where_clauses.append("o.CMD_SSAR_START_DATETIME >= ?")
        params.append(cmd_start)

    if cmd_end:
        where_clauses.append("o.CMD_SSAR_END_DATETIME <= ?")
        params.append(cmd_end)

    where_sql = ""
    if where_clauses:
        where_sql = " WHERE " + " AND ".join(where_clauses)

    # Get total count of observations matching filters
    count_query = f"SELECT COUNT(*) as total FROM observation o{where_sql}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()["total"]

    # Get count of unique DATATAKE_IDs
    datatake_query = f"SELECT COUNT(DISTINCT DATATAKE_ID) as count FROM observation o{where_sql}"
    cursor.execute(datatake_query, params)
    unique_datatake_count = cursor.fetchone()["count"]

    # Get count of unique SSAR_CONFIG_IDs
    config_query = f"SELECT COUNT(DISTINCT SSAR_CONFIG_ID) as count FROM observation o{where_sql}"
    cursor.execute(config_query, params)
    unique_config_count = cursor.fetchone()["count"]

    # Get count of unique sessions
    session_query = (
        f"SELECT COUNT(DISTINCT s.SESS_ID) as count FROM session_observation s "
        f"JOIN observation o ON s.REFOBS_ID = o.REFOBS_ID{where_sql}"
    )
    cursor.execute(session_query, params)
    unique_session_count = cursor.fetchone()["count"]

    conn.close()

    return jsonify({
        "observation_count": total_count,
        "datatake_count": unique_datatake_count,
        "config_count": unique_config_count,
        "session_count": unique_session_count
    })


@app.route("/api/observation/<refobs_id>")
def get_observation(refobs_id):
    """Return full record for the given REFOBS_ID (single item)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM observation WHERE REFOBS_ID = ?",
        (refobs_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"data": dict(row)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 