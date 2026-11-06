const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { getEmailContent } = require("./templates");

// Simple .env parser without external deps
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed
          .slice(idx + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const DEVELOPER_NAME = process.env.DEVELOPER_NAME || "Priyadarshi Pranaya Rout";
const DEVELOPER_PHONE = process.env.DEVELOPER_PHONE || "+91 78948 43957";
const PORTFOLIO_LINK =
  process.env.PORTFOLIO_LINK || "https://priyadarshiroutportfolio.vercel.app/";

const SENDER_EMAIL = process.env.SENDER_EMAIL || "ppranayarout@gmail.com";
const SENDER_PASSWORD = process.env.SENDER_PASSWORD || "ggep fsrp obqu mucw";

const LEADS_FILE = path.join(__dirname, "leads.csv");
const HISTORY_FILE = path.join(__dirname, "sent_history.csv");

function loadSentHistory() {
  const sent = new Set();
  if (fs.existsSync(HISTORY_FILE)) {
    const lines = fs.readFileSync(HISTORY_FILE, "utf-8").split("\n");
    for (const line of lines) {
      const parts = line.split(",");
      if (parts[0] && parts[0].trim()) {
        sent.add(parts[0].trim().toLowerCase());
      }
    }
  }
  return sent;
}

function logSent(email, businessName, status) {
  const exists = fs.existsSync(HISTORY_FILE);
  const line = `"${email}","${businessName.replace(/"/g, '""')}","${status}","${new Date().toISOString()}"\n`;
  if (!exists) {
    fs.writeFileSync(
      HISTORY_FILE,
      "Email,Business Name,Status,Timestamp\n" + line,
      "utf-8",
    );
  } else {
    fs.appendFileSync(HISTORY_FILE, line, "utf-8");
  }
}

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content
    .split("\r\n")
    .join("\n")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Auto-detect delimiter: tab vs comma
  const delimiter = lines[0].includes("\t") ? "\t" : ",";

  const rawHeaders = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const headers = rawHeaders.map((h) => {
    const lower = h.toLowerCase();
    if (lower === "direct email" || lower === "email address" || lower === "e-mail") return "Email";
    if (lower === "name") return "Business Name";
    return h;
  });

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    let rowValues = [];
    if (delimiter === "\t") {
      rowValues = lines[i].split("\t").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    } else {
      // Basic CSV splitting handling commas inside quotes
      let current = "";
      let inQuotes = false;
      for (let c of lines[i]) {
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === "," && !inQuotes) {
          rowValues.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += c;
        }
      }
      rowValues.push(current.trim().replace(/^["']|["']$/g, ""));
    }

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = rowValues[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

function personalizeBody(body) {
  return body
    .replace(/\[Your Name\]/g, DEVELOPER_NAME)
    .replace(/\[Your Phone Number\]/g, DEVELOPER_PHONE)
    .replace(/\[Your Portfolio Link\]/g, PORTFOLIO_LINK);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const isSendMode = process.argv.includes("--send");
  const leads = parseCSV(LEADS_FILE);
  const sentHistory = loadSentHistory();

  console.log(`\n======================================================`);
  console.log(`BBSR Client Outreach Campaign`);
  console.log(
    `File: ${path.basename(LEADS_FILE)} | Total Records: ${leads.length}`,
  );
  console.log(
    `Mode: ${isSendMode ? "LIVE SENDING" : "DRY RUN (Preview Only - No Emails Sent)"}`,
  );
  console.log(`Sender: ${SENDER_EMAIL || "(Not set yet)"}`);
  console.log(`======================================================\n`);

  let transporter = null;
  if (isSendMode) {
    if (
      !SENDER_EMAIL ||
      !SENDER_PASSWORD ||
      SENDER_EMAIL.includes("your_email")
    ) {
      console.error(
        `[ERROR] Please set SENDER_EMAIL and SENDER_PASSWORD in .env before running with --send.`,
      );
      console.error(
        `For Gmail, generate an App Password at: https://myaccount.google.com/apppasswords`,
      );
      process.exit(1);
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      },
    });

    console.log(`Verifying SMTP connection...`);
    try {
      await transporter.verify();
      console.log(`SMTP Connection verified successfully!\n`);
    } catch (err) {
      console.error(`SMTP Verification Failed:`, err.message);
      process.exit(1);
    }
  }

  let count = 0;
  for (const lead of leads) {
    count++;
    const name = lead["Business Name"] || "Business Owner";
    const email = lead["Email"] || "";
    const category = lead["Category"] || "General";
    const area = lead["Area"] || lead["City"] || "India";
    const city = lead["City"] || lead["Area"] || "India";

    if (!email || !email.includes("@")) {
      console.log(`[${count}] SKIPPED: ${name} (Missing or invalid email)`);
      continue;
    }

    if (sentHistory.has(email.toLowerCase())) {
      console.log(
        `[${count}] SKIPPED: ${name} <${email}> (Already contacted previously)`,
      );
      continue;
    }

    const { subject, body } = getEmailContent(name, category, area, city);
    const finalBody = personalizeBody(body);

    console.log(`[${count}] TO: ${name} <${email}>`);
    console.log(`     LOCATION: ${area}, ${city} | CATEGORY: ${category}`);
    console.log(`     SUBJECT: ${subject}`);

    if (!isSendMode) {
      console.log(`     MESSAGE PREVIEW:`);
      const previewLines = finalBody
        .split("\n")
        .slice(0, 4)
        .map((l) => `       | ${l}`)
        .join("\n");
      console.log(previewLines);
      console.log(`       | ... [remaining message]`);
      console.log(`------------------------------------------------------`);
    } else {
      try {
        console.log(`     Sending email to ${email}...`);
        await transporter.sendMail({
          from: `"${DEVELOPER_NAME}" <${SENDER_EMAIL}>`,
          to: email,
          subject: subject,
          text: finalBody,
        });
        console.log(`     [SUCCESS] Sent to ${email}`);
        logSent(email, name, "SUCCESS");
        sentHistory.add(email.toLowerCase());

        console.log(`     Waiting 15 seconds before next email...`);
        await sleep(15000);
      } catch (err) {
        console.error(`     [ERROR] Failed to send to ${email}:`, err.message);
        logSent(email, name, `ERROR: ${err.message}`);
      }
      console.log(`------------------------------------------------------`);
    }
  }

  console.log(`\nCampaign run complete.`);
}

main().catch(console.error);
