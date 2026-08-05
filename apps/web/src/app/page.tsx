import { Button } from "@kikos/ui/components/button";
import { UserProfile } from "./_components/user-profile";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-chart-1 text-white">
      <Button>Hello World</Button>

      <UserProfile />
    </div>
  );
}
