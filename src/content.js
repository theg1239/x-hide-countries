const STORAGE_KEY = "blockedCountries";
const GRAPHQL_ENDPOINT = "https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery?variables=";
const BEARER_TOKEN = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
const LOOKUP_CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days
const NULL_RESULT_TTL = 1000 * 60 * 60 * 24; // 24 hours for negative entries
const processedMarker = "data-country-filter-processed";
const LOG_PREFIX = "[X Country Filter]";
const CACHE_STORAGE_KEY = "countryCodeCache";
const PREFS_KEY = "countryFilterPreferences";
const CACHE_PERSIST_DEBOUNCE_MS = 2000;
const MAX_CACHE_ENTRIES = 500;
const REQUEST_INTERVAL_MS = 450;
const BASE_BACKOFF_MS = 1000;
const BACKOFF_MULTIPLIER = 1.5;
const RATE_LIMIT_STATUSES = new Set([420, 429]);
const DEFAULT_PREFERENCES = {
	hideStyle: "card",
	placeholderText: "Hidden tweet from {{COUNTRY}}",
	accentColor: "#1d9bf0"
};
const PLACEHOLDER_CLASS = "xcountry-filter-placeholder";
const PLACEHOLDER_BUTTON_CLASS = "xcountry-filter-show-button";
const STYLE_ELEMENT_ID = "xcountry-filter-style";
const ISO_COUNTRY_CODES = [
	"AF",
	"AX",
	"AL",
	"DZ",
	"AS",
	"AD",
	"AO",
	"AI",
	"AQ",
	"AG",
	"AR",
	"AM",
	"AW",
	"AU",
	"AT",
	"AZ",
	"BS",
	"BH",
	"BD",
	"BB",
	"BY",
	"BE",
	"BZ",
	"BJ",
	"BM",
	"BT",
	"BO",
	"BQ",
	"BA",
	"BW",
	"BV",
	"BR",
	"IO",
	"BN",
	"BG",
	"BF",
	"BI",
	"CV",
	"KH",
	"CM",
	"CA",
	"KY",
	"CF",
	"TD",
	"CL",
	"CN",
	"CX",
	"CC",
	"CO",
	"KM",
	"CG",
	"CD",
	"CK",
	"CR",
	"CI",
	"HR",
	"CU",
	"CW",
	"CY",
	"CZ",
	"DK",
	"DJ",
	"DM",
	"DO",
	"EC",
	"EG",
	"SV",
	"GQ",
	"ER",
	"EE",
	"SZ",
	"ET",
	"FK",
	"FO",
	"FJ",
	"FI",
	"FR",
	"GF",
	"PF",
	"TF",
	"GA",
	"GM",
	"GE",
	"DE",
	"GH",
	"GI",
	"GR",
	"GL",
	"GD",
	"GP",
	"GU",
	"GT",
	"GG",
	"GN",
	"GW",
	"GY",
	"HT",
	"HM",
	"VA",
	"HN",
	"HK",
	"HU",
	"IS",
	"IN",
	"ID",
	"IR",
	"IQ",
	"IE",
	"IM",
	"IL",
	"IT",
	"JM",
	"JP",
	"JE",
	"JO",
	"KZ",
	"KE",
	"KI",
	"KP",
	"KR",
	"KW",
	"KG",
	"LA",
	"LV",
	"LB",
	"LS",
	"LR",
	"LY",
	"LI",
	"LT",
	"LU",
	"MO",
	"MG",
	"MW",
	"MY",
	"MV",
	"ML",
	"MT",
	"MH",
	"MQ",
	"MR",
	"MU",
	"YT",
	"MX",
	"FM",
	"MD",
	"MC",
	"MN",
	"ME",
	"MS",
	"MA",
	"MZ",
	"MM",
	"NA",
	"NR",
	"NP",
	"NL",
	"NC",
	"NZ",
	"NI",
	"NE",
	"NG",
	"NU",
	"NF",
	"MK",
	"MP",
	"NO",
	"OM",
	"PK",
	"PW",
	"PS",
	"PA",
	"PG",
	"PY",
	"PE",
	"PH",
	"PN",
	"PL",
	"PT",
	"PR",
	"QA",
	"RE",
	"RO",
	"RU",
	"RW",
	"BL",
	"SH",
	"KN",
	"LC",
	"MF",
	"PM",
	"VC",
	"WS",
	"SM",
	"ST",
	"SA",
	"SN",
	"RS",
	"SC",
	"SL",
	"SG",
	"SX",
	"SK",
	"SI",
	"SB",
	"SO",
	"ZA",
	"GS",
	"SS",
	"ES",
	"LK",
	"SD",
	"SR",
	"SJ",
	"SE",
	"CH",
	"SY",
	"TW",
	"TJ",
	"TZ",
	"TH",
	"TL",
	"TG",
	"TK",
	"TO",
	"TT",
	"TN",
	"TR",
	"TM",
	"TC",
	"TV",
	"UG",
	"UA",
	"AE",
	"GB",
	"US",
	"UM",
	"UY",
	"UZ",
	"VU",
	"VE",
	"VN",
	"VG",
	"VI",
	"WF",
	"EH",
	"YE",
	"ZM",
	"ZW"
];

const MANUAL_COUNTRY_ALIASES = [
	["USA", "US"],
	["United States", "US"],
	["United States of America", "US"],
	["America", "US"],
	["Great Britain", "GB"],
	["Britain", "GB"],
	["England", "GB"],
	["Scotland", "GB"],
	["Wales", "GB"],
	["Northern Ireland", "GB"],
	["United Kingdom of Great Britain and Northern Ireland", "GB"],
	["UAE", "AE"],
	["Emirates", "AE"],
	["Russian Federation", "RU"],
	["Mainland China", "CN"],
	["People's Republic of China", "CN"],
	["PRC", "CN"],
	["Republic of Korea", "KR"],
	["South Korea", "KR"],
	["ROK", "KR"],
	["Democratic People's Republic of Korea", "KP"],
	["North Korea", "KP"],
	["DPRK", "KP"],
	["Republic of China", "TW"],
	["Taiwan", "TW"],
	["Czech Republic", "CZ"],
	["Ivory Coast", "CI"],
	["Cote d'Ivoire", "CI"],
	["Cote dIvoire", "CI"],
	["Burma", "MM"],
	["Republic of the Congo", "CG"],
	["Congo Brazzaville", "CG"],
	["Democratic Republic of the Congo", "CD"],
	["Congo Kinshasa", "CD"],
	["Laos", "LA"],
	["Republic of South Africa", "ZA"],
	["South Africa", "ZA"],
	["Bolivia", "BO"],
	["Bolivia (Plurinational State of)", "BO"],
	["Venezuela", "VE"],
	["Venezuela (Bolivarian Republic of)", "VE"],
	["Syria", "SY"],
	["Syrian Arab Republic", "SY"],
	["Islamic Republic of Iran", "IR"],
	["Iran", "IR"],
	["Republic of India", "IN"],
	["Hong Kong", "HK"],
	["Hong Kong SAR", "HK"],
	["Macau", "MO"],
	["Macau SAR", "MO"],
	["Palestine", "PS"],
	["State of Palestine", "PS"],
	["Vietnam", "VN"],
	["Republic of Viet Nam", "VN"],
	["Turkiye", "TR"],
	["Turkey", "TR"],
	["Cabo Verde", "CV"],
	["Cape Verde", "CV"],
	["Eswatini", "SZ"],
	["Swaziland", "SZ"],
	["East Timor", "TL"],
	["Timor-Leste", "TL"],
	["Moldova", "MD"],
	["Republic of Moldova", "MD"],
	["Micronesia", "FM"],
	["Federated States of Micronesia", "FM"],
	["United Republic of Tanzania", "TZ"],
	["Tanzania", "TZ"],
	["Vatican", "VA"],
	["Holy See", "VA"],
	["CAR", "CF"],
	["Central African Republic", "CF"],
	["DRC", "CD"],
	["Republic of Belarus", "BY"],
	["Belarus", "BY"],
	["Kyrgyz Republic", "KG"],
	["Sahrawi Arab Democratic Republic", "EH"],
	["Western Sahara", "EH"],
	["United Mexican States", "MX"],
	["Bahamas", "BS"],
	["The Bahamas", "BS"],
	["Gambia", "GM"],
	["The Gambia", "GM"],
	["Republic of the Philippines", "PH"],
	["Philippines", "PH"],
	["Republic of Indonesia", "ID"],
	["Indonesia", "ID"],
	["Republic of Singapore", "SG"],
	["Singapore", "SG"]
];

const lookupCache = new Map();
const pendingLookups = new Map();
const lookupQueue = [];
const placeholderMap = new WeakMap();
let blockedCountries = new Set();
let mutationObserver;
let queueProcessing = false;
let backoffUntil = 0;
let cachePersistHandle = null;
let preferences = { ...DEFAULT_PREFERENCES };
let backoffAttempts = 0;
const COUNTRY_NAME_LOOKUP = buildCountryNameLookup();
const REGION_DISPLAY = typeof Intl !== "undefined" && Intl.DisplayNames ? new Intl.DisplayNames([navigator.language || "en"], { type: "region" }) : null;

init();

function log(...args) {
	console.log(LOG_PREFIX, ...args);
}

function warn(...args) {
	console.warn(LOG_PREFIX, ...args);
}

function updatePreferences(next) {
	const merged = {
		...DEFAULT_PREFERENCES,
		...(next || {})
	};
	if (!/^(card|compact)$/i.test(merged.hideStyle)) {
		merged.hideStyle = DEFAULT_PREFERENCES.hideStyle;
	} else {
		merged.hideStyle = merged.hideStyle.toLowerCase();
	}
	merged.placeholderText = (merged.placeholderText || DEFAULT_PREFERENCES.placeholderText).toString().slice(0, 120);
	if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(merged.accentColor || "")) {
		merged.accentColor = DEFAULT_PREFERENCES.accentColor;
	}
	preferences = merged;
	log("Preferences updated", merged);
}

function init() {
	const defaults = {
		[STORAGE_KEY]: [],
		[PREFS_KEY]: DEFAULT_PREFERENCES
	};
	chrome.storage.sync.get(defaults, (data) => {
		blockedCountries = new Set(normalizeCountryList(data[STORAGE_KEY]));
		log("Loaded blocked countries", Array.from(blockedCountries));
		updatePreferences(data[PREFS_KEY]);
		ensureStylesInjected();
		hydrateCacheFromStorage().then(() => {
			watchTimeline();
		});
	});

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== "sync") {
			return;
		}
		if (changes[STORAGE_KEY]) {
			blockedCountries = new Set(normalizeCountryList(changes[STORAGE_KEY].newValue || []));
			log("Storage updated", Array.from(blockedCountries));
			reapplyFilters();
		}
		if (changes[PREFS_KEY]) {
			updatePreferences(changes[PREFS_KEY].newValue || DEFAULT_PREFERENCES);
			ensureStylesInjected(true);
			reapplyFilters();
		}
	});
}

function watchTimeline() {
	log("watchTimeline invoked");
	scanTweets(document);

	if (mutationObserver) {
		log("Mutation observer already active");
		return;
	}

	mutationObserver = new MutationObserver((mutations) => {
		log("Mutation batch", mutations.length);
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (!(node instanceof HTMLElement)) {
					continue;
				}
				scanTweets(node);
			}
		}
	});

	const target = document.body;
	if (!target) {
		warn("document.body missing, deferring observer setup");
		document.addEventListener("DOMContentLoaded", watchTimeline, { once: true });
		return;
	}

	log("Starting observer on body");
	mutationObserver.observe(target, {
		childList: true,
		subtree: true
	});
}

function scanTweets(root) {
	const tweets = root.querySelectorAll?.("article[data-testid='tweet']");
	if (!tweets || !tweets.length) {
		log("scanTweets found no tweet nodes for", root === document ? "document" : root);
		return;
	}
	log("scanTweets inspecting", tweets.length, "tweet(s)");
	tweets?.forEach((article) => {
		if (article.hasAttribute(processedMarker)) {
			log("tweet already processed", article.dataset.testid);
			return;
		}
		article.setAttribute(processedMarker, "1");
		processTweet(article);
	});
}

function processTweet(article) {
	const screenName = extractScreenName(article);
	log("processTweet", screenName || "<unknown>");
	if (!screenName) {
		article.dataset.countryFilterState = "unknown-user";
		article.removeAttribute(processedMarker);
		return;
	}

	lookupCountry(screenName)
		.then((countryCode) => {
			log("lookup resolved", screenName, countryCode);
			if (countryCode) {
				article.dataset.countryCode = countryCode;
			}
			applyFilter(article);
		})
		.catch((error) => {
			warn("Country filter lookup failed", screenName, error);
			article.removeAttribute(processedMarker);
		});
}

function extractScreenName(article) {
	const invalidSegments = new Set([
		"i",
		"home",
		"explore",
		"settings",
		"messages",
		"notifications",
		"search",
		"hashtag"
	]);

	const anchors = article.querySelectorAll('a[href^="/"][role="link"]');
	for (const anchor of anchors) {
		const href = anchor.getAttribute("href");
		if (!href || href.includes("://")) {
			continue;
		}
		const parts = href.split("?")[0].split("#")[0].split("/").filter(Boolean);
		const handle = parts[0];
		if (!handle || invalidSegments.has(handle) || handle.includes(".")) {
			continue;
		}
		return handle.replace(/^@/, "");
	}
	return null;
}

function applyFilter(article) {
	if (article.dataset.countryFilterManual === "1") {
		log("applyFilter manual override active");
		revealTweet(article);
		return;
	}

	const countryCode = article.dataset.countryCode;
	if (!countryCode) {
		log("applyFilter no country code", article.dataset.countryFilterState);
		revealTweet(article);
		return;
	}

	if (blockedCountries.has(countryCode)) {
		log("applyFilter hiding", countryCode);
		hideTweet(article, countryCode);
	} else {
		log("applyFilter showing", countryCode);
		revealTweet(article);
	}
}

function hideTweet(article, countryCode) {
	removePlaceholder(article);
	article.style.display = "none";
	article.dataset.countryFilterState = `hidden-${countryCode || "unknown"}`;
	insertPlaceholder(article, countryCode);
	log("hideTweet", countryCode);
}

function revealTweet(article) {
	removePlaceholder(article);
	article.style.display = "";
	article.dataset.countryFilterState = "visible";
	log("revealTweet");
}

function insertPlaceholder(article, countryCode) {
	if (!article?.parentElement) {
		return;
	}
	ensureStylesInjected();
	const placeholder = document.createElement("div");
	placeholder.className = PLACEHOLDER_CLASS;
	placeholder.dataset.style = preferences.hideStyle || DEFAULT_PREFERENCES.hideStyle;
	placeholder.style.setProperty("--x-filter-accent", getAccentColor());
	const messageEl = document.createElement("span");
	messageEl.textContent = formatPlaceholderMessage(countryCode);
	const button = document.createElement("button");
	button.type = "button";
	button.className = PLACEHOLDER_BUTTON_CLASS;
	button.textContent = "Show tweet";
	button.addEventListener("click", () => {
		article.dataset.countryFilterManual = "1";
		revealTweet(article);
	});
	placeholder.append(messageEl, button);
	placeholderMap.set(article, placeholder);
	article.insertAdjacentElement("beforebegin", placeholder);
}

function removePlaceholder(article) {
	const placeholder = placeholderMap.get(article);
	if (placeholder) {
		placeholder.remove();
		placeholderMap.delete(article);
	}
}

function normalizeCountryList(list) {
	if (!Array.isArray(list)) {
		return [];
	}
	return list
		.map((code) => (typeof code === "string" ? code.trim().toUpperCase() : ""))
		.filter((code) => /^[A-Z]{2}$/i.test(code));
}

function reapplyFilters() {
	log("Reapplying filters to existing tweets");
	document.querySelectorAll('article[data-testid="tweet"]').forEach((article) => {
		removePlaceholder(article);
		article.style.display = "";
		const currentCode = article.dataset.countryCode;
		if (currentCode) {
			log("Reapply existing code", currentCode);
			applyFilter(article);
			return;
		}
		log("Reapply queueing tweet without code");
		article.removeAttribute(processedMarker);
		processTweet(article);
	});
}

function lookupCountry(screenName) {
	const normalized = screenName.toLowerCase();
	const now = Date.now();
	const cached = lookupCache.get(normalized);
	if (cached) {
		if (cached.expires > now) {
			log("Cache hit", screenName, cached.code);
			return Promise.resolve(cached.code);
		}
		lookupCache.delete(normalized);
	}

	if (pendingLookups.has(normalized)) {
		log("Pending lookup reused", screenName);
		return pendingLookups.get(normalized);
	}

	const deferred = createDeferred();
	lookupQueue.push({ screenName, normalized, deferred });
	pendingLookups.set(normalized, deferred.promise);
	log("Enqueued lookup", screenName, "queue size", lookupQueue.length);
	processLookupQueue();
	return deferred.promise;
}

function processLookupQueue() {
	if (queueProcessing) {
		return;
	}
	queueProcessing = true;
	scheduleNextDispatch(0);
}

function scheduleNextDispatch(delay) {
	setTimeout(() => {
		if (lookupQueue.length === 0) {
			queueProcessing = false;
			log("Lookup queue drained");
			return;
		}
		const now = Date.now();
		if (now < backoffUntil) {
			const wait = Math.max(backoffUntil - now, REQUEST_INTERVAL_MS);
			log("Backoff active; delaying dispatch by", wait, "ms");
			scheduleNextDispatch(wait);
			return;
		}
		const job = lookupQueue.shift();
		executeLookupJob(job)
			.then((requeued) => {
				if (requeued) {
					lookupQueue.unshift(job);
				}
			})
			.catch((error) => {
				warn("Lookup execution error", error);
				job.deferred.resolve(null);
				pendingLookups.delete(job.normalized);
			})
			.finally(() => {
				scheduleNextDispatch(REQUEST_INTERVAL_MS);
			});
	}, delay);
}

function executeLookupJob(job) {
	const { screenName, normalized, deferred } = job;
	return requestCountryPayload(screenName)
		.then((payload) => {
			const code = extractCountryCode(payload);
			log("Fetched country", screenName, code);
			cacheResult(normalized, code);
			resetBackoff();
			deferred.resolve(code);
			pendingLookups.delete(normalized);
			return false;
		})
		.catch((error) => {
			if (error && error.retry) {
				warn("Rate limited for", screenName, "re-queuing after backoff");
				startJitterBackoff(error.reason || "rate limited");
				return true;
			}
			warn("Unable to fetch country for", screenName, error);
			cacheResult(normalized, null, NULL_RESULT_TTL);
			deferred.resolve(null);
			pendingLookups.delete(normalized);
			startJitterBackoff(error?.message || "lookup error");
			return false;
		});
}

function requestCountryPayload(screenName) {
	const variables = encodeURIComponent(JSON.stringify({ screenName }));
	const headers = buildHeaders();
	log("Fetching country", screenName, GRAPHQL_ENDPOINT);
	return fetch(`${GRAPHQL_ENDPOINT}${variables}`, {
		method: "GET",
		headers,
		credentials: "include"
	}).then((response) => {
		if (RATE_LIMIT_STATUSES.has(response.status)) {
			warn("GraphQL rate limit", screenName, response.status);
			const error = new Error("Rate limited");
			error.retry = true;
			error.reason = `status ${response.status}`;
			throw error;
		}
		if (!response.ok) {
			warn("GraphQL failed", screenName, response.status);
			throw new Error(`GraphQL request failed with ${response.status}`);
		}
		return response.json();
	});
}

function buildHeaders() {
	const headers = {
		accept: "application/json",
		"content-type": "application/json",
		authorization: BEARER_TOKEN,
		"x-twitter-active-user": "yes",
		"x-twitter-auth-type": "OAuth2Session",
		"x-twitter-client-language": navigator.language || "en"
	};

	const csrf = getCookieValue("ct0");
	if (csrf) {
		log("Found ct0 cookie");
		headers["x-csrf-token"] = csrf;
	}

	log("Request headers prepared");
	return headers;
}

function getCookieValue(name) {
	const pattern = new RegExp(`${name}=([^;]+)`);
	const match = document.cookie.match(pattern);
	return match ? match[1] : "";
}

function extractCountryCode(payload) {
	if (!payload) {
		warn("Empty payload when extracting country");
		return null;
	}

	log("extractCountryCode scanning payload");
	const visitQueue = [payload];
	while (visitQueue.length) {
		const current = visitQueue.shift();
		if (!current || typeof current !== "object") {
			continue;
		}
		for (const [key, value] of Object.entries(current)) {
			if (key === "about_profile" && value && typeof value === "object") {
				const matched = extractFromAboutProfile(value);
				if (matched) {
					return matched;
				}
			}
			if (typeof value === "string" && isCountryCodeKey(key) && isIsoCode(value)) {
				log("Matched country code", key, value);
				return value.toUpperCase();
			}
			if (value && typeof value === "object") {
				visitQueue.push(value);
			}
		}
	}
	warn("No country code found in payload");
	return null;
}

function extractFromAboutProfile(profile) {
	const directCode = profile.account_based_in_country_code || profile.country_code;
	const fromDirect = parseCountryValue(directCode);
	if (fromDirect) {
		log("about_profile provided direct code", fromDirect);
		return fromDirect;
	}
	const fromName = parseCountryValue(profile.account_based_in || profile.source);
	if (fromName) {
		log("about_profile inferred from name", profile.account_based_in, "->", fromName);
		return fromName;
	}
	return null;
}

function isCountryCodeKey(key) {
	return ["country_code", "countryCode", "country"].includes(key);
}

function isIsoCode(value) {
	return /^[A-Za-z]{2}$/.test(value);
}

function parseCountryValue(value) {
	if (!value) {
		return null;
	}
	if (isIsoCode(value)) {
		return value.toUpperCase();
	}
	const normalized = normalizeCountryName(value);
	const matched = COUNTRY_NAME_LOOKUP.get(normalized);
	if (matched) {
		return matched;
	}
	return null;
}

function cacheResult(normalized, code, ttlOverride) {
	const ttl = ttlOverride || (code ? LOOKUP_CACHE_TTL : NULL_RESULT_TTL);
	lookupCache.set(normalized, {
		code: code ?? null,
		expires: Date.now() + ttl
	});
	scheduleCachePersist();
}

function hydrateCacheFromStorage() {
	return new Promise((resolve) => {
		chrome.storage.local.get({ [CACHE_STORAGE_KEY]: {} }, (data) => {
			const stored = data[CACHE_STORAGE_KEY] || {};
			const now = Date.now();
			let restored = 0;
			Object.entries(stored).forEach(([key, entry]) => {
				if (!entry || typeof entry.expires !== "number") {
					return;
				}
				if (entry.expires > now) {
					lookupCache.set(key, {
						code: entry.code ?? null,
						expires: entry.expires
					});
					restored += 1;
				}
			});
			log("Hydrated lookup cache", restored);
			resolve();
		});
	});
}

function scheduleCachePersist() {
	if (cachePersistHandle) {
		clearTimeout(cachePersistHandle);
	}
	cachePersistHandle = setTimeout(() => {
		cachePersistHandle = null;
		persistCacheToStorage();
	}, CACHE_PERSIST_DEBOUNCE_MS);
}

function persistCacheToStorage() {
	const payload = serializeCacheEntries();
	chrome.storage.local.set({ [CACHE_STORAGE_KEY]: payload }, () => {
		log("Persisted cache entries", Object.keys(payload).length);
	});
}

function serializeCacheEntries() {
	const now = Date.now();
	const entries = Array.from(lookupCache.entries()).filter(([, entry]) => entry && entry.expires > now);
	if (entries.length > MAX_CACHE_ENTRIES) {
		entries.sort((a, b) => a[1].expires - b[1].expires);
		entries.splice(0, entries.length - MAX_CACHE_ENTRIES);
	}
	const serialized = {};
	entries.forEach(([key, entry]) => {
		serialized[key] = { code: entry.code ?? null, expires: entry.expires };
	});
	return serialized;
}

function startJitterBackoff(reason) {
	backoffAttempts += 1;
	const exponent = Math.max(0, backoffAttempts - 1);
	const cap = BASE_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, exponent);
	const wait = Math.random() * cap;
	const target = Date.now() + wait;
	if (target > backoffUntil) {
		backoffUntil = target;
	}
	log("Backoff set for", Math.round(wait), "ms", reason ? `(${reason})` : "");
}

function resetBackoff() {
	if (backoffAttempts === 0 && backoffUntil === 0) {
		return;
	}
	backoffAttempts = 0;
	backoffUntil = 0;
	log("Backoff reset");
}

function createDeferred() {
	let resolve;
	let reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

function formatPlaceholderMessage(countryCode) {
	const template = (preferences.placeholderText || DEFAULT_PREFERENCES.placeholderText).trim() || DEFAULT_PREFERENCES.placeholderText;
	const code = (countryCode || "").toUpperCase() || "??";
	const label = formatCountryLabel(countryCode);
	return template
		.replace(/\{\{\s*(country|name)\s*\}\}/gi, label)
		.replace(/\{\{\s*code\s*\}\}/gi, code);
}

function formatCountryLabel(countryCode) {
	if (!countryCode) {
		return "blocked country";
	}
	const formatted = REGION_DISPLAY?.of(countryCode.toUpperCase());
	return formatted || countryCode;
}

function getAccentColor() {
	const color = preferences.accentColor || DEFAULT_PREFERENCES.accentColor;
	return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : DEFAULT_PREFERENCES.accentColor;
}

function ensureStylesInjected(force = false) {
	let styleEl = document.getElementById(STYLE_ELEMENT_ID);
	const css = [
		`.${PLACEHOLDER_CLASS}{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:rgba(15,20,25,0.9);border:1px solid var(--x-filter-accent,#1d9bf0);border-radius:12px;margin:8px 0;padding:0.75rem 1rem;display:flex;gap:0.75rem;align-items:center;justify-content:space-between;color:#f7f9f9;}`,
		`.${PLACEHOLDER_CLASS} span{flex:1;min-width:0;}`,
		`.${PLACEHOLDER_CLASS}[data-style="compact"]{border-radius:999px;padding:0.4rem 0.85rem;font-size:0.85rem;}`,
		`.${PLACEHOLDER_BUTTON_CLASS}{background:var(--x-filter-accent,#1d9bf0);border:none;border-radius:999px;color:#fff;padding:0.35rem 0.9rem;font-weight:600;cursor:pointer;}`,
		`.${PLACEHOLDER_BUTTON_CLASS}:hover{opacity:0.9;}`,
		`.${PLACEHOLDER_BUTTON_CLASS}:focus-visible{outline:2px solid #fff;}`
	].join("");
	if (styleEl && !force) {
		return;
	}
	if (!styleEl) {
		styleEl = document.createElement("style");
		styleEl.id = STYLE_ELEMENT_ID;
		(document.head || document.documentElement)?.appendChild(styleEl);
	}
	styleEl.textContent = css;
}

function normalizeCountryName(value) {
	return value
		.toString()
		.toLowerCase()
		.replace(/[^a-z]/g, "");
}

function buildCountryNameLookup() {
	const lookup = new Map();
	if (typeof Intl !== "undefined" && Intl.DisplayNames) {
		try {
			const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
			ISO_COUNTRY_CODES.forEach((code) => {
				const name = regionNames.of(code);
				if (name) {
					lookup.set(normalizeCountryName(name), code);
				}
			});
		} catch (error) {
			warn("Intl.DisplayNames unavailable", error);
		}
	}
	MANUAL_COUNTRY_ALIASES.forEach(([alias, code]) => {
		lookup.set(normalizeCountryName(alias), code);
	});
	return lookup;
}
