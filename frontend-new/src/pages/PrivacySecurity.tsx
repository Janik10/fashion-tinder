import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Eye, Lock, FileText, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacySecurity() {
  const navigate = useNavigate();

  const policies = [
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information",
      lastUpdated: "January 15, 2025",
      icon: Eye,
      content: [
        "We collect information you provide directly to us, such as when you create an account or interact with fashion items.",
        "We use your information to provide, maintain, and improve our services, including personalized fashion recommendations.",
        "We do not sell, trade, or transfer your personal information to third parties without your consent.",
        "Your fashion preferences and interactions are used to improve our matching algorithm.",
        "We implement appropriate security measures to protect your personal information.",
        "You have the right to access, update, or delete your personal information at any time."
      ]
    },
    {
      title: "Terms of Service",
      description: "The legal agreement for using Fashion Tinder",
      lastUpdated: "January 15, 2025",
      icon: FileText,
      content: [
        "By using Fashion Tinder, you agree to these terms and conditions.",
        "You must be at least 13 years old to use our service.",
        "You are responsible for maintaining the confidentiality of your account.",
        "You agree not to use the service for any unlawful purposes.",
        "We reserve the right to terminate accounts that violate our community guidelines.",
        "These terms may be updated from time to time, and we will notify you of significant changes."
      ]
    },
    {
      title: "Data Protection",
      description: "How we keep your data safe and secure",
      lastUpdated: "January 15, 2025",
      icon: Lock,
      content: [
        "All data is encrypted in transit and at rest using industry-standard protocols.",
        "We regularly audit our security practices and update our systems.",
        "Access to your personal data is restricted to authorized personnel only.",
        "We comply with GDPR, CCPA, and other applicable privacy regulations.",
        "We conduct regular security assessments and penetration testing.",
        "In the event of a data breach, we will notify affected users within 72 hours."
      ]
    },
    {
      title: "Community Guidelines",
      description: "Rules for a safe and positive community experience",
      lastUpdated: "January 15, 2025",
      icon: Shield,
      content: [
        "Be respectful and kind to all community members.",
        "Do not share inappropriate, offensive, or harmful content.",
        "Respect intellectual property rights of fashion brands and creators.",
        "Do not engage in harassment, bullying, or discriminatory behavior.",
        "Report any suspicious or inappropriate activity to our moderation team.",
        "Violation of these guidelines may result in account suspension or termination."
      ]
    }
  ];

  const PolicyCard = ({ policy }: { policy: typeof policies[0] }) => (
    <Card className="p-6 mb-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <policy.icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{policy.title}</h3>
            <Badge variant="outline" className="text-xs">
              Updated {policy.lastUpdated}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {policy.description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {policy.content.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background page-enter pb-20">
      {/* Header */}
      <header className="p-6 pt-12">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Privacy & Security</h1>
        </div>
        <p className="text-muted-foreground">
          Your privacy and security are our top priority
        </p>
      </header>

      <div className="px-6">
        {/* Important Notice */}
        <Card className="p-6 mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Important Notice
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                These policies are effective as of January 15, 2025. We may update them from time to time,
                and we will notify you of any material changes through the app or via email.
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-16 flex-col gap-1"
              onClick={() => navigate('/settings')}
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs">Privacy Settings</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-1"
              onClick={() => {
                // Would integrate with backend to trigger data export
                alert("Data export will be emailed to you within 24 hours.");
              }}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Export Data</span>
            </Button>
          </div>
        </Card>

        {/* Policies */}
        {policies.map((policy, index) => (
          <PolicyCard key={index} policy={policy} />
        ))}

        {/* Contact Information */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Data Protection Officer</p>
              <p className="text-muted-foreground">privacy@fashiontinder.com</p>
            </div>
            <div>
              <p className="font-medium">Security Team</p>
              <p className="text-muted-foreground">security@fashiontinder.com</p>
            </div>
            <div>
              <p className="font-medium">General Support</p>
              <p className="text-muted-foreground">support@fashiontinder.com</p>
            </div>
          </div>
        </Card>

        {/* Legal Disclaimer */}
        <Card className="p-6 mb-6 bg-muted/30">
          <h3 className="text-sm font-semibold mb-2">Legal Disclaimer</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is a demo application created for educational purposes.
            The policies outlined above are examples and do not constitute
            actual legal documents. In a production application, these would
            be drafted by legal professionals and comply with applicable laws
            and regulations.
          </p>
        </Card>
      </div>

      <Navigation />
    </div>
  );
}