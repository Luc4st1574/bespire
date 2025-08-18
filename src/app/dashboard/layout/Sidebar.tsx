/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
import MessageSquare from "@/assets/icons/icon_send_feedback.svg";
import HelpCircle from "@/assets/icons/icon_helpcenter.svg";
import LogOut from "@/assets/icons/icon_logout.svg";
import SidebarMenuSection from "./SidebarMenuSection";
import AccountDropdown from "@/components/ui/AccountDropdown";
import { useState } from "react";
import FeedbackModal from "@/components/modals/FeedbackModal";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAppContext } from "@/context/AppContext";
import { useSidebarMenu } from "@/hooks/useSidebarMenu";

export default function Sidebar() {
  const { mainMenu, exploreMenu, settingsMenu } = useSidebarMenu();

  const [showFeedback, setShowFeedback] = useState(false);
const { user, workspace, } = useAppContext();
  const {  logout } = useAuthActions();

    
  console.log("Sidebar user", user);

  const handleLogout = async () => {
    console.log("logout");
    try {
      await logout();
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Failed to logout.");
    }
  };




  return (
    <aside className="w-64 bg-[#FDFEFD] px-4 py-6 flex flex-col justify-between text-sm text-brand-dark">
      {/* Logo */}
      <div>
        <div className="mb-8">
          <a href="/dashboard">
            <img
              src="/assets/logos/logo_bespire.svg"
              className="h-8 "
              alt="Bespire"
            />
          </a>
        </div>

        {/* Main menu - SidebarMenuSection will now handle the File Manager item */}
        <SidebarMenuSection items={mainMenu} />

        {/* Explore menu */}
        <SidebarMenuSection title="Explore" items={exploreMenu} />
      </div>

      {/* Footer menu */}
      <div className="space-y-3 mt-6">
        <SidebarMenuSection items={settingsMenu} />

        <AccountDropdown
          //@ts-ignore
          workspace={workspace?.companyName}
          role={user?.role || ""}
          //@ts-ignore
          plan={'Pro'}
          //@ts-ignore
          avatar={workspace?.companyImg}
          items={[
            {
              label: "Send Feedback",
              icon: MessageSquare,
              onClick: () => setShowFeedback(true),
            },
            {
              label: "Help Center",
              icon: HelpCircle,
              onClick: () => console.log("Help Center"),
            },
            {
              label: "Log Out",
              icon: LogOut,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
      {showFeedback && <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />}
    </aside>
  );
}