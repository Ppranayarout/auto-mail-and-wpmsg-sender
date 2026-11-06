const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Parse .env if available
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const DEVELOPER_NAME = process.env.DEVELOPER_NAME || "Your Name";
const DEVELOPER_PHONE = process.env.DEVELOPER_PHONE || "+91 98765 43210";
const PORTFOLIO_LINK = process.env.PORTFOLIO_LINK || "https://yourportfolio.com";

function cleanMobileNumber(rawPhone) {
  if (!rawPhone) return null;
  // If multiple numbers separated by slash/comma, take the first valid mobile
  const parts = rawPhone.split(/[\/,]/);
  for (const part of parts) {
    const digits = part.replace(/\D/g, '');
    // Indian mobile numbers typically end with 10 digits starting with 6, 7, 8, or 9
    let mobile = null;
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      mobile = '91' + digits;
    } else if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
      mobile = '91' + digits.slice(1);
    } else if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
      mobile = digits;
    }

    if (mobile) return mobile;
  }
  return null; // Landline or unparseable
}

function getWhatsAppMessage(businessName, category, area) {
  const cat = (category || '').toLowerCase();
  const cleanArea = area || 'Bhubaneswar';

  if (cat.includes('cafe') || cat.includes('restaurant') || cat.includes('food') || cat.includes('bakery')) {
    return `Hi Team ${businessName}! Loved your presence in ${cleanArea}. I'm a web developer from Bhubaneswar. I noticed you don't have a direct mobile-friendly website to showcase your digital menu & take direct table reservations (without 30% aggregator commission). I've created a free 2-minute demo preview mockup for ${businessName}. Can I share the preview link with you?`;
  } else if (cat.includes('gym') || cat.includes('fitness')) {
    return `Hey Team ${businessName}! I'm a web developer based in Bhubaneswar. I help fitness clubs in BBSR get more walk-ins by adding a simple website with 1-day free trial signups & trainer profiles. I put together a quick design concept for ${businessName}—mind if I share a 1-minute look with you?`;
  } else {
    return `Hello Team ${businessName}, greetings from Bhubaneswar! I'm a local web developer helping clinics set up simple online appointment booking and doctor schedules so patients don't have to keep calling your reception. Would you be open to seeing a free sample layout preview tailored for ${businessName}? Thank you!`;
  }
}

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\r\n').join('\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

function generateDashboard(leads) {
  const validLeads = [];
  const landlines = [];

  for (const lead of leads) {
    const name = lead['Business Name'] || 'Business';
    const cat = lead['Category'] || 'General';
    const area = lead['Area'] || 'Bhubaneswar';
    const rawPhone = lead['Phone'] || '';
    const mobile = cleanMobileNumber(rawPhone);

    if (mobile) {
      const msg = getWhatsAppMessage(name, cat, area);
      const encodedMsg = encodeURIComponent(msg);
      const link = `https://wa.me/${mobile}?text=${encodedMsg}`;
      validLeads.push({ name, cat, area, phone: rawPhone, mobile, msg, link });
    } else {
      landlines.push({ name, cat, area, phone: rawPhone });
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BBSR WhatsApp Outreach Dashboard</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f0f2f5; margin: 0; padding: 20px; color: #111b21; }
    .container { max-width: 1000px; margin: 0 auto; }
    header { background: #075e54; color: white; padding: 20px 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    h1 { margin: 0 0 8px 0; font-size: 24px; }
    p { margin: 0; opacity: 0.9; font-size: 14px; }
    .stats { display: flex; gap: 15px; margin-top: 15px; }
    .stat-badge { background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn { background: white; border: 1px solid #d1d7db; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; }
    .filter-btn.active { background: #128c7e; color: white; border-color: #128c7e; }
    .card { background: white; border-radius: 12px; padding: 18px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; gap: 15px; transition: transform 0.15s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.12); }
    .card.contacted { opacity: 0.6; background: #e8f5e9; border: 1px solid #a5d6a7; }
    .info { flex: 1; }
    .biz-name { font-size: 16px; font-weight: 700; color: #111b21; display: flex; align-items: center; gap: 8px; }
    .tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: normal; background: #e7f3ff; color: #1877f2; }
    .biz-sub { font-size: 13px; color: #667781; margin: 4px 0 8px 0; }
    .preview-msg { font-size: 12px; background: #f7f8fa; border-left: 3px solid #25d366; padding: 8px 12px; border-radius: 4px; color: #3b4a54; }
    .action { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 160px; }
    .btn-wa { background: #25d366; color: white; text-decoration: none; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(37,211,102,0.4); }
    .btn-wa:hover { background: #20ba5a; }
    .check-label { font-size: 12px; color: #667781; cursor: pointer; display: flex; align-items: center; gap: 5px; }
    .landline-box { background: #fff3cd; border: 1px solid #ffeeba; border-radius: 12px; padding: 18px; margin-top: 25px; font-size: 13px; }
    .landline-box h3 { margin: 0 0 10px 0; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📱 BBSR WhatsApp Outreach Dashboard</h1>
      <p>Click "Chat on WhatsApp" to open WhatsApp Web or App with the tailored pitch already pre-typed. Just press Enter to send!</p>
      <div class="stats">
        <div class="stat-badge">Total Mobile Leads: ${validLeads.length}</div>
        <div class="stat-badge" id="contactedCount">Contacted: 0</div>
      </div>
    </header>

    <div class="filter-bar">
      <button class="filter-btn active" onclick="filterCards('all')">All (${validLeads.length})</button>
      <button class="filter-btn" onclick="filterCards('cafe')">Cafes & Restaurants</button>
      <button class="filter-btn" onclick="filterCards('gym')">Gyms</button>
      <button class="filter-btn" onclick="filterCards('clinic')">Clinics</button>
    </div>

    <div id="leadsList">
      ${validLeads.map((item, idx) => `
        <div class="card" data-category="${item.cat.toLowerCase()}" id="card-${idx}">
          <div class="info">
            <div class="biz-name">
              ${item.name}
              <span class="tag">${item.cat}</span>
            </div>
            <div class="biz-sub">📍 ${item.area} &nbsp;|&nbsp; 📞 +${item.mobile}</div>
            <div class="preview-msg">"${item.msg}"</div>
          </div>
          <div class="action">
            <a href="${item.link}" target="_blank" class="btn-wa" onclick="markDone(${idx})">
              💬 Chat on WhatsApp
            </a>
            <label class="check-label">
              <input type="checkbox" id="chk-${idx}" onchange="toggleCard(${idx})"> Sent
            </label>
          </div>
        </div>
      `).join('')}
    </div>

    ${landlines.length > 0 ? `
      <div class="landline-box">
        <h3>☎️ Landline / Reception Numbers (${landlines.length})</h3>
        <p>These places listed landline numbers (0674-XXXXXXX) so WhatsApp is not supported. You can call their desk directly:</p>
        <ul>
          ${landlines.map(l => `<li><strong>${l.name}</strong> (${l.area}): ${l.phone}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  </div>

  <script>
    function updateCount() {
      const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
      document.getElementById('contactedCount').textContent = 'Contacted: ' + checked;
    }

    function toggleCard(idx) {
      const chk = document.getElementById('chk-' + idx);
      const card = document.getElementById('card-' + idx);
      if (chk.checked) {
        card.classList.add('contacted');
        localStorage.setItem('wa_lead_' + idx, '1');
      } else {
        card.classList.remove('contacted');
        localStorage.removeItem('wa_lead_' + idx);
      }
      updateCount();
    }

    function markDone(idx) {
      document.getElementById('chk-' + idx).checked = true;
      toggleCard(idx);
    }

    function filterCards(cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');

      document.querySelectorAll('.card').forEach(c => {
        const cCat = c.getAttribute('data-category');
        if (cat === 'all') {
          c.style.display = 'flex';
        } else if (cat === 'cafe' && (cCat.includes('cafe') || cCat.includes('restaurant') || cCat.includes('food') || cCat.includes('bakery'))) {
          c.style.display = 'flex';
        } else if (cat === 'gym' && (cCat.includes('gym') || cCat.includes('fitness'))) {
          c.style.display = 'flex';
        } else if (cat === 'clinic' && (cCat.includes('clinic') || cCat.includes('dental') || cCat.includes('diagnostics') || cCat.includes('health'))) {
          c.style.display = 'flex';
        } else {
          c.style.display = 'none';
        }
      });
    }

    // Restore saved state
    window.onload = function() {
      for (let i = 0; i < ${validLeads.length}; i++) {
        if (localStorage.getItem('wa_lead_' + i) === '1') {
          const chk = document.getElementById('chk-' + i);
          if (chk) {
            chk.checked = true;
            document.getElementById('card-' + i).classList.add('contacted');
          }
        }
      }
      updateCount();
    };
  </script>
</body>
</html>`;

  const dashboardPath = path.join(__dirname, 'whatsapp_dashboard.html');
  fs.writeFileSync(dashboardPath, html, 'utf-8');
  console.log(`\n======================================================`);
  console.log(`✅ WhatsApp Outreach Dashboard Generated Successfully!`);
  console.log(`Path: ${dashboardPath}`);
  console.log(`Mobile WhatsApp Leads: ${validLeads.length}`);
  console.log(`Landline / Desk Contacts: ${landlines.length}`);
  console.log(`======================================================\n`);
  return dashboardPath;
}

const leads = parseCSV(path.join(__dirname, 'whatsapp_leads.csv'));
const dashboardPath = generateDashboard(leads);

// Open dashboard in default browser on Windows
console.log('Opening WhatsApp Dashboard in your browser...');
exec(`start "" "${dashboardPath}"`);
