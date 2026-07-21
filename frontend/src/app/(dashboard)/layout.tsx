import type { Metadata } from "next";
import "../globals.css";
import DashboardLayout from "@/components/dashboard-layout";

export const metadata: Metadata = {
  title: "Budget-Wise | Smart Personal Finance",
  description:
    "Take control of your finances with Budget-Wise. Track income, manage expenses, automate savings with the 50/15/15/20 allocation strategy.",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
