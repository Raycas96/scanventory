import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

/**
 * App Uninstalled Webhook Handler
 *
 * When a merchant uninstalls the app, we must delete all their data
 * to comply with Shopify's data protection requirements.
 *
 * This webhook:
 * 1. Deletes all shop-related data (cascade deletes handle relations)
 * 2. Deletes sessions
 * 3. Logs the deletion process
 * 4. Handles errors gracefully
 *
 * References:
 * - [Webhook security](https://shopify.dev/docs/apps/security/webhooks)
 * - [App uninstalled webhook](https://shopify.dev/docs/apps/build/webhooks/subscribe)
 * - [Protected Customer Data](https://shopify.dev/docs/apps/launch/protected-customer-data)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Authenticate and validate webhook HMAC signature
    // This ensures the webhook is actually from Shopify
    const { shop, session, topic } = await authenticate.webhook(request);

    console.log(`[UNINSTALL] Received ${topic} webhook for shop: ${shop}`);

    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.
    if (!session) {
      console.log(
        `[UNINSTALL] No session found for ${shop}, data may already be deleted`,
      );
      return new Response(null, { status: 200 });
    }

    // Find the shop record
    const shopRecord = await db.shop.findUnique({
      where: { shop },
      include: {
        settings: true,
        productHistory: true,
        productCache: true,
        locationCache: true,
        jobs: true,
      },
    });

    if (!shopRecord) {
      console.log(
        `[UNINSTALL] No shop record found for ${shop}, deleting session only`,
      );
      // Still delete the session if it exists
      await db.session.deleteMany({ where: { shop } });
      return new Response(null, { status: 200 });
    }

    // Log data counts before deletion (for audit purposes)
    const dataCounts = {
      productHistory: shopRecord.productHistory.length,
      productCache: shopRecord.productCache.length,
      locationCache: shopRecord.locationCache.length,
      jobs: shopRecord.jobs.length,
    };

    console.log(`[UNINSTALL] Deleting data for ${shop}:`, dataCounts);

    // Delete all shop-related data
    // Prisma cascade deletes will handle related records automatically
    // Order matters: delete Shop first, which cascades to all relations
    await db.shop.delete({
      where: { shop },
    });

    // Delete sessions (not automatically cascaded)
    await db.session.deleteMany({
      where: { shop },
    });

    console.log(`[UNINSTALL] Successfully deleted all data for ${shop}`);

    //TODO: once we have the subscription table we need to delete the subscription too

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("[UNINSTALL] Error:", error);

    return boundary.error(error);
  }
};
