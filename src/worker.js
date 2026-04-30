const MINI_SCRIPT_URL =
  "https://raw.githubusercontent.com/jsstewart10/blujay-bootstrap/main/scripts/mini";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/mini") {
      return new Response("Not found\n", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    const upstream = await fetch(MINI_SCRIPT_URL, {
      headers: {
        "user-agent": "blujay-bootstrap-worker",
      },
    });

    if (!upstream.ok) {
      return new Response("Bootstrap source unavailable\n", {
        status: 502,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    const body = await upstream.text();

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/x-shellscript; charset=utf-8",
        "cache-control": "public, max-age=60",
      },
    });
  },
};
