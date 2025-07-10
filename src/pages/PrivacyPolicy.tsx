
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            Welcome to TP Consulting Services ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our consulting services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <h3 className="text-xl font-medium mb-3">Personal Information</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Name and contact information (email, phone number)</li>
            <li>Business information and requirements</li>
            <li>Financial information relevant to consulting services</li>
            <li>Payment and billing information</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Business Information</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Company details and organizational structure</li>
            <li>Financial data and business performance metrics</li>
            <li>Marketing strategies and sales information</li>
            <li>Communication records and consultation notes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>To provide Business Management consulting services</li>
            <li>To develop Sales & Marketing strategies for your business</li>
            <li>To offer Financial Management advice and planning</li>
            <li>To process payments and manage billing</li>
            <li>To communicate with you about our services and progress</li>
            <li>To improve our consulting methodologies and service quality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          <p className="mb-4">
            We do not sell, trade, or rent your personal or business information to third parties. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>With your explicit consent for specific business purposes</li>
            <li>With payment processors for transaction handling</li>
            <li>When required by law or to protect our rights</li>
            <li>In anonymized form for improving our service offerings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal and business data against unauthorized access, alteration, disclosure, or destruction. All client information is treated with strict confidentiality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Access and update your personal and business information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request data portability</li>
            <li>Lodge a complaint with supervisory authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p>TP Consulting Services</p>
            <p>Phone: +91 9092406569</p>
            <p>Email: tpconsultingservicesoff@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
