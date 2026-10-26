"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = React.useState(false);

  if (isPending) {
    // Small placeholder so the header doesn't jump when the session loads.
    return <span aria-busy className="text-[15px] text-neutral-400">···</span>;
  }

  const user = session?.user;

  if (!user) {
    return (
      <>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign Up</Link>
      </>
    );
  }

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.refresh();
      router.push("/login");
    } catch {
      toast.add({
        title: "Couldn't sign out",
        description: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        className="flex items-center gap-1.5 rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-[#1ba8bc]"
        aria-label="Open account menu"
      >
        <Avatar size="sm">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback>
            {initials(user.name) || <UserRound size={12} aria-hidden />}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-32 truncate">{user.name}</span>
      </PopoverTrigger>

      <PopoverContent align="end" className="gap-4 p-4">
        <PopoverHeader className="flex-row items-center gap-3">
          <Avatar size="lg">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback>
              {initials(user.name) || <UserRound aria-hidden />}
            </AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col">
            <PopoverTitle className="truncate">{user.name}</PopoverTitle>
            <PopoverDescription className="truncate">
              {user.email}
            </PopoverDescription>
          </span>
        </PopoverHeader>

        <div className="flex flex-col gap-1">
          <Link
            href="/profile"
            className={buttonVariants({ variant: "ghost" })}
          >
            View profile
          </Link>
          <Button
            variant="outline"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            <LogOut data-icon="inline-start" aria-hidden />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
