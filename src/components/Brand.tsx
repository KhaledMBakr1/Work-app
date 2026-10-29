import { CheckIcon } from "./Icons";

export const APP_NAME = "WorkDays";

export default function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <CheckIcon />
      </span>
      {APP_NAME}
    </span>
  );
}
