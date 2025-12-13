import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

type EmailAddress = {
  id: string;
  email_address: string;
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (_err) {
    console.error("Webhook signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  switch (eventType) {
    case "user.created":
      await handleUserCreated(evt.data);
      break;
    case "user.updated":
      await handleUserUpdated(evt.data);
      break;
    case "user.deleted":
      await handleUserDeleted(evt.data);
      break;
    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }

  return new Response("Webhook received", { status: 200 });
}

async function handleUserCreated(data: UserJSON) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  const primaryEmail = (email_addresses as EmailAddress[] | undefined)?.find(
    (email) => email.id === data.primary_email_address_id,
  )?.email_address;

  // TODO: Phase 4 で Supabase に INSERT
  // await db.users.create({
  //   clerk_id: id,
  //   email: primaryEmail,
  //   name: [first_name, last_name].filter(Boolean).join(" ") || null,
  //   avatar_url: image_url || null,
  // });

  console.log(
    `User created: id=${id}, email=${primaryEmail}, name=${first_name} ${last_name}, avatar=${image_url}`,
  );
}

async function handleUserUpdated(data: UserJSON) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  const primaryEmail = (email_addresses as EmailAddress[] | undefined)?.find(
    (email) => email.id === data.primary_email_address_id,
  )?.email_address;

  // TODO: Phase 4 で Supabase を UPDATE
  // await db.users.update({
  //   where: { clerk_id: id },
  //   data: {
  //     email: primaryEmail,
  //     name: [first_name, last_name].filter(Boolean).join(" ") || null,
  //     avatar_url: image_url || null,
  //   },
  // });

  console.log(
    `User updated: id=${id}, email=${primaryEmail}, name=${first_name} ${last_name}, avatar=${image_url}`,
  );
}

async function handleUserDeleted(data: { id?: string }) {
  const { id } = data;

  // TODO: Phase 4 で Supabase から DELETE（または soft delete）
  // await db.users.delete({
  //   where: { clerk_id: id },
  // });

  console.log(`User deleted: id=${id}`);
}
