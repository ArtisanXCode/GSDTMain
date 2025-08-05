
/*
  # Create Legal Pages

  1. Insert Legal Pages
    - Terms of Service
    - Privacy Policy  
    - Law Enforcement Request
    - Cookies Notice
    - Risk Disclosure

  2. Set default content for each legal page
*/

-- Insert Legal Pages
INSERT INTO cms_pages (title, slug, content, status, created_at, updated_at) VALUES
  (
    'Terms of Service',
    'legal-terms-of-service',
    '<h1>Terms of Service</h1>
    <p>Last updated: [Date]</p>
    
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing and using GSDC services, you accept and agree to be bound by these Terms of Service.</p>
    
    <h2>2. Description of Service</h2>
    <p>GSDC is a digital stablecoin backed by a basket of emerging market currencies including CNH, BRL, INR, ZAR, IDR, and THB.</p>
    
    <h2>3. User Obligations</h2>
    <p>Users must comply with all applicable laws and regulations when using GSDC services.</p>
    
    <h2>4. Risk Factors</h2>
    <p>Digital assets involve significant risks. Please review our Risk Disclosure for detailed information.</p>
    
    <h2>5. Limitation of Liability</h2>
    <p>GSDC services are provided "as is" without warranties of any kind.</p>
    
    <h2>6. Contact Information</h2>
    <p>For questions about these terms, please contact us through our official channels.</p>',
    'active',
    now(),
    now()
  ),
  (
    'Privacy Policy',
    'legal-privacy-policy',
    '<h1>Privacy Policy</h1>
    <p>Last updated: [Date]</p>
    
    <h2>1. Information We Collect</h2>
    <p>We collect information you provide directly to us, such as when you create an account, complete KYC verification, or contact us.</p>
    
    <h2>2. How We Use Your Information</h2>
    <p>We use your information to provide, maintain, and improve our services, process transactions, and comply with legal obligations.</p>
    
    <h2>3. Information Sharing</h2>
    <p>We do not sell, trade, or rent your personal information to third parties without your consent, except as described in this policy.</p>
    
    <h2>4. Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
    
    <h2>5. Your Rights</h2>
    <p>You have the right to access, update, or delete your personal information. Contact us to exercise these rights.</p>
    
    <h2>6. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, please contact us through our official channels.</p>',
    'active',
    now(),
    now()
  ),
  (
    'Law Enforcement Request',
    'legal-law-enforcement',
    '<h1>Law Enforcement Request Policy</h1>
    <p>Last updated: [Date]</p>
    
    <h2>1. Overview</h2>
    <p>GSDC is committed to cooperating with law enforcement agencies while protecting user privacy and complying with applicable laws.</p>
    
    <h2>2. Information Requests</h2>
    <p>We respond to valid legal requests from law enforcement agencies in accordance with applicable laws and regulations.</p>
    
    <h2>3. Required Documentation</h2>
    <p>All law enforcement requests must be:</p>
    <ul>
      <li>In writing on official letterhead</li>
      <li>Signed by an authorized official</li>
      <li>Include specific details about the information requested</li>
      <li>Demonstrate legal authority for the request</li>
    </ul>
    
    <h2>4. User Notification</h2>
    <p>We may notify users of information requests unless legally prohibited from doing so.</p>
    
    <h2>5. Contact Information</h2>
    <p>Law enforcement agencies should submit requests through our designated legal channels.</p>',
    'active',
    now(),
    now()
  ),
  (
    'Cookies Notice',
    'legal-cookies-notice',
    '<h1>Cookies Notice</h1>
    <p>Last updated: [Date]</p>
    
    <h2>1. What Are Cookies</h2>
    <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide a better user experience.</p>
    
    <h2>2. Types of Cookies We Use</h2>
    <h3>Essential Cookies</h3>
    <p>These cookies are necessary for the website to function properly and cannot be disabled.</p>
    
    <h3>Analytics Cookies</h3>
    <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
    
    <h3>Functional Cookies</h3>
    <p>These cookies enable enhanced functionality and personalization, such as remembering your preferences.</p>
    
    <h2>3. Managing Cookies</h2>
    <p>You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
    
    <h2>4. Third-Party Cookies</h2>
    <p>Some cookies may be set by third-party services that appear on our pages.</p>
    
    <h2>5. Updates to This Notice</h2>
    <p>We may update this Cookies Notice from time to time. Please review it periodically.</p>',
    'active',
    now(),
    now()
  ),
  (
    'Risk Disclosure',
    'legal-risk-disclosure',
    '<h1>Risk Disclosure</h1>
    <p>Last updated: [Date]</p>
    
    <h2>1. General Risk Warning</h2>
    <p>Digital assets, including GSDC, involve significant risks. You should carefully consider whether trading or holding digital assets is suitable for you.</p>
    
    <h2>2. Market Risk</h2>
    <p>The value of GSDC may fluctuate due to changes in the underlying basket currencies (CNH, BRL, INR, ZAR, IDR, THB) and market conditions.</p>
    
    <h2>3. Technology Risk</h2>
    <p>Blockchain technology is relatively new and unproven. Technical issues, security vulnerabilities, or protocol changes may affect GSDC.</p>
    
    <h2>4. Regulatory Risk</h2>
    <p>Regulatory changes or government actions may impact the availability, use, or value of GSDC in certain jurisdictions.</p>
    
    <h2>5. Liquidity Risk</h2>
    <p>There may be limited liquidity for GSDC on exchanges, which could affect your ability to buy or sell at desired prices.</p>
    
    <h2>6. Counterparty Risk</h2>
    <p>GSDC relies on various service providers and counterparties. Their failure or default could impact GSDC operations.</p>
    
    <h2>7. Loss of Access</h2>
    <p>If you lose access to your wallet or private keys, you may permanently lose access to your GSDC tokens.</p>
    
    <h2>8. No Investment Advice</h2>
    <p>This disclosure does not constitute investment advice. Consult with financial professionals before making investment decisions.</p>',
    'active',
    now(),
    now()
  )
ON CONFLICT (slug) DO NOTHING;
