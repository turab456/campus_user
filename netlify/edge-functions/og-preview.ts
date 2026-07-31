import { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const crawlers = [
    "whatsapp",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "telegrambot",
    "slackbot",
    "discordbot",
    "google-structured-data-testing-tool",
    "bingbot"
  ];

  const isCrawler = crawlers.some(c => userAgent.toLowerCase().includes(c));
  if (!isCrawler) {
    return context.next();
  }

  // Parse path to find book ID
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const bookIndex = pathParts.indexOf("book");

  if (bookIndex === -1 || bookIndex === pathParts.length - 1) {
    return context.next();
  }

  const bookId = pathParts[bookIndex + 1];
  if (!bookId || bookId.length !== 24) { // standard MongoDB ObjectId length
    return context.next();
  }

  try {
    const backendUrl = "https://api.revoshelf.com";
    const res = await fetch(`${backendUrl}/api/listings/${bookId}`);
    if (!res.ok) {
      return context.next();
    }

    const data = await res.json();
    if (!data.success || !data.listing) {
      return context.next();
    }

    const listing = data.listing;
    const title = `${listing.title} | RevoShelf`;
    const description = `₹${listing.price} · ${listing.description || ''}`.substring(0, 150);
    const image = listing.images && listing.images[0]
      ? listing.images[0]
      : "https://www.revoshelf.com/logo.png";

    // Get original index.html
    const response = await context.next();
    const html = await response.text();

    // Replace default OG tags
    let newHtml = html
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
      .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
      .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${description}"`)
      .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${image}"`)
      .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url.href}"`)
      .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
      .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${description}"`)
      .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${image}"`);

    return new Response(newHtml, {
      headers: response.headers,
    });
  } catch (err) {
    console.error("OG Edge Function Error:", err);
    return context.next();
  }
};
