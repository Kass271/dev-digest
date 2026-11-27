#!/usr/bin/env python3
"""PreToolUse guard: Insights.md files are append-only.

Blocks (exit 2, reason on stderr -> fed back to Claude) any Write/Edit/Bash call
that would overwrite, truncate, reorder or erase existing content of a file named
Insights.md. Appends and reads are allowed. Unrelated calls exit 0 untouched.
The Bash check is best-effort pattern matching; Write/Edit checks are exact.
"""
import json
import os
import re
import sys

TARGET = "Insights.md"


def deny(msg: str) -> None:
    print(
        f"insights-guard: {msg} Insights.md is append-only: add new entries or "
        "follow-ups at the END of the file and never modify or remove existing text.",
        file=sys.stderr,
    )
    sys.exit(2)


def read(path: str):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None


def resolve(path: str, cwd: str) -> str:
    return path if os.path.isabs(path) else os.path.join(cwd or os.getcwd(), path)


def check_write(ti: dict, cwd: str) -> None:
    path = ti.get("file_path", "")
    if os.path.basename(path) != TARGET:
        return
    current = read(resolve(path, cwd))
    if current is None:
        return  # creating a new file is fine
    if not ti.get("content", "").startswith(current):
        deny("Write would replace existing content.")


def check_edit(ti: dict, cwd: str) -> None:
    path = ti.get("file_path", "")
    if os.path.basename(path) != TARGET:
        return
    old, new = ti.get("old_string", ""), ti.get("new_string", "")
    current = read(resolve(path, cwd))
    if current is None:
        return
    if not old:
        deny("Edit with empty old_string on an existing file.")
    if not new.startswith(old):
        deny("Edit would change or remove existing text.")
    if not current.rstrip().endswith(old.rstrip()):
        deny("Edit inserts in the middle of the file, not at the end.")


BASH_DESTRUCTIVE = [
    (r"(?<![>&0-9])>(?!>)\s*[\"']?[^\s;|&]*" + re.escape(TARGET), "'>' redirect truncates the file"),
    (r"\bsed\b[^;|&]*\s-[a-zA-Z]*i", "sed -i edits in place"),
    (r"\bperl\b[^;|&]*\s-[a-zA-Z]*i", "perl -i edits in place"),
    (r"\b(rm|mv|truncate|unlink|shred)\b", "command can delete or move the file"),
    (r"\bcp\b[^;|&]*" + re.escape(TARGET) + r"[\"']?\s*($|[;|&])", "cp onto the file overwrites it"),
    (r"\btee\b(?![^;|&]*\s-[a-zA-Z]*a)", "tee without -a overwrites"),
    (r"\bgit\s+(checkout|restore|reset|clean|stash|rm|mv)\b", "git command can revert or remove the file"),
]


def check_bash(ti: dict) -> None:
    cmd = ti.get("command", "")
    if TARGET not in cmd:
        return
    for pattern, why in BASH_DESTRUCTIVE:
        if re.search(pattern, cmd):
            deny(f"Bash blocked ({why}).")


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # not our input; never break unrelated tool calls
    tool, ti, cwd = data.get("tool_name"), data.get("tool_input") or {}, data.get("cwd", "")
    try:
        if tool == "Write":
            check_write(ti, cwd)
        elif tool == "Edit":
            check_edit(ti, cwd)
        elif tool == "Bash":
            check_bash(ti)
    except SystemExit:
        raise
    except Exception as e:  # fail closed only for Insights.md-related calls
        if TARGET in json.dumps(ti):
            deny(f"guard error ({e}).")
    sys.exit(0)


if __name__ == "__main__":
    main()
