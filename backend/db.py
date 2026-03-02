# db.py
# Database connection helpers for the Flask application

import os
import sqlite3

BASE_DIR = os.path.dirname(__file__)
DATABASE = os.path.join(BASE_DIR, "cop_endpoints_db")


def get_db_connection():
    """Return a new sqlite3.Connection with row_factory set to Row."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn