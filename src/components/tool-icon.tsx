import { Bot, Sparkles } from "lucide-react";
import { CursorIcon } from "@/components/cursor-icon";

export type ToolId = "claude" | "cursor" | "copilot";

type ToolIconProps = {
  tool: ToolId;
  size?: number;
  className?: string;
};

export function ToolIcon({ tool, size = 18, className }: ToolIconProps) {
  if (tool === "claude") return <Bot size={size} className={className} />;
  if (tool === "cursor") return <CursorIcon size={size} className={className} />;
  return <Sparkles size={size} className={className} />;
}
