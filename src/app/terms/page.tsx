import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          <p className="text-center text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using Bitlytics, you agree to comply with and be bound by the following terms
            and conditions. If you do not agree to these terms, please do not use our service.
          </p>

          <h2>2. Changes to Terms</h2>
          <p>We reserve the right to update these terms at any time without notice. Your
            continued use of the service constitutes acceptance of the updated terms.</p>

          <h2>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use Bitlytics for lawful purposes only</li>
            <li>Not engage in any activities that may harm, disrupt, or interfere with the service</li>
            <li>Provide accurate and truthful information when creating an account</li>
          </ul>

          <h2>4. Account Security</h2>
          <p>You are responsible for maintaining the confidentiality of your account information
            and for all activities conducted through your account.</p>

          <h2>5. Limitation of Liability</h2>
          <p>Under no circumstances shall Bitlytics be liable for any direct, indirect,
            incidental, consequential, or exemplary damages arising from the use of our service.</p>

          <h2>6. Intellectual Property</h2>
          <p>All content, trademarks, and data on this site, including but not limited to
            software, databases, and compilations belong to Bitlytics or its licensors and
            are protected by intellectual property laws.</p>

          <h2>7. Termination</h2>
          <p>We reserve the right to terminate your access to Bitlytics at our discretion without
            notice, should you violate any terms or conditions.</p>

          <h2>8. Governing Law</h2>
          <p>These terms are governed by and construed in accordance with the laws of our
            jurisdiction, and any disputes arising shall be subject to the exclusive jurisdiction
            of the courts in our jurisdiction.</p>

          <h2>9. Contact Information</h2>
          <p>For any questions about these Terms of Service, contact us at: <strong>terms@bitlytics.com</strong></p>
        </CardContent>
      </Card>
    </div>
  )
}
