import sqlite3
import xml.etree.ElementTree as ET

import os

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "cop_endpoints_db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# ?? Drop BOTH tables first
cursor.execute("DROP TABLE IF EXISTS observation")
cursor.execute("DROP TABLE IF EXISTS session_observation")

# ?? Create session table FIRST
cursor.execute("""
CREATE TABLE session_observation (
    SESS_ID TEXT,
    REFOBS_ID TEXT
)
""")

# ?? Create observation table
cursor.execute("""
CREATE TABLE observation (
    REFOBS_ID TEXT,
    TYPE TEXT,
    REF_START_DATETIME TEXT,
    REF_END_DATETIME TEXT,
    ALONG_TRACK_TIME_OFFSET INTEGER,
    LSAR_SQUINT_TIME_OFFSET INTEGER,
    SSAR_SQUINT_TIME_OFFSET INTEGER,
    LSAR_JOINT_OP_TIME_OFFSET INTEGER,
    SSAR_JOINT_OP_TIME_OFFSET INTEGER,
    PRIORITY TEXT,
    CMD_LSAR_START_DATETIME TEXT,
    CMD_LSAR_END_DATETIME TEXT,
    CMD_SSAR_START_DATETIME TEXT,
    CMD_SSAR_END_DATETIME TEXT,
    LSAR_PATH TEXT,
    SSAR_PATH TEXT,
    LSAR_CONFIG_ID INTEGER,
    SSAR_CONFIG_ID INTEGER,
    DATATAKE_ID TEXT,
    SEGMENT_DATATAKE_ON_SSR TEXT,
    OBS_SUPPORT TEXT,
    INTRODUCED_IN TEXT
)
""")

xml_path = os.path.normpath(os.path.join(BASE_DIR, "..", "db.xml"))
tree = ET.parse(xml_path)
root = tree.getroot()

# ?? Insert Observations
for obs in root.find("OBSERVATIONS").findall("OBS"):
    cursor.execute("""
        INSERT INTO observation VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        obs.findtext("REFOBS_ID"),
        obs.findtext("TYPE"),
        obs.findtext("REF_START_DATETIME"),
        obs.findtext("REF_END_DATETIME"),
        int(obs.findtext("ALONG_TRACK_TIME_OFFSET", 0)),
        int(obs.findtext("LSAR_SQUINT_TIME_OFFSET", 0)),
        int(obs.findtext("SSAR_SQUINT_TIME_OFFSET", 0)),
        int(obs.findtext("LSAR_JOINT_OP_TIME_OFFSET", 0)),
        int(obs.findtext("SSAR_JOINT_OP_TIME_OFFSET", 0)),
        obs.findtext("PRIORITY"),
        obs.findtext("CMD_LSAR_START_DATETIME"),
        obs.findtext("CMD_LSAR_END_DATETIME"),
        obs.findtext("CMD_SSAR_START_DATETIME"),
        obs.findtext("CMD_SSAR_END_DATETIME"),
        obs.findtext("LSAR_PATH"),
        obs.findtext("SSAR_PATH"),
        int(obs.findtext("LSAR_CONFIG_ID", 0)),
        int(obs.findtext("SSAR_CONFIG_ID", 0)),
        obs.findtext("DATATAKE_ID"),
        obs.findtext("SEGMENT_DATATAKE_ON_SSR"),
        obs.findtext("OBS_SUPPORT"),
        obs.findtext("INTRODUCED_IN") or ""
    ))

# ?? Insert Session Mapping
sessions = root.find("SSAR_SESSIONS")

if sessions is not None:
    for sess in sessions.findall("S_IMG_SESSION"):
        sess_id = sess.findtext("SESS_ID")
        refobs_ids_text = sess.findtext("REFOBS_IDS")

        if refobs_ids_text:
            for oid in refobs_ids_text.split():
                cursor.execute("""
                    INSERT INTO session_observation (SESS_ID, REFOBS_ID)
                    VALUES (?, ?)
                """, (sess_id, oid))

# ?? Create indexes
cursor.execute("CREATE INDEX idx_session ON session_observation(SESS_ID)")
cursor.execute("CREATE INDEX idx_obsid ON session_observation(REFOBS_ID)")

conn.commit()

# Debug check
cursor.execute("SELECT COUNT(*) FROM session_observation")
print("Session rows:", cursor.fetchone()[0])

cursor.execute("SELECT COUNT(*) FROM observation")
print("Observation rows:", cursor.fetchone()[0])

conn.close()

print("XML Data Inserted Successfully!")