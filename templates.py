"""
Email templates tailored for Bhubaneswar (BBSR) local businesses.
High-converting, concise, and focused on practical business benefits.
"""

TEMPLATES = {
    "restaurant_cafe": {
        "subject": "Quick idea for {business_name}'s online presence in {area}",
        "body": """Hi Team {business_name},

I’m a web developer based in Bhubaneswar. I recently noticed {business_name} in {area} and really admired what you've built.

Most food lovers in Bhubaneswar look up menus, ambiance, and location on Google before deciding where to dine. Having your own fast, mobile-friendly website helps you:
• Display an interactive, mouth-watering digital menu (with prices and photos)
• Take direct table reservations or party bookings without paying aggregator commissions
• Highlight your exact location, Instagram feeds, and Google reviews

I build clean, modern, mobile-responsive websites for local restaurants & cafes at a very affordable and budget-friendly price.

Would you be open to seeing a free 2-minute preview design mockup I put together for {business_name}?

Best regards,

[Your Name]
Web Developer, Bhubaneswar
Phone / WhatsApp: [Your Phone Number]
Portfolio: [Your Portfolio Link]
"""
    },

    "gym": {
        "subject": "Getting more member inquiries for {business_name}",
        "body": """Hi Team {business_name},

I came across {business_name} in {area} and wanted to reach out. I'm a local web developer working with fitness centers in Bhubaneswar.

With more people in BBSR actively searching for fitness trainers and gyms nearby, a dedicated website can act as your 24/7 sales engine to:
• Capture direct leads for 1-day free trial passes
• Showcase your equipment, training programs (CrossFit, Strength, Zumba), and trainer profiles
• List membership tiers, timings, and transformation stories

I design fast, modern websites tailored for gyms and fitness studios at very reasonable rates.

Can I send over a quick layout concept tailored for {business_name} this week?

Best regards,

[Your Name]
Web Developer, Bhubaneswar
Phone / WhatsApp: [Your Phone Number]
Portfolio: [Your Portfolio Link]
"""
    },

    "clinic": {
        "subject": "Online appointment booking & website for {business_name}",
        "body": """Hello Team {business_name},

I am a web developer based in Bhubaneswar. I noticed your clinic in {area} and wanted to share a quick idea.

Patients today search online for doctors, timings, and specializations before visiting. A professional website for {business_name} can:
• Allow patients to easily book or request appointments online
• Clearly display doctor profiles, available consulting hours, and treatments offered
• Share patient testimonials and direct Google Maps directions to reduce phone inquiry fatigue

I develop reliable, fast, and HIPAA/privacy-conscious websites for local clinics and healthcare professionals at very affordable pricing.

Would you be open to reviewing a quick sample layout tailored for {business_name}?

Warm regards,

[Your Name]
Web Developer, Bhubaneswar
Phone / WhatsApp: [Your Phone Number]
Portfolio: [Your Portfolio Link]
"""
    },

    "default": {
        "subject": "Modern website proposal for {business_name}",
        "body": """Hi Team {business_name},

I'm a web developer based right here in Bhubaneswar. I came across {business_name} and wanted to reach out.

Having a clean, fast, and mobile-friendly website is one of the most effective ways for a local business in BBSR to build credibility and convert Google searches into paying customers.

I create custom, modern websites for local businesses at very reasonable and startup-friendly prices.

Would you be open to a quick 5-minute chat or seeing a sample layout I could build for {business_name}?

Best regards,

[Your Name]
Web Developer, Bhubaneswar
Phone / WhatsApp: [Your Phone Number]
Portfolio: [Your Portfolio Link]
"""
    }
}


def get_email_content(business_name: str, category: str, area: str = "Bhubaneswar") -> tuple[str, str]:
    """Returns (subject, body) personalized for the business category."""
    cat_normalized = category.lower().strip()
    
    if any(k in cat_normalized for k in ["cafe", "restaurant", "food", "dining", "bakery"]):
        template = TEMPLATES["restaurant_cafe"]
    elif any(k in cat_normalized for k in ["gym", "fitness", "workout", "crossfit", "yoga"]):
        template = TEMPLATES["gym"]
    elif any(k in cat_normalized for k in ["clinic", "hospital", "doctor", "dental", "dentist", "healthcare"]):
        template = TEMPLATES["clinic"]
    else:
        template = TEMPLATES["default"]

    area_val = area if area and area.strip() else "Bhubaneswar"
    subject = template["subject"].format(business_name=business_name, area=area_val)
    body = template["body"].format(business_name=business_name, area=area_val)
    return subject, body
