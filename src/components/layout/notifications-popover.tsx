"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconBell } from "@tabler/icons-react";

export type Notification = {
  id: string;
  fallback: string;
  text: string;
  time: string;
};

const sampleNotifications: Notification[] = [
  {
    id: "1",
    fallback: "NM",
    text: "New feature available: AI Prompt Enhancer",
    time: "5m ago",
  },
  {
    id: "2",
    fallback: "JV",
    text: "Your TOTP code was copied to clipboard",
    time: "10m ago",
  },
  {
    id: "3",
    fallback: "AR",
    text: "JSON validation completed successfully",
    time: "1h ago",
  },
];

export function NotificationsPopover({
  notifications = sampleNotifications,
}: {
  notifications?: Notification[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Open notifications"
        >
          <IconBell className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-80 my-6">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map(({ id, fallback, text, time }) => (
          <DropdownMenuItem key={id} className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {fallback}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{text}</span>
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-muted-foreground hover:text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}