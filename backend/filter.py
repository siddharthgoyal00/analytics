# filters.py
# Encapsulate the logic for filtering rows returned from the database.

# relative import removed to allow direct script execution
from utils import wildcard_to_regex, compile_regex


def filter_by_session(rows, session_input):
    """Return rows matching the given session_input wildcard/regex."""
    if not session_input:
        return rows

    # ensure prefix
    if not session_input.lower().startswith("ssid_"):
        session_input = f"ssid_{session_input}"

    regex_pattern = wildcard_to_regex(session_input)
    full_regex = compile_regex(regex_pattern)

    return [row for row in rows if full_regex.search(row["SESS_ID"])]


def filter_observations(rows, pattern=None, config=None, imaging=None,
                        cmd_start=None, cmd_end=None):
    """Apply the various observation filters in sequence and return the filtered
    list. The incoming `rows` list should already be a list of dictionaries.

    Supports:
      * wildcard/regex `pattern` on REFOBS_ID
      * exact `config` match on SSAR_CONFIG_ID
      * partial datetime search (`imaging`) against REF_/CMD_ fields
      * range filtering on CMD_SSAR_START_DATETIME and CMD_SSAR_END_DATETIME
        using `cmd_start` and `cmd_end` strings (seconds precision).
    """
    if pattern:
        regex_pattern = wildcard_to_regex(pattern)
        full_regex = compile_regex(regex_pattern, prefix="oid_")
        rows = [r for r in rows if full_regex.search(r.get("REFOBS_ID", ""))]

    if config:
        rows = [r for r in rows if str(r.get("SSAR_CONFIG_ID", "")) == str(config)]

    if imaging:
        def matches_imaging(r):
            for key in ("REF_START_DATETIME", "REF_END_DATETIME",
                        "CMD_SSAR_START_DATETIME", "CMD_SSAR_END_DATETIME",
                        "CMD_LSAR_START_DATETIME", "CMD_LSAR_END_DATETIME"):
                if imaging in str(r.get(key, "")):
                    return True
            return False

        rows = [r for r in rows if matches_imaging(r)]

    # treat cmd_start/cmd_end as lexicographic thresholds on the
    # CMD_SSAR_* fields (strip microseconds prefix when comparing)
    if cmd_start:
        def after_start(r):
            ts = r.get("CMD_SSAR_START_DATETIME", "")
            return ts[:len(cmd_start)] >= cmd_start
        rows = [r for r in rows if after_start(r)]

    if cmd_end:
        def before_end(r):
            ts = r.get("CMD_SSAR_END_DATETIME", "")
            return ts[:len(cmd_end)] <= cmd_end
        rows = [r for r in rows if before_end(r)]

    return rows