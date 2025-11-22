# X Country Filter

A lightweight Chromium extension that hides tweets on X/Twitter from accounts registered in countries you blacklist. The content script calls X's `AboutAccountQuery` endpoint with your existing session, caches the author country code, and removes matching tweets and replies from the timeline.

## Features
- Select ISO 3166-1 alpha-2 country codes to block via the extension options page.
- Watches the home timeline with a `MutationObserver` so dynamically loaded tweets are filtered automatically.
- Caches account lookups for 10 minutes to avoid hammering the GraphQL endpoint.
- Adds minimal UI feedback and validation on the options page.

## Install & Run
1. Grab the source by cloning this repo locally, downloading it as a ZIP, or pulling a ZIP from the releases tab; then unzip so you have the `x-extension` folder on disk.
2. In Chrome/Brave/Edge open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the `twitter-ext` folder you extracted.
4. Either click the extension toolbar icon and hit **Open options** or open **Details → Extension options**, then enter a comma separated list such as `US, IN, RU`.
5. Visit `https://x.com/home` while signed in; tweets authored by accounts whose country codes match your blacklist will disappear.

## How It Works
- The content script (`src/content.js`) reads your blacklist from `chrome.storage.sync`, observes the feed, and extracts each tweet author's handle from the DOM.
- For unseen handles it calls `https://x.com/i/api/graphql/.../AboutAccountQuery?variables={"screenName":"handle"}` with the standard public bearer token, your `ct0` CSRF token, and `credentials: include` so only your own cookies are used.
- The response is scanned for fields named `country_code`/`countryCode`; when a two-letter code is found it is cached and compared with your blacklist.
- Matching tweets are hidden by toggling their `display` style.

## Caveats
- You must be signed in to X/Twitter in the same browser profile; otherwise the GraphQL endpoint will return 401 and no tweets will be hidden.
- The endpoint and DOM structure are undocumented and may change without notice. If filtering stops working, inspect the console for warnings and be prepared to update the selectors or query ID.
- The extension only runs locally and never stores data outside Chrome storage, but it still sends authenticated requests on your behalf. Review the code and ensure you are comfortable with the risk before loading it.
