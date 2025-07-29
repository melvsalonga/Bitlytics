import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsOfServicePage() {
  return (
    cdiv className="container mx-auto px-4 py-8 max-w-4xl"
      cCarde
        cCardHeadere
          cCardTitle className="text-3xl font-bold text-center"eTerms of Servicec/CardTitlee
          cp className="text-center text-muted-foreground"e
            Last updated: {new Date().toLocaleDateString()}
          c/pe
        c/CardHeadere
        cCardContent className="prose prose-slate max-w-none"e
          ch2e1. Acceptance of Termsc/h2e
          cpe
            By using Bitlytics, you agree to comply with and be bound by the following terms
            and conditions. If you do not agree to these terms, please do not use our service.
          c/pe

          ch2e2. Changes to Termsc/h2e
          cpeWe reserve the right to update these terms at any time without notice. Your
            continued use of the service constitutes acceptance of the updated terms.c/pe

          ch2e3. User Responsibilitiesc/h2e
          cpeYou agree to:c/pe
          cule
            clieUse Bitlytics for lawful purposes onlyc/lie
            clieNot engage in any activities that may harm, disrupt, or interfere with the servicec/lie
            clieProvide accurate and truthful information when creating an accountc/lie
          c/ule

          ch2e4. Account Securityc/h2e
          cpeYou are responsible for maintaining the confidentiality of your account information
            and for all activities conducted through your account.c/pe

          ch2e5. Limitation of Liabilityc/h2e
          cpeUnder no circumstances shall Bitlytics be liable for any direct, indirect,
            incidental, consequential, or exemplary damages arising from the use of our service.c/pe

          ch2e6. Intellectual Propertyc/h2e
          cpeAll content, trademarks, and data on this site, including but not limited to
            software, databases, and compilations belong to Bitlytics or its licensors and
            are protected by intellectual property laws.c/pe

          ch2e7. Terminationc/h2e
          cpeWe reserve the right to terminate your access to Bitlytics at our discretion without
            notice, should you violate any terms or conditions.c/pe

          ch2e8. Governing Lawc/h2e
          cpeThese terms are governed by and construed in accordance with the laws of our
            jurisdiction, and any disputes arising shall be subject to the exclusive jurisdiction
            of the courts in our jurisdiction.c/pe

          ch2e9. Contact Informationc/h2e
          cpeFor any questions about these Terms of Service, contact us at:cstrongeterms@bitlytics.comc/strongec/pe
        c/CardContente
      c/Carde
    c/dive
  )
}
