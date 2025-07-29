import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          <p className="text-center text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            When you use Bitlytics, we collect the following types of information:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Email address, name, and password when you register</li>
            <li><strong>URL Data:</strong> Original URLs, custom codes, titles, and descriptions you provide</li>
            <li><strong>Analytics Data:</strong> Click data, IP addresses, user agents, referrer information, and geographic data</li>
            <li><strong>Usage Data:</strong> How you interact with our service</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide URL shortening and analytics services</li>
            <li>Maintain and improve our service</li>
            <li>Prevent abuse and ensure security</li>
            <li>Communicate with you about your account</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal information with third parties, except:
          </p>
          <ul>
            <li>When required by law</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With your explicit consent</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure password hashing</li>
            <li>Rate limiting and IP blacklisting</li>
            <li>Regular security audits</li>
          </ul>

          <h2>5. Your Rights (GDPR)</h2>
          <p>If you are a resident of the EU, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Update incorrect information</li>
            <li><strong>Erasure:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing of your data</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain your data as long as your account is active. You can request deletion
            of your account and all associated data at any time through your dashboard.
          </p>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies for:
          </p>
          <ul>
            <li>Authentication and session management</li>
            <li>Security features</li>
            <li>Basic functionality</li>
          </ul>
          <p>
            We do not use tracking cookies or third-party analytics cookies.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or want to exercise your rights,
            contact us at: <strong>privacy@bitlytics.com</strong>
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes by posting a notice on our website.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
