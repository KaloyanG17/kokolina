import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      sections={[
        { heading: "Who we are", body: "{{legal business name, address and contact email}}" },
        {
          heading: "What we collect",
          body: "Your email address if you sign up for collection news, and the details you enter at checkout to fulfil your order.",
        },
        {
          heading: "Storage on your device",
          body: "Your bag is saved in your browser so it is still there when you return. We do not use advertising or analytics cookies.",
        },
        { heading: "Who we share it with", body: "{{payment, shipping and email providers}}" },
        { heading: "Your rights", body: "{{how to access, correct or delete your data}}" },
      ]}
    />
  );
}
