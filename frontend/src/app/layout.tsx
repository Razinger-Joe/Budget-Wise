import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget-Wise | Smart Personal Finance",
  description:
    "Take control of your finances with Budget-Wise. Track income, manage expenses, automate savings with the 50/15/15/20 allocation strategy.",
  keywords: ["budget", "finance", "savings", "expense tracker", "income"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
