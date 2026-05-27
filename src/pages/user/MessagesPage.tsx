import { MobileMessageCenter } from "../../components/mobile/MobileMessageCenter";
import { MobileShell } from "../../components/mobile/MobileShell";

export function MessagesPage() {
  return (
    <MobileShell>
      <div className="px-4 py-4">
        <MobileMessageCenter context="user" />
      </div>
    </MobileShell>
  );
}
