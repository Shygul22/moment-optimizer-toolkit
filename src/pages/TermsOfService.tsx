import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="mb-4">
            By accessing and using TP Consulting Services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
          <p className="mb-4">
            TP Consulting Services is a consulting company that provides professional business consulting services across Business Management, Sales & Marketing, and Financial Management. We facilitate consultations, strategic planning, and business development services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <h3 className="text-xl font-medium mb-3">Registration</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must be at least 18 years old to use our service</li>
            <li>One person may not maintain multiple accounts</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Account Termination</h3>
          <p className="mb-4">
            We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Consultant Obligations</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide accurate information about qualifications and experience</li>
            <li>Deliver services as agreed upon with clients</li>
            <li>Maintain professional conduct at all times</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Honor scheduled appointments and commitments</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Client Obligations</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide clear and accurate project requirements</li>
            <li>Make payments as agreed upon</li>
            <li>Respect consultants' time and expertise</li>
            <li>Provide feedback and reviews honestly</li>
            <li>Follow cancellation policies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Payments and Fees</h2>
          <h3 className="text-xl font-medium mb-3">Service Fees</h3>
          <p className="mb-4">
            TP Consulting Services charges fees based on the service package selected. Fee structure will be clearly displayed before any payment is processed.
          </p>
          
          <h3 className="text-xl font-medium mb-3">Refund Policy</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Refunds are processed according to our refund policy</li>
            <li>Disputes should be reported within 30 days</li>
            <li>We reserve the right to investigate all refund requests</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Circumventing our platform for direct payments</li>
            <li>Sharing false or misleading information</li>
            <li>Harassment or inappropriate conduct</li>
            <li>Violating intellectual property rights</li>
            <li>Using the platform for illegal activities</li>
            <li>Attempting to hack or compromise platform security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            TP Consulting Services provides consulting advice and recommendations. We are not responsible for business decisions made by clients based on our recommendations. Our liability is limited to the fees paid for our consulting services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-4">
            TP Consulting Services retains rights to our methodologies and frameworks. Clients retain rights to their business information shared during consultations, but grant us license to use anonymized data for improving our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please contact us at:
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

export default TermsOfService;
