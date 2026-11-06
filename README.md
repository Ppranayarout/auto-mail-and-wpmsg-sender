# Auto Mail & WhatsApp Sender

An automation project for managing and sending cold email and WhatsApp outreach campaigns using JavaScript and Python.

## 🚀 Features

- Automated cold email sending.
- WhatsApp outreach management.
- CSV-based lead management.
- Customizable email templates.
- Customizable WhatsApp message templates.
- Sent message history tracking.
- WhatsApp outreach dashboard.
- Separate JavaScript and Python implementations for email automation.

## 📁 Project Structure

```text
client/
│
├── leads.csv
├── leads_template.csv
├── sent_history.csv
│
├── send_cold_emails.js
├── send_cold_emails.py
│
├── templates.js
├── templates.py
│
├── whatsapp_dashboard.html
├── whatsapp_dm_templates.md
├── whatsapp_leads.csv
├── whatsapp_outreach.js
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 🛠️ Technologies Used

- JavaScript (Node.js)
- Python
- HTML
- CSV
- npm

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd auto-mail-and-wpmsg-sender
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and configure the credentials required by the scripts.

**Never commit your `.env` file.**

### 4. Prepare lead data

Use the provided CSV templates:

- `leads_template.csv` for email leads.
- `whatsapp_leads.csv` for WhatsApp leads.

### 5. Run the automation

Run the appropriate script:

```bash
node send_cold_emails.js
```

For Python:

```bash
python send_cold_emails.py
```

For WhatsApp outreach:

```bash
node whatsapp_outreach.js
```

## 📊 Outreach Dashboard

Open `whatsapp_dashboard.html` in your browser to access the WhatsApp outreach dashboard.

## 🔒 Security

- Keep API keys and email credentials private.
- Never upload `.env` files.
- Protect customer and lead information.
- Follow email provider policies and WhatsApp messaging guidelines.
- Respect unsubscribe requests and applicable anti-spam regulations.

## 👨‍💻 Author

**Ppranayarout**

---

*Auto Mail & WhatsApp Sender — Outreach Automation Project.*
