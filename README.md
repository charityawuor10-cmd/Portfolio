#Charity Awuor- Developer Portfolio

A sleek, dark-mode developer portfolio with code-inspired aesthetics, smooth animations, and a fully validated contact form wired to a Node.js backend.

---

## 📁 Folder Structure

```
portfolio/
├── index.html                  ← Main HTML (all sections)
├── assets/
│   ├── css/
│   │   └── style.css           ← Complete stylesheet (CSS variables, responsive)
│   ├── js/
│   │   └── app.js              ← All interactive behaviour (vanilla JS)
│   ├── images/
│   │   ├── favicon.svg         ← SVG favicon
│   │   └── resume.pdf          ← Place your resume PDF here
│   └── fonts/                  ← Local fonts (if needed — currently uses Google Fonts)
└── README.md
```

---

## 🚀 Getting Started

### Option 1 — Static (no backend)

Just open `index.html` in any modern browser — no build step required.

```bash
# Or serve locally with any static server:
npx serve .
# or
python3 -m http.server 3000
```

The contact form will simulate a network request (1.5 s delay) without sending real data.

---

### Option 2 — With Node.js Backend

The form is pre-wired to POST to `/api/contact`. To activate it:

**1. Create a Node.js server (`server.js`):**

```js
const express  = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: `"${name}" <${email}>`,
    to: 'hello@alexchen.dev',
    subject: `[Portfolio] ${subject}`,
    text: message,
  });

  res.json({ ok: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

**2. Install dependencies:**
```bash
npm init -y
npm install express nodemailer dotenv
```

**3. Create `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

**4. Uncomment the `fetch` block in `assets/js/app.js`** (marked `INTEGRATION POINT`).

**5. Run:**
```bash
node server.js
```

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Design** | Dark terminal aesthetic · JetBrains Mono + Sora |
| **Loader** | Animated progress bar with percentage |
| **Custom cursor** | Dot + ring with hover expansion |
| **Dark / Light mode** | Toggle with `localStorage` persistence |
| **Terminal typewriter** | Auto-typing hero terminal effect |
| **Scroll reveal** | `IntersectionObserver` staggered fade-in |
| **Skill bars** | Animated on scroll into view |
| **Project filter** | Client-side filter by category |
| **Contact form** | Full validation + Node.js backend ready |
| **Back to top** | Appears after 400px scroll |
| **SEO** | Full meta, OG, Twitter Card tags |
| **Responsive** | Mobile-first, tested at 320px–1440px |
| **Accessible** | ARIA labels, keyboard navigation, focus states |
| **Performance** | Zero dependencies, lazy images, passive listeners |

---

## 🎨 Customisation

All design tokens live in CSS variables at the top of `style.css`:

```css
:root {
  --accent:  #00ff9d;   /* Change to your brand colour */
  --bg:      #0c0e14;   /* Dark background */
  --heading: #e8edf5;   /* Heading colour */
  /* ... */
}
```

To swap fonts, replace the Google Fonts link in `index.html` and update `--font-mono` / `--font-sans`.

---

## 📦 Dependencies

**None.** Pure HTML, CSS, and Vanilla JavaScript.

- Google Fonts (JetBrains Mono + Sora) — loaded from CDN
- Optional: `express` + `nodemailer` for the backend contact endpoint

---

## 📝 Licence

MIT — use freely for personal or commercial projects.
