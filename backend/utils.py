# utils.py
# Miscellaneous helpers used across multiple endpoints

import re


def parse_page(val):
    """Safely parse the `page` query parameter into a 1‑based integer.
    Returns 1 for invalid or missing values."""
    try:
        page = int(val or 1)
        if page < 1:
            page = 1
    except (ValueError, TypeError):
        page = 1
    return page


def wildcard_to_regex(pattern):
    """Convert a shell-style wildcard string (`*`/`?`) into a regex fragment."""
    return pattern.replace("*", ".*").replace("?", ".")


def compile_regex(pattern, prefix="", flags=re.IGNORECASE):
    """Compile a regex anchored at start, optionally adding a prefix.

    Returns the compiled regex or raises re.error if invalid.
    """
    return re.compile(f"^{prefix}{pattern}", flags)