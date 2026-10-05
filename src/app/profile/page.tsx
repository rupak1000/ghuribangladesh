import type { Metadata } from "next";
import { ProfileView } from "@/components/me/ProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <ProfileView />;
}
