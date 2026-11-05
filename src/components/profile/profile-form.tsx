"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";

type ProfileFormProps = {
  initialName: string;
  email: string;
};

function getErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "Unable to update your profile.";
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const { update } = useSession();
  const { addToast } = useToast();
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        addToast(getErrorMessage(payload), "error");
        return;
      }

      await update();
      router.refresh();
      addToast("Your profile has been updated.", "success");
    } catch (error) {
      console.error("Could not update the profile.", error);
      addToast("Unable to update your profile right now.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8"
      onSubmit={handleSubmit}
    >
      <div>
        <label
          htmlFor="profile-name"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Display name
        </label>
        <Input
          id="profile-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          autoComplete="name"
          maxLength={80}
          required
        />
      </div>
      <div>
        <label
          htmlFor="profile-email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          id="profile-email"
          name="email"
          type="email"
          value={email}
          readOnly
          aria-describedby="profile-email-help"
        />
        <p id="profile-email-help" className="mt-2 text-xs text-muted">
          Email address changes are not available here.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || !name.trim()}>
          {isSaving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
