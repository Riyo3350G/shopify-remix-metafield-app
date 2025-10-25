import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const { productIds, productTitles, customValue } = await request.json();

  {
    /* Prepare metafields for GraphQL */
  }
  const metafields = productIds.map((id: string) => ({
    ownerId: id,
    namespace: "custom",
    key: "custom_field",
    value: customValue,
    type: "single_line_text_field",
  }));

  {
    /* Create metafields via GraphQL */
  }
  const response = await admin.graphql(
    `mutation CreateMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    { variables: { metafields } },
  );

  const data = await response.json();

  if (data.data?.metafieldsSet?.userErrors?.length > 0) {
    return json(
      {
        success: false,
        error: data.data.metafieldsSet.userErrors[0].message,
      },
      { status: 400 },
    );
  }

  {
    /* Save to database */
  }
  for (let i = 0; i < productIds.length; i++) {
    await prisma.productMetafield.upsert({
      where: {
        shop_productId: {
          shop: session.shop,
          productId: productIds[i],
        },
      },
      update: {
        customValue,
        productTitle: productTitles[i],
        updatedAt: new Date(),
      },
      create: {
        shop: session.shop,
        productId: productIds[i],
        productTitle: productTitles[i],
        customValue,
      },
    });
  }

  return json({
    success: true,
    message: `Saved to ${productIds.length} product(s)!`,
  });
};
