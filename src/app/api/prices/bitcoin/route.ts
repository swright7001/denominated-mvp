import {
  BTC_PRICE_BROWSER_CACHE_CONTROL,
  BTC_PRICE_CDN_CACHE_CONTROL,
  BTC_PRICE_VERCEL_CDN_CACHE_CONTROL,
  buildBTCPriceLogEvent,
  getBTCPrice,
} from "@/lib/btc-price";
import { normalizeCurrencyCode } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const currencyCode = normalizeCurrencyCode(
    new URL(request.url).searchParams.get("currency"),
  );
  const price = await getBTCPrice({ currencyCode });
  const logEvent = buildBTCPriceLogEvent(price);

  if (price.status === "fallback" || price.stale) {
    console.warn(JSON.stringify(logEvent));
  } else {
    console.info(JSON.stringify(logEvent));
  }

  return Response.json(price, {
    headers: {
      "Cache-Control": BTC_PRICE_BROWSER_CACHE_CONTROL,
      "CDN-Cache-Control": BTC_PRICE_CDN_CACHE_CONTROL,
      "Vercel-CDN-Cache-Control": BTC_PRICE_VERCEL_CDN_CACHE_CONTROL,
      "X-Denominated-BTC-Price-Status": price.status,
      "X-Denominated-Currency": price.currencyCode,
    },
  });
}
