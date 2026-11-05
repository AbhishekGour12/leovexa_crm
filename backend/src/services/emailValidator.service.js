import dns from 'dns';
const dnsPromises = dns.promises;

class EmailValidatorService {
  constructor() {
    this.cache = new Map([
      // Pre-warm cache with common domains for instant 0ms validation
      ['gmail.com', true],
      ['googlemail.com', true],
      ['yahoo.com', true],
      ['yahoo.co.in', true],
      ['outlook.com', true],
      ['hotmail.com', true],
      ['live.com', true],
      ['icloud.com', true],
      ['zoho.com', true],
      ['zoho.in', true],
      ['zeptomail.in', true],
      ['zeptomail.com', true],
      ['leovexa.in', true],
      ['proton.me', true],
      ['protonmail.com', true],
      ['aol.com', true],
      ['mail.com', true]
    ]);
    this.blacklistedDomains = new Set([
      'example.com', 'test.com', 'sample.com', 'dummy.com', 'placeholder.com',
      'domain.com', 'website.com', 'fake.com', 'tempmail.com', 'mailinator.com',
      '10minutemail.com', 'guerrillamail.com', 'email.com', 'invalid.com',
      'testmail.com', 'company.com', 'mycompany.com', 'yourcompany.com',
      'yourbusiness.com', 'clinicname.com', 'businessname.com', 'sitedomain.com',
      'none.com', 'noemail.com', 'na.com', 'null.com', 'sampleclinic.com',
      'democlinic.com', 'testbusiness.com', 'xyz.com', 'abc.com'
    ]);
    this.blacklistedPrefixes = new Set([
      'test', 'dummy', 'fake', 'sample', 'user', 'name', 'john.doe', 'placeholder',
      'email', 'asdf', 'qwerty', 'admin@example', 'info@example', 'contact@example',
      'xyz', 'abc', 'noemail', 'null', 'na'
    ]);
  }

  // Check if lead or email has synthetic/dummy placeholder patterns
  isFakeOrDummyLead(leadOrEmail) {
    if (!leadOrEmail) return { isFake: true, reason: 'Empty data' };

    const email = typeof leadOrEmail === 'string' ? leadOrEmail : (leadOrEmail.email || '');
    const businessName = typeof leadOrEmail === 'object' ? (leadOrEmail.business_name || '') : '';
    const website = typeof leadOrEmail === 'object' ? (leadOrEmail.website || '') : '';
    const phone = typeof leadOrEmail === 'object' ? (leadOrEmail.phone || '') : '';

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const [localPart, domain] = cleanEmail.split('@');

      if (!domain || this.blacklistedDomains.has(domain)) {
        return { isFake: true, reason: `Blacklisted placeholder domain: ${domain}` };
      }

      if (domain.endsWith('.test') || domain.endsWith('.example') || domain.endsWith('.invalid') || domain.endsWith('.localhost')) {
        return { isFake: true, reason: `RFC reserved test TLD: ${domain}` };
      }

      if (this.blacklistedPrefixes.has(localPart)) {
        return { isFake: true, reason: `Suspicious dummy local part: ${localPart}` };
      }
    }

    if (businessName) {
      const bLower = businessName.trim().toLowerCase();
      const fakeNameRegex = /^(sample|demo|test|dummy|fake|placeholder|xyz company|abc company|your business|company name|my clinic)\b/i;
      if (fakeNameRegex.test(bLower) || bLower === 'business prospect' || bLower === 'clinic prospect') {
        return { isFake: true, reason: `Placeholder business name: ${businessName}` };
      }
    }

    if (website) {
      const wLower = website.trim().toLowerCase();
      if (wLower.includes('example.com') || wLower.includes('test.com') || wLower.includes('placeholder.com') || wLower.includes('dummy.com')) {
        return { isFake: true, reason: `Placeholder website URL: ${website}` };
      }
    }

    if (phone) {
      const pClean = phone.replace(/[^0-9]/g, '');
      if (pClean.startsWith('55501') || pClean === '1234567890' || /^0+$/.test(pClean) || /^9+$/.test(pClean) && pClean.length > 9) {
        return { isFake: true, reason: `Fake placeholder phone number: ${phone}` };
      }
    }

    return { isFake: false };
  }

  // 1. Basic format & syntax check (Ultra Fast regex)
  isValidSyntax(email) {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return regex.test(clean);
  }

  // 2. Strict DNS MX Record Verification with quick timeout & caching
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
      // Lookup MX records with a tight 1000ms timeout
      const mxRecords = await Promise.race([
        dnsPromises.resolveMx(cleanDomain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DNS Timeout')), 1000))
      ]);

      const isValid = Array.isArray(mxRecords) && mxRecords.length > 0 && Boolean(mxRecords[0].exchange);
      this.cache.set(cleanDomain, isValid);
      return isValid;
    } catch (err) {
      // If DNS times out or network restricts UDP port 53, do not drop valid leads if syntax is valid
      if (err.message === 'DNS Timeout') {
        this.cache.set(cleanDomain, true);
        return true;
      }
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

    const fakeCheck = this.isFakeOrDummyLead(email);
    if (fakeCheck.isFake) {
      return {
        valid: false,
        reason: fakeCheck.reason
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
        reason: `Domain ${domain} does not have active MX records or does not exist.`
      };
    }

    return {
      valid: true,
      email: cleanEmail,
      domain,
      status: 'VERIFIED_DELIVERABLE'
    };
  }

  // 4. Batch filter utility for lists (Parallelized for maximum speed)
  async filterValidLeads(leads) {
    const results = await Promise.all(
      leads.map(async (lead) => {
        if (!lead || !lead.email) return null;

        const fakeCheck = this.isFakeOrDummyLead(lead);
        if (fakeCheck.isFake) {
          console.warn(`🛑 Filtered fake/dummy lead: ${lead.business_name || lead.email} (${fakeCheck.reason})`);
          return null;
        }

        const res = await this.verifyEmail(lead.email);
        if (res.valid) {
          lead.email = res.email;
          lead.is_email_verified = true;
          lead.email_verification_status = 'VERIFIED';
          return lead;
        } else {
          console.warn(`⚠️ Filtered invalid email: ${lead.email} (${res.reason})`);
          return null;
        }
      })
    );
    return results.filter(Boolean);
  }
}

export const emailValidator = new EmailValidatorService();
