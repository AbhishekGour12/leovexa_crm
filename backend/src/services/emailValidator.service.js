import dns from 'dns';
const dnsPromises = dns.promises;

class EmailValidatorService {
  constructor() {
    this.cache = new Map();
    this.blacklistedDomains = new Set([
      'example.com', 'test.com', 'sample.com', 'dummy.com', 'placeholder.com',
      'domain.com', 'website.com', 'fake.com', 'tempmail.com', 'mailinator.com',
      '10minutemail.com', 'guerrillamail.com'
    ]);
  }

  // 1. Basic format & syntax check
  isValidSyntax(email) {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return regex.test(clean);
  }

  // 2. Strict DNS MX Record Verification (Checks if domain actually has active mail servers)
  async verifyDomainMX(domain) {
    if (!domain) return false;
    const cleanDomain = domain.trim().toLowerCase();

    if (this.blacklistedDomains.has(cleanDomain)) {
      return false;
    }

    if (this.cache.has(cleanDomain)) {
      return this.cache.get(cleanDomain);
    }

    try {
      // Lookup MX records strictly
      const mxRecords = await Promise.race([
        dnsPromises.resolveMx(cleanDomain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DNS Timeout')), 4000))
      ]);

      const isValid = Array.isArray(mxRecords) && mxRecords.length > 0 && Boolean(mxRecords[0].exchange);
      this.cache.set(cleanDomain, isValid);
      return isValid;
    } catch (err) {
      // Strictly FALSE if no MX records exist
      this.cache.set(cleanDomain, false);
      return false;
    }
  }

  // 3. Complete Verification Pipeline (Middleware/Service)
  async verifyEmail(email) {
    if (!this.isValidSyntax(email)) {
      return {
        valid: false,
        reason: 'Invalid email syntax format'
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1];

    if (!domain || domain.includes(' ') || !domain.includes('.')) {
      return {
        valid: false,
        reason: 'Invalid email domain'
      };
    }

    const hasValidMX = await this.verifyDomainMX(domain);
    if (!hasValidMX) {
      return {
        valid: false,
        reason: `Domain ${domain} does not have valid active mail (MX) servers or domain does not exist.`
      };
    }

    return {
      valid: true,
      email: cleanEmail,
      domain,
      status: 'VERIFIED_DELIVERABLE'
    };
  }

  // 4. Batch filter utility for lists
  async filterValidLeads(leads) {
    const verifiedLeads = [];
    for (const lead of leads) {
      if (!lead.email) continue;
      const res = await this.verifyEmail(lead.email);
      if (res.valid) {
        lead.email = res.email;
        lead.is_email_verified = true;
        lead.email_verification_status = 'VERIFIED';
        verifiedLeads.push(lead);
      } else {
        console.warn(`⚠️ Rejected fake/unreachable email: ${lead.email} (${res.reason})`);
      }
    }
    return verifiedLeads;
  }
}

export const emailValidator = new EmailValidatorService();
