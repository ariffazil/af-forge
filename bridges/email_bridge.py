#!/usr/bin/env python3
"""
email_bridge.py — APA Multi-Backend Email Bridge v2.0
Part of APA (Autonomous Protocol for Applications).
A-FORGE → APA → Email (Brevo SMTP/API + Gmail IMAP).

Backends:
  - SEND: Brevo REST API (primary) or Brevo SMTP relay
  - READ: Gmail IMAP (requires app password) or Gmail API (OAuth)

Port: 18093 (internal, 127.0.0.1)

DITEMPA BUKAN DIBERI — Email sovereignty is forged.
"""

import json, os, hashlib, ssl, logging, urllib.request, urllib.error
import imaplib, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.parser import BytesParser
from email.policy import default
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format='[email_bridge] %(message)s')
log = logging.getLogger(__name__)

# ── Credential Loading ─────────────────────────

def _load_env_file(path="/root/.secrets/kunci-mas.env"):
    """Load KEY=VALUE exports from env file."""
    env = {}
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("export "):
                    line = line[7:]
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env

_kunci_mas = _load_env_file()

def _env(key, default=None):
    return os.environ.get(key, _kunci_mas.get(key, default))

BREVO_API_KEY = _env("BREVO_API_KEY")
BREVO_SENDER_EMAIL = _env("BREVO_SENDER_EMAIL", "arifbfazil@gmail.com")
BREVO_SENDER_NAME = _env("BREVO_SENDER_NAME", "AAA Federation")
GMAIL_CRED_PATH = os.environ.get("EMAIL_CRED_PATH", "/root/.secrets/email/gmail.json")

def _load_gmail_creds():
    if not os.path.exists(GMAIL_CRED_PATH):
        return None
    with open(GMAIL_CRED_PATH) as f:
        creds = json.load(f)
    # Check for placeholder values
    if creds.get("email", "").startswith("YOUR_") or "PLACEHOLDER" in str(creds.get("app_password", "")).upper():
        return None
    return creds


# ── SEND: Brevo REST API ───────────────────────

def _brevo_send(to, subject, body_text, body_html=None, cc=None, bcc=None, reply_to=None, sender_name=None):
    """Send email via Brevo (Sendinblue) transactional API."""
    if not BREVO_API_KEY:
        raise RuntimeError("BREVO_API_KEY not configured in kunci-mas.env")

    payload = {
        "sender": {
            "email": BREVO_SENDER_EMAIL,
            "name": sender_name or BREVO_SENDER_NAME,
        },
        "to": [{"email": addr.strip()} for addr in (to if isinstance(to, list) else [to])],
        "subject": subject,
        "htmlContent": body_html or f"<pre>{body_text}</pre>",
        "textContent": body_text,
    }
    if cc:
        payload["cc"] = [{"email": addr.strip()} for addr in (cc if isinstance(cc, list) else [cc])]
    if bcc:
        payload["bcc"] = [{"email": addr.strip()} for addr in (bcc if isinstance(bcc, list) else [bcc])]
    if reply_to:
        payload["replyTo"] = {"email": reply_to}

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=data,
        headers={
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": BREVO_API_KEY,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode())
            return {
                "message_id": body.get("messageId", ""),
                "status": "sent",
                "provider": "brevo",
            }
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else str(e)
        raise RuntimeError(f"Brevo API error {e.code}: {err_body}")


# ── SEND: Brevo SMTP Relay (fallback) ──────────

def _brevo_smtp_send(to, subject, body_text, body_html=None, cc=None, bcc=None, reply_to=None, sender_name=None):
    """Send email via Brevo SMTP relay (smtp-relay.brevo.com:587)."""
    if not BREVO_API_KEY:
        raise RuntimeError("BREVO_API_KEY not configured")

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{sender_name or BREVO_SENDER_NAME} <{BREVO_SENDER_EMAIL}>"
    msg["To"] = to if isinstance(to, str) else ", ".join(to)
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    if cc:
        msg["Cc"] = cc if isinstance(cc, str) else ", ".join(cc)

    msg.attach(MIMEText(body_text, "plain"))
    if body_html:
        msg.attach(MIMEText(body_html, "html"))

    recipients = ([to] if isinstance(to, str) else list(to))
    if cc:
        recipients += ([cc] if isinstance(cc, str) else list(cc))
    if bcc:
        recipients += ([bcc] if isinstance(bcc, str) else list(bcc))

    ctx = ssl.create_default_context()
    with smtplib.SMTP("smtp-relay.brevo.com", 587) as conn:
        conn.starttls(context=ctx)
        conn.login(BREVO_SENDER_EMAIL, BREVO_API_KEY)
        conn.sendmail(BREVO_SENDER_EMAIL, recipients, msg.as_string())

    return {"message_id": "smtp-" + hashlib.sha256(f"{to}{subject}{datetime.now().isoformat()}".encode()).hexdigest()[:16],
            "status": "sent", "provider": "brevo_smtp"}


# ── READ: Gmail IMAP ───────────────────────────

def _imap_connect():
    creds = _load_gmail_creds()
    if not creds:
        raise RuntimeError(f"Gmail IMAP credentials not ready at {GMAIL_CRED_PATH}")
    ctx = ssl.create_default_context()
    conn = imaplib.IMAP4_SSL(creds["imap_server"], creds.get("imap_port", 993), ssl_context=ctx)
    conn.login(creds["email"], creds["app_password"])
    return conn


def action_search(params):
    conn = _imap_connect()
    conn.select("INBOX")
    query = params.get("query", "ALL")
    limit = min(int(params.get("limit", 20)), 50)
    status, data = conn.search(None, query)
    ids = data[0].split()[-limit:] if data[0] else []
    results = []
    for eid in ids:
        status, msg_data = conn.fetch(eid, "(BODY[HEADER.FIELDS (SUBJECT FROM DATE)])")
        if msg_data and msg_data[0]:
            parser = BytesParser(policy=default)
            msg = parser.parsebytes(msg_data[0][1])
            results.append({
                "id": eid.decode(),
                "subject": str(msg.get("Subject", "")),
                "from": str(msg.get("From", "")),
                "date": str(msg.get("Date", "")),
            })
    conn.logout()
    return {"count": len(results), "results": results}


def action_read(params):
    conn = _imap_connect()
    conn.select("INBOX")
    eid = params["email_id"].encode()
    status, msg_data = conn.fetch(eid, "(RFC822)")
    if not msg_data or not msg_data[0]:
        conn.logout()
        return {"error": "Email not found"}
    parser = BytesParser(policy=default)
    msg = parser.parsebytes(msg_data[0][1])
    body_text = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                body_text = part.get_content()
                break
    else:
        body_text = msg.get_content()
    conn.logout()
    return {
        "id": eid.decode(),
        "subject": str(msg.get("Subject", "")),
        "from": str(msg.get("From", "")),
        "to": str(msg.get("To", "")),
        "date": str(msg.get("Date", "")),
        "body_text": str(body_text)[:10000],
    }


# ── SEND (unified) ─────────────────────────────

def action_send(params):
    to = params["to"]
    subject = params["subject"]
    body = params["body"]
    body_html = params.get("body_html")
    cc = params.get("cc")
    bcc = params.get("bcc")
    reply_to = params.get("reply_to")
    backend = params.get("backend", "brevo")  # brevo | brevo_smtp

    if backend == "brevo_smtp":
        result = _brevo_smtp_send(to, subject, body, body_html, cc, bcc, reply_to)
    else:
        result = _brevo_send(to, subject, body, body_html, cc, bcc, reply_to)

    content_hash = hashlib.sha256(
        f"{to}{subject}{body}".encode()
    ).hexdigest()
    return {
        **result,
        "sha256": content_hash,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Labels (IMAP only) ─────────────────────────

def action_list_labels(params):
    conn = _imap_connect()
    status, data = conn.list()
    labels = []
    for entry in data:
        if isinstance(entry, bytes):
            parts = entry.decode().split(' "/" ')
            if len(parts) >= 2:
                labels.append({"name": parts[1].strip('"'), "flags": parts[0]})
    conn.logout()
    return {"labels": labels}


ACTIONS = {
    "search": action_search,
    "read": action_read,
    "send": action_send,
    "list_labels": action_list_labels,
}


# ── HTTP Server ────────────────────────────────

class EmailHandler(BaseHTTPRequestHandler):
    def _send(self, data, status=200):
        body = json.dumps(data, default=str).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            gmail_creds = _load_gmail_creds()
            brevo_ok = bool(BREVO_API_KEY)
            gmail_ok = bool(gmail_creds)
            ready = brevo_ok  # Brevo = send ready; Gmail = read ready
            backends = []
            if brevo_ok:
                backends.append("brevo-send")
            if gmail_ok:
                backends.append("gmail-imap")
            self._send({
                "ok": True,
                "bridge": "email_bridge",
                "apa_version": "2.0",
                "backends": backends,
                "verbs": sorted(ACTIONS.keys()),
                "brevo_configured": brevo_ok,
                "gmail_configured": gmail_ok,
                "sender": BREVO_SENDER_EMAIL if brevo_ok else None,
                "status": "READY" if ready else "AWAITING_CREDENTIALS",
            })
        else:
            self._send({"error": "not found"}, 404)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            mode = body.get("mode")
            if mode not in ACTIONS:
                self._send({"ok": False, "error": f"Unknown mode: {mode}"}, 400)
                return
            result = ACTIONS[mode](body)
            self._send({"ok": True, "mode": mode, "result": result})
        except Exception as e:
            log.error(f"Error in {body.get('mode', '?')}: {e}")
            self._send({"ok": False, "error": str(e)}, 500)

    def log_message(self, format, *args):
        log.info(f"{self.client_address[0]} - {format % args}")


if __name__ == "__main__":
    port = int(os.environ.get("EMAIL_BRIDGE_PORT", "18093"))
    server = HTTPServer(("127.0.0.1", port), EmailHandler)
    log.info(f"APA Email Bridge v2.0 listening on 127.0.0.1:{port}")
    server.serve_forever()
