import { signOut } from "@/app/login/actions";
import Brand from "./Brand";
import { LogoutIcon } from "./Icons";

type Props = { name: string; role: "worker" | "admin" };

export default function TopBar({ name, role }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <div className="topbar-user">
          <span className="avatar" aria-hidden="true">
            {(name || "?").trim().charAt(0).toUpperCase()}
          </span>
          <span className="topbar-name">
            {name || "Account"}
            <small>{role === "admin" ? "Admin" : "Worker"}</small>
          </span>
          <form action={signOut}>
            <button className="icon-button" aria-label="Log out" title="Log out">
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
