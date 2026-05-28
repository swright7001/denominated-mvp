import {
  BTC_PRICE_REVALIDATE_SECONDS,
  getBTCPrice,
} from "@/lib/btc-price";

export const dynamic = "force-dynamic";

export async function GET() {
  const price = await getBTCPrice();

  return Response.json(price, {
    headers: {
      "Cache-Control": `s-maxage=${BTC_PRICE_REVALIDATE_SECONDS}, stale-while-revalidate=240`,
    },
  });
}
