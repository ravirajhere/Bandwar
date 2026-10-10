# Security Policy

## Supported Versions

We actively maintain the following versions of the Bandwar Archive.

| Version | Supported          | Notes |
|---------|--------------------|-------|
| 5.x     | ✅ Yes             | Current |
| 4.x     | ⚠️ Critical fixes only | Legacy |
| 3.x     | ❌ No              | Deprecated |
| < 3.x   | ❌ No              | Deprecated |

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability,
please **DO NOT open a public issue**. Instead, report it privately.

### 📧 How to Report

Send an email to **bandwar.archive@gmail.com** with:

1. **Subject:** `[SECURITY] Brief description`
2. **Description:** What you found and where
3. **Impact:** What could go wrong
4. **Steps to Reproduce:** How to see the issue
5. **Suggested Fix** (optional)
6. **Your Name/Handle** (for credit, if you wish)

### ⏱️ What to Expect

| Timeline | Response |
|----------|----------|
| **48 hours** | Acknowledgment of your report |
| **7 days** | Initial assessment and severity classification |
| **30 days** | Fix deployed or status update |
| **After fix** | Public disclosure (with your consent) |

We follow [Coordinated Vulnerability Disclosure](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html).

---

## Scope

### ✅ In Scope
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Information disclosure
- Authentication/authorization flaws (if applicable)
- Denial of service (DoS)
- Content injection
- Supply chain attacks
- Broken links to malicious content

### ❌ Out of Scope
- Missing HTTP security headers (we have most)
- SPF/DKIM/DMARC misconfiguration
- Rate limiting issues
- Self-XSS
- Social engineering
- Physical attacks
- Content disputes (use the content correction template instead)
- Known issues in third-party dependencies (report upstream)

---

## Security Measures Already in Place

- ✅ HTTPS enforced (HSTS with preload)
- ✅ Content Security Policy headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy (disabled geolocation, microphone, camera)
- ✅ No inline scripts (except build-generated JSON-LD)
- ✅ HTML escaping on all user content
- ✅ No backend (static site — minimal attack surface)
- ✅ Dependency updates via Dependabot
- ✅ All third-party assets self-hosted (no CDN attacks)

---

## Thank You

Security researchers who responsibly disclose vulnerabilities will be
credited in our [CHANGELOG.md](CHANGELOG.md) and [humans.txt](humans.txt)
(unless they request to remain anonymous).

**We appreciate your help in keeping Bandwar Archive safe.**

---

## Contact

- **📧 Security:** [bandwar.archive@gmail.com](mailto:bandwar.archive@gmail.com)
- **📧 General:** [bandwar.archive@gmail.com](mailto:bandwar.archive@gmail.com)
- **🌐 Website:** https://bandwar.vercel.app