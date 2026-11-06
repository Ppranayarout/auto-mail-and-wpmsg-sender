const TEMPLATES = {
  restaurant_cafe: {
    subject: "Quick idea for {business_name}'s online presence in {area}",
    body: `Hi Team {business_name},

I’m a web developer specializing in fast, high-converting websites for hospitality businesses. I recently noticed {business_name} in {area}, {city} and really admired what you've built.

Most food lovers in {city} look up menus, ambiance, and location on Google before deciding where to dine. Having your own fast, mobile-friendly website helps you:
• Display an interactive digital menu (with prices and photos)
• Take direct table reservations or party bookings without paying aggregator commissions
• Highlight your exact location, Instagram feeds, and Google reviews

I build clean, modern, mobile-responsive websites for restaurants & cafes at very affordable and budget-friendly prices.

Would you be open to seeing a free 2-minute preview design mockup I put together for {business_name}?

Best regards,

Priyadarshi Pranaya Rout
Web Developer
Phone / WhatsApp: +91 78948 43957
Portfolio: https://priyadarshiroutportfolio.vercel.app/`
  },

  gym: {
    subject: "Getting more member inquiries for {business_name}",
    body: `Hi Team {business_name},

I came across {business_name} in {area}, {city} and wanted to reach out. I'm a web developer working with fitness centers and sports studios.

With more people in {city} actively searching for fitness trainers and gyms nearby, a dedicated website can act as your 24/7 sales engine to:
• Capture direct leads for 1-day free trial passes
• Showcase your equipment, training programs (CrossFit, Strength, Zumba), and trainer profiles
• List membership tiers, timings, and transformation stories

I design fast, modern websites tailored for gyms and fitness studios at very reasonable rates.

Can I send over a quick layout concept tailored for {business_name} this week?

Best regards,

Priyadarshi Pranaya Rout
Web Developer
Phone / WhatsApp: +91 78948 43957
Portfolio: https://priyadarshiroutportfolio.vercel.app/`
  },

  clinic: {
    subject: "Online appointment booking & website for {business_name}",
    body: `Hello Team {business_name},

I am a web developer specializing in healthcare and clinic websites. I noticed your clinic in {area}, {city} and wanted to share a quick idea.

Patients today search online for doctors, timings, and specializations before visiting. A professional website for {business_name} can:
• Allow patients to easily book or request appointments online
• Clearly display doctor profiles, available consulting hours, and treatments offered
• Share patient testimonials and direct Google Maps directions to reduce phone inquiry fatigue

I develop reliable, fast, and privacy-conscious websites for clinics and healthcare professionals at very affordable pricing.

Would you be open to reviewing a quick sample layout tailored for {business_name}?

Warm regards,

Priyadarshi Pranaya Rout
Web Developer
Phone / WhatsApp: +91 78948 43957
Portfolio: https://priyadarshiroutportfolio.vercel.app/`
  },

  default: {
    subject: "Modern website proposal for {business_name}",
    body: `Hi Team {business_name},

I'm a web developer specializing in modern web solutions. I came across {business_name} in {area}, {city} and wanted to reach out.

Having a clean, fast, and mobile-friendly website is one of the most effective ways for a business to build credibility and convert Google searches into paying customers.

I create custom, modern websites for businesses at very reasonable and startup-friendly prices.

Would you be open to a quick 5-minute chat or seeing a sample layout I could build for {business_name}?

Best regards,

Priyadarshi Pranaya Rout
Web Developer
Phone / WhatsApp: +91 78948 43957
Portfolio: https://priyadarshiroutportfolio.vercel.app/`
  }
};

function getEmailContent(businessName, category, area = "", city = "") {
  const cat = (category || "").toLowerCase();
  let template;

  if (cat.includes("cafe") || cat.includes("restaurant") || cat.includes("food") || cat.includes("bakery") || cat.includes("dining")) {
    template = TEMPLATES.restaurant_cafe;
  } else if (cat.includes("gym") || cat.includes("fitness") || cat.includes("workout") || cat.includes("crossfit")) {
    template = TEMPLATES.gym;
  } else if (cat.includes("clinic") || cat.includes("hospital") || cat.includes("doctor") || cat.includes("dental") || cat.includes("diagnostics") || cat.includes("skin") || cat.includes("health") || cat.includes("wellness")) {
    template = TEMPLATES.clinic;
  } else {
    template = TEMPLATES.default;
  }

  const cleanCity = city && city.trim() ? city.trim() : "India";
  const cleanArea = area && area.trim() ? area.trim() : cleanCity;

  const subject = template.subject
    .replace(/{business_name}/g, businessName)
    .replace(/{area}/g, cleanArea)
    .replace(/{city}/g, cleanCity);

  const body = template.body
    .replace(/{business_name}/g, businessName)
    .replace(/{area}/g, cleanArea)
    .replace(/{city}/g, cleanCity);

  return { subject, body };
}

module.exports = { getEmailContent };
