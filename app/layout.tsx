import "./globals.css";

export const metadata = {
  title: "OnboardWatch — fresher onboarding status tracker",
  description: "Crowd-sourced onboarding delay reports for Indian IT fresher batches.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
