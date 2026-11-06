import csv
import os
import sys
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from templates import get_email_content

# Configuration defaults (Update with your own details)
DEVELOPER_NAME = "Priyadarshi Pranaya Rout"
DEVELOPER_PHONE = "+91 78948 43957"
PORTFOLIO_LINK = "https://priyadarshiroutportfolio.vercel.app/"

# SMTP Settings (e.g., Gmail with App Password)
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "ppranayarout@gmail.com")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD", "ggep fsrp obqu mucw")  # Gmail 16-character App Password

LEADS_FILE = "leads.csv"
HISTORY_FILE = "sent_history.csv"


def load_sent_history():
    sent = set()
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            for row in reader:
                if row:
                    sent.add(row[0].strip().lower())
    return sent


def log_sent(email, business_name, status):
    file_exists = os.path.exists(HISTORY_FILE)
    with open(HISTORY_FILE, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Email", "Business Name", "Status", "Timestamp"])
        writer.writerow([email, business_name, status, datetime.now().isoformat()])


def personalize_body(body_template: str) -> str:
    return (
        body_template
        .replace("[Your Name]", DEVELOPER_NAME)
        .replace("[Your Phone Number]", DEVELOPER_PHONE)
        .replace("[Your Portfolio Link]", PORTFOLIO_LINK)
    )


def process_leads(is_live_send: bool = False, delay_seconds: int = 15):
    target_csv = LEADS_FILE if os.path.exists(LEADS_FILE) else "leads_template.csv"
    
    if not os.path.exists(target_csv):
        print(f"Error: Neither '{LEADS_FILE}' nor 'leads_template.csv' found.")
        return

    sent_emails = load_sent_history()
    
    server = None
    if is_live_send:
        if not SENDER_PASSWORD or SENDER_EMAIL == "your_email@gmail.com":
            print("\n[ERROR] Missing valid SMTP credentials!")
            print("Please set SENDER_EMAIL and SENDER_PASSWORD environment variables (use a Gmail App Password).")
            print("Example command:")
            print("  $env:SENDER_EMAIL='you@gmail.com'")
            print("  $env:SENDER_PASSWORD='your-16-char-app-password'")
            return
        
        print(f"Connecting to SMTP server {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        print("Connected & authenticated successfully.\n")

    with open(target_csv, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        leads = list(reader)

    print(f"Found {len(leads)} lead(s) in {target_csv}.")
    print(f"Mode: {'LIVE SENDING' if is_live_send else 'DRY RUN (Preview only, no emails will be sent)'}\n")
    print("=" * 60)

    for idx, lead in enumerate(leads, 1):
        name = lead.get("Business Name", "").strip()
        email = lead.get("Email", "").strip()
        category = lead.get("Category", "Business").strip()
        area = lead.get("Area", "Bhubaneswar").strip()

        if not email or "@" not in email:
            print(f"[{idx}] Skipping {name}: Invalid email '{email}'")
            continue

        if email.lower() in sent_emails:
            print(f"[{idx}] Skipping {name} ({email}): Already contacted previously.")
            continue

        subject, raw_body = get_email_content(business_name=name, category=category, area=area)
        body = personalize_body(raw_body)

        print(f"[{idx}] TO: {name} <{email}>")
        print(f"     CATEGORY: {category} | AREA: {area}")
        print(f"     SUBJECT: {subject}")

        if not is_live_send:
            print("     --- PREVIEW BODY ---")
            for line in body.splitlines()[:6]:
                print(f"     | {line}")
            print("     | ... [truncated preview]")
            print("-" * 60)
        else:
            try:
                msg = MIMEMultipart()
                msg["From"] = SENDER_EMAIL
                msg["To"] = email
                msg["Subject"] = subject
                msg.attach(MIMEText(body, "plain"))

                server.send_message(msg)
                print(f"     [SUCCESS] Sent to {email}")
                log_sent(email, name, "SUCCESS")
                sent_emails.add(email.lower())

                if idx < len(leads):
                    print(f"     Waiting {delay_seconds}s before next email...")
                    time.sleep(delay_seconds)
            except Exception as e:
                print(f"     [FAILED] Error sending to {email}: {e}")
                log_sent(email, name, f"FAILED: {e}")

    if server:
        server.quit()
        print("\nAll emails processed. SMTP connection closed.")


if __name__ == "__main__":
    send_mode = "--send" in sys.argv
    process_leads(is_live_send=send_mode)
