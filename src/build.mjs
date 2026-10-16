import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { services, locations, homeFaqs } from "./data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.fortcollinsfencecompany.com";
const NAME = "Fort Collins Fence Company";
const PHONE_DISPLAY = "(970) 235-8596";
const PHONE_TEL = "+19702358596";
const SOURCE = "Fort Collins Fence Company";
const TALLY = `https://tally.so/embed/xX6B0y?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&source=${encodeURIComponent(SOURCE)}`;
const TALLY_PAGE = `https://tally.so/r/xX6B0y?source=${encodeURIComponent(SOURCE)}`;
const CITY_RULES = "https://www.fortcollins.gov/Government/City-Code-and-Charter/Building-Code/Rules-for-Common-Projects";

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

const words = (value) => value.trim().split(/\s+/).filter(Boolean).length;

const logo = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="8" fill="#c8102e"/><path d="M14 12v40M32 12v40M50 12v40M14 26h36M14 40h36" stroke="#fff" stroke-width="4" stroke-linecap="square"/></svg>`;

const phoneLink = (label = PHONE_DISPLAY, className = "") =>
  `<a class="${className}" href="tel:${PHONE_TEL}">${esc(label)}</a>`;

function formBlock(heading = "Get a free quote") {
  return `<div class="quote-card" id="quote">
    <h2>${esc(heading)}</h2>
    <p>Tell us the town, the fence type, and what the line has to do. We use this to call you back.</p>
    <iframe data-tally-src="${TALLY}" loading="eager" width="100%" height="552" frameborder="0" marginheight="0" marginwidth="0" title="Get a free quote"></iframe>
    <p class="note">If the form does not load, <a href="${TALLY_PAGE}">open the quote form</a>. The source field is set to ${esc(NAME)}.</p>
  </div>`;
}

function nav(current) {
  const serviceLinks = services.map((service) =>
    `<a href="/${service.slug}/"${current === `/${service.slug}/` ? ' aria-current="page"' : ""}>${esc(service.nav)}</a>`
  ).join("");
  const areaLinks = locations.map((location) =>
    `<a href="/service-areas/${location.slug}/"${current === `/service-areas/${location.slug}/` ? ' aria-current="page"' : ""}>${esc(location.name)}</a>`
  ).join("");
  const currentAttr = (href) => current === href ? ' aria-current="page"' : "";
  return `<header class="site-header">
    <div class="wrap header-inner">
      <a class="logo" href="/" aria-label="${esc(NAME)} home">
        ${logo}
        <span class="logo-text"><span class="logo-kicker">Fort Collins</span><span class="logo-word">Fence Company</span></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="nav" aria-label="Primary">
        <a href="/"${currentAttr("/")}>Home</a>
        <div class="drop">
          <button class="drop-btn" type="button" aria-expanded="false">Services</button>
          <div class="drop-panel wide">${serviceLinks}<a href="/services/"${currentAttr("/services/")}>All services</a></div>
        </div>
        <div class="drop">
          <button class="drop-btn" type="button" aria-expanded="false">Service Areas</button>
          <div class="drop-panel">${areaLinks}<a href="/service-areas/"${currentAttr("/service-areas/")}>All service areas</a></div>
        </div>
        <a href="/faqs/"${currentAttr("/faqs/")}>FAQs</a>
        <a href="/about/"${currentAttr("/about/")}>About</a>
        <a href="/contact/"${currentAttr("/contact/")}>Contact</a>
      </nav>
      ${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-red header-call")}
    </div>
  </header>`;
}

function footer() {
  const serviceItems = services.map((service) => `<li><a href="/${service.slug}/">${esc(service.name)}</a></li>`).join("");
  return `<footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <h2>Company</h2>
        <ul>
          <li><a href="/about/">About</a></li>
          <li><a href="/faqs/">FAQs</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="/privacy-policy/">Privacy policy</a></li>
          <li><a href="/terms/">Terms</a></li>
        </ul>
      </div>
      <div>
        <h2>Services</h2>
        <ul>${serviceItems}</ul>
      </div>
      <div>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/service-areas/">Service Areas</a></li>
          <li><a href="/contact/">Free Quote</a></li>
          <li><a href="/sitemap.xml">Sitemap</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p>${esc(NAME)}. Fence installation and repair for Fort Collins and nearby towns. No public storefront is listed.</p>
      <p>© ${new Date().getFullYear()} ${esc(NAME)}</p>
    </div>
  </footer>
  <div class="mobile-bar">
    ${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-line")}
    <a class="btn btn-red" href="/contact/">Free quote</a>
  </div>`;
}

function crumbs(items) {
  const parts = [{ name: "Home", href: "/" }, ...items];
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.map((item, index) =>
    index === parts.length - 1
      ? `<span aria-current="page">${esc(item.name)}</span>`
      : `<a href="${item.href}">${esc(item.name)}</a><span aria-hidden="true">/</span>`
  ).join(" ")}</nav>`;
}

function faqList(faqs) {
  return faqs.map((faq) => `<details class="faq"><summary>${esc(faq.q)}</summary><p>${esc(faq.a)}</p></details>`).join("");
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function businessNode() {
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE}/#business`,
    name: NAME,
    url: `${SITE}/`,
    telephone: "+1-970-235-8596",
    image: `${SITE}/images/wood.jpg`,
    logo: `${SITE}/images/logo.svg`,
    description: "Fence installation and repair for homes, commercial lots, and agricultural properties in Fort Collins, Colorado and nearby towns.",
    areaServed: locations.map((location) => ({
      "@type": location.slug === "larimer-county" ? "AdministrativeArea" : "City",
      name: location.slug === "larimer-county" ? "Larimer County" : location.name,
      containedInPlace: { "@type": "State", name: "Colorado" }
    })),
    knowsAbout: ["fence installation", "fence repair", "wood fencing", "vinyl fencing", "aluminum fencing", "chain link fencing", "farm fencing", "gate installation"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fence services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          url: `${SITE}/${service.slug}/`,
          areaServed: { "@type": "City", name: "Fort Collins", containedInPlace: { "@type": "State", name: "Colorado" } },
          provider: { "@id": `${SITE}/#business` }
        }
      }))
    }
  };
}

function graph({ path: pagePath, title, description, crumbsItems, mainEntity, faqEntities }) {
  const url = `${SITE}${pagePath}`;
  const webpage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${SITE}/#website` },
    about: { "@id": `${SITE}/#business` },
    inLanguage: "en-US",
    breadcrumb: { "@id": `${url}#breadcrumb` }
  };
  if (mainEntity) webpage.mainEntity = mainEntity;
  if (faqEntities) {
    webpage.hasPart = {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      isPartOf: { "@id": `${url}#webpage` },
      mainEntity: faqEntities.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a }
      }))
    };
  }
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [{ name: "Home", href: "/" }, ...crumbsItems].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE}${item.href || pagePath}`
    }))
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessNode(),
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: NAME,
        publisher: { "@id": `${SITE}/#business` }
      },
      webpage,
      breadcrumb
    ]
  };
}

function layout({ title, description, path: pagePath, body, schema, robots = "index,follow" }) {
  const canonical = `${SITE}${pagePath}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="${esc(NAME)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/images/wood.jpg">
  <meta name="theme-color" content="#c8102e">
  <link rel="icon" href="/images/logo.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  ${schema ? jsonLd(schema) : ""}
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <div class="topbar"><div class="wrap topbar-inner"><span>Fort Collins, Colorado</span>${phoneLink(PHONE_DISPLAY)}</div></div>
  ${nav(pagePath)}
  <main id="content">${body}</main>
  ${footer()}
  <script>var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}</script>
  <script src="/js/main.js"></script>
</body>
</html>`;
}

function cards(list = services) {
  return `<div class="card-grid">${list.map((service) => `<a class="card" href="/${service.slug}/">
    <img src="${service.image}" alt="${esc(service.alt)}">
    <span class="card-body"><h3>${esc(service.name)}</h3><p>${esc(service.card)}</p><span class="more">Details</span></span>
  </a>`).join("")}</div>`;
}

function ctaBand(text) {
  return `<div class="cta-band">
    <div><h2>Request an estimate</h2><p>${esc(text)}</p></div>
    <div class="cta-actions"><a class="btn btn-red" href="/contact/">Request an estimate</a>${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-outline")}</div>
  </div>`;
}

function homePage() {
  const title = "Fence Company in Fort Collins, CO | Fort Collins Fence Company";
  const description = "Fence installation and repair in Fort Collins, CO. Wood, vinyl, aluminum, chain link, farm fence, and gates. Call (970) 235-8596 for a free quote.";
  const body = `<section class="hero"><div class="wrap hero-grid">
    <div>
      <p class="eyebrow">Fort Collins, Colorado</p>
      <h1>Fence Company in Fort Collins, CO</h1>
      <p class="lede">Wood, vinyl, aluminum, chain link, and metal fences for houses, commercial lots, and acreage. New lines, replacements, repairs, and gates — quoted from the property.</p>
      <div class="hero-actions">${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-outline")}<a class="btn btn-red" href="#quote">Get a free quote</a></div>
    </div>
    ${formBlock()}
  </div></section>
  <section class="section" id="services">
    <div class="wrap">
      <div class="section-head"><h2>Fence services</h2><p>Start with the job, then the material. A front-yard picket, a backyard screen, and a pasture line are not the same fence.</p></div>
      ${cards()}
    </div>
  </section>
  <section class="section section-paper">
    <div class="wrap">
      <div class="section-head"><h2>Fence styles</h2><p>These are the materials we install and repair. Photos show the fence type, not a claim about a specific local job.</p></div>
      <div class="gallery">
        ${services.slice(0, 8).map((service) => `<a href="/${service.slug}/"><img src="${service.image}" alt="${esc(service.alt)}"><span>${esc(service.nav)}</span></a>`).join("")}
      </div>
    </div>
  </section>
  <section class="section"><div class="wrap two">
    <article class="panel"><h2>Houses</h2><p>Backyard privacy, front-yard picket, pet yards, and gates that clear a mower. Many in-town Fort Collins jobs are a 6-foot wood or vinyl screen on the rear and side, with a shorter fence if the run faces the street.</p><p><a href="/privacy-fence/">Privacy fences</a> and <a href="/picket-fencing/">picket fences</a> follow different height rules.</p></article>
    <article class="panel"><h2>Lots and acreage</h2><p>Commercial yards need a heavier chain-link spec and a gate a truck can use. Pasture north and east of town needs rail or wire, not a backyard panel. <a href="/commercial-fencing/">Commercial fencing</a> and <a href="/farm-fencing/">farm fencing</a> are quoted as their own jobs.</p></article>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>How a quote is built</h2><p>The price comes from the line on the ground. These are the details that change it.</p></div>
    <ol class="steps">
      <li><strong>Name the job.</strong> Screen a yard, contain an animal, secure a lot, or mark a line. That choice picks the material faster than a style photo.</li>
      <li><strong>Check the rules for that parcel.</strong> Fort Collins, Loveland, Windsor, Timnath, and unincorporated Larimer County do not share one fence sheet. HOA rules can be stricter than the town.</li>
      <li><strong>Count gates and grade.</strong> Slope, corners, and every opening change posts and hardware. A fence with the wrong gate is a daily problem.</li>
      <li><strong>Decide repair or replacement.</strong> Sound posts can take new boards or mesh. Posts that have rotted or heaved cannot. Start with <a href="/fence-repair/">fence repair</a> if the line is still mostly straight.</li>
    </ol>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>Service area</h2><p>We work in Fort Collins and nearby communities. Each town has its own lot patterns and its own fence rules. <a href="/service-areas/">See the service area</a>.</p></div>
    <div class="area-grid">${locations.map((location) => `<a href="/service-areas/${location.slug}/">${esc(location.name)} <span aria-hidden="true">→</span></a>`).join("")}</div>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>Questions before you call</h2></div>
    ${faqList(homeFaqs)}
    <p><a href="/faqs/">More fence questions</a></p>
  </div></section>
  <section class="section"><div class="wrap">${ctaBand(`Call ${PHONE_DISPLAY} or use the quote form at the top of this page.`)}</div></section>`;
  return layout({
    title,
    description,
    path: "/",
    body,
    schema: graph({
      path: "/",
      title,
      description,
      crumbsItems: [],
      faqEntities: homeFaqs
    })
  });
}

function servicePage(service) {
  const pagePath = `/${service.slug}/`;
  const title = `${service.title} | ${NAME}`;
  const related = service.related.map((slug) => services.find((item) => item.slug === slug));
  const faqs = service.faqs.map(([q, a]) => ({ q, a }));
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "Services", href: "/services/" }, { name: service.name }])}
    <div class="split">
      <div>
        <p class="eyebrow">${esc(NAME)}</p>
        <h1>${esc(service.h1)}</h1>
        <p>${esc(service.intro)}</p>
        ${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-dark")}
      </div>
      <img src="${service.image}" alt="${esc(service.alt)}">
    </div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>${esc(service.whenTitle)}</h2><p>${esc(service.whenIntro)}</p></div>
    <div class="situation-grid">${service.when.map(([titleText, copy]) => `<article class="situation"><h3>${esc(titleText)}</h3><p>${esc(copy)}</p></article>`).join("")}</div>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>How the work goes</h2></div>
    <ol class="steps">${service.process.map(([titleText, copy], index) => `<li><strong>${index + 1}. ${esc(titleText)}</strong> ${esc(copy)}</li>`).join("")}</ol>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>What changes the price</h2><p>We do not publish a per-foot rate. These are the items that move an estimate for this fence.</p></div>
    <div class="factor-grid">${service.costs.map(([titleText, copy]) => `<article class="factor"><h3>${esc(titleText)}</h3><p>${esc(copy)}</p></article>`).join("")}</div>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>Questions about ${esc(service.name.toLowerCase())}</h2></div>
    ${faqList(faqs)}
  </div></section>
  <section class="section"><div class="wrap">
    <h2>Related fencing</h2>
    <div class="related">${related.map((item) => `<a class="btn btn-line" href="/${item.slug}/">${esc(item.name)}</a>`).join("")}<a class="btn btn-line" href="/service-areas/fort-collins/">Fort Collins lots</a></div>
    <div style="height:1.2rem"></div>
    ${ctaBand(`Tell us the length, the gates, and the town. We will estimate this ${service.name.toLowerCase()} from the property.`)}
  </div></section>`;
  return layout({
    title,
    description: service.description,
    path: pagePath,
    body,
    schema: graph({
      path: pagePath,
      title,
      description: service.description,
      crumbsItems: [{ name: "Services", href: "/services/" }, { name: service.name, href: pagePath }],
      mainEntity: {
        "@type": "Service",
        name: service.h1,
        serviceType: service.name,
        description: service.intro,
        url: `${SITE}${pagePath}`,
        provider: { "@id": `${SITE}/#business` },
        areaServed: { "@type": "City", name: "Fort Collins", containedInPlace: { "@type": "State", name: "Colorado" } }
      },
      faqEntities: faqs
    })
  });
}

function locationPage(location) {
  const pagePath = `/service-areas/${location.slug}/`;
  const title = `${location.title} | ${NAME}`;
  const faqs = location.faqs.map(([q, a]) => ({ q, a }));
  const linked = location.services.map((slug) => services.find((item) => item.slug === slug));
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "Service Areas", href: "/service-areas/" }, { name: location.name }])}
    <div class="split">
      <div>
        <p class="eyebrow">Service area</p>
        <h1>${esc(location.h1)}</h1>
        <p>${esc(location.intro)}</p>
        ${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-dark")}
      </div>
      <img src="${location.image}" alt="${esc(location.alt)}">
    </div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>What fencing looks like here</h2><p>${esc(location.body)}</p></div>
    <ul class="steps">${location.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>Services that fit these lots</h2></div>
    ${cards(linked)}
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>Questions about fencing in ${esc(location.name)}</h2></div>
    ${faqList(faqs)}
    <div style="height:1.2rem"></div>
    ${ctaBand(`Send the ${location.name} address, the fence type, and whether an HOA has to approve it.`)}
  </div></section>`;
  return layout({
    title,
    description: location.description,
    path: pagePath,
    body,
    schema: graph({
      path: pagePath,
      title,
      description: location.description,
      crumbsItems: [{ name: "Service Areas", href: "/service-areas/" }, { name: location.name, href: pagePath }],
      mainEntity: {
        "@type": "Service",
        name: location.h1,
        areaServed: {
          "@type": location.slug === "larimer-county" ? "AdministrativeArea" : "City",
          name: location.slug === "larimer-county" ? "Larimer County" : location.name
        },
        provider: { "@id": `${SITE}/#business` }
      },
      faqEntities: faqs
    })
  });
}

function servicesPage() {
  const pagePath = "/services/";
  const title = `Fence Services in Fort Collins, CO | ${NAME}`;
  const description = "Wood, vinyl, aluminum, metal, chain link, privacy, picket, farm fence, gates, commercial fencing, and repair in Fort Collins, CO.";
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "Services" }])}
    <h1>Fence services in Fort Collins</h1>
    <p class="lede">Every fence below is installed and repaired as its own job. Pick the one that matches the yard, the animals, or the site.</p>
  </div></section>
  <section class="section"><div class="wrap">${cards()}</div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({ path: pagePath, title, description, crumbsItems: [{ name: "Services", href: pagePath }] })
  });
}

function areasPage() {
  const pagePath = "/service-areas/";
  const title = `Fence Service Area around Fort Collins, CO | ${NAME}`;
  const description = "Fort Collins Fence Company serves Fort Collins, Loveland, Windsor, Timnath, Wellington, Laporte, Berthoud, Johnstown, and Larimer County.";
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "Service Areas" }])}
    <h1>Fence service area</h1>
    <p class="lede">We install and repair fences in Fort Collins and nearby towns. The towns are listed separately because a Fort Collins fence rule is not a Loveland, Windsor, or county rule.</p>
    <div class="area-grid">${locations.map((location) => `<a href="/service-areas/${location.slug}/">${esc(location.name)} <span aria-hidden="true">→</span></a>`).join("")}</div>
  </div></section>
  <section class="section"><div class="wrap">${ctaBand("Tell us the town on the quote form so the estimate uses the right lot, not a copied city name.")}</div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({ path: pagePath, title, description, crumbsItems: [{ name: "Service Areas", href: pagePath }] })
  });
}

function faqPage() {
  const pagePath = "/faqs/";
  const title = `Fence FAQs for Fort Collins, CO | ${NAME}`;
  const description = "Answers on Fort Collins fence cost, permits, materials, HOA rules, and repairs. No per-foot price list — quotes come from the property.";
  const extra = [
    {
      q: "Do you offer farm and horse fencing?",
      a: "Yes. Wire, rail, and high-tensile runs for pastures north and east of Fort Collins, including Wellington and unincorporated Larimer County. A horse fence is specified differently from a cattle fence, and a backyard privacy panel is not used as either one. Tell us the animals and the widest gate."
    },
    {
      q: "Can you build a commercial fence?",
      a: "Yes. Commercial jobs use a heavier chain-link or metal spec and a vehicle gate, not a residential panel. Barbed wire is only discussed where Fort Collins zoning allows it, which is limited to employment and industrial districts. Send the use of the yard and what has to drive through."
    },
    {
      q: "Do I need to be home for an estimate?",
      a: "Someone who can walk the line is useful, especially where the property pins are unclear or a gate has to miss a slope. If you cannot be there, send the address, photos, and a note about HOA rules. We still need the real layout before a number is final."
    },
    {
      q: "Do you publish a street address?",
      a: "No public storefront is listed for this company. Work is quoted and done at the property. Call (970) 235-8596 or use the quote form and include the town so we know which fence rules to check."
    }
  ];
  const faqs = [...homeFaqs, ...extra];
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "FAQs" }])}
    <h1>Fence questions</h1>
    <p class="lede">Straight answers on price, permits, materials, and repairs. Fort Collins rules are labeled as Fort Collins rules.</p>
    ${faqList(faqs)}
    <p>Fort Collins publishes its height and building-permit basics on the <a href="${CITY_RULES}">city’s rules for common projects</a>.</p>
    ${ctaBand("If your lot is outside Fort Collins, say which town. The answer changes.")}
  </div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({ path: pagePath, title, description, crumbsItems: [{ name: "FAQs", href: pagePath }], faqEntities: faqs })
  });
}

function aboutPage() {
  const pagePath = "/about/";
  const title = `About ${NAME}`;
  const description = "Fort Collins Fence Company installs and repairs wood, vinyl, aluminum, chain link, metal, and farm fence for Fort Collins and nearby Colorado towns.";
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "About" }])}
    <div class="split">
      <div>
        <h1>About ${esc(NAME)}</h1>
        <p>${esc(NAME)} installs and repairs fences for houses, commercial lots, and agricultural properties in Fort Collins and nearby towns. The work is wood, vinyl, aluminum, ornamental metal, chain link, picket, privacy, farm fence, and gates.</p>
        <p>No public storefront is listed. Quotes are based on the property: footage, gates, grade, and the rules for that town. We do not publish a per-foot price, a license number, or a review score on this site.</p>
        ${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-dark")}
      </div>
      <img src="/images/aluminum.jpg" alt="Black aluminum fence with vertical pickets">
    </div>
  </div></section>
  <section class="section"><div class="wrap prose">
    <h2>What we will not invent</h2>
    <p>Fort Collins is in Colorado, and the phone number published here is ${PHONE_DISPLAY}. Fence rules for Loveland, Windsor, Timnath, Wellington, Berthoud, Johnstown, and Larimer County are not copies of the Fort Collins sheet.</p>
    <p>Photos on this site show fence types. They are not labeled as a specific completed job unless we say so.</p>
    <p><a href="/services/">See the services</a> or <a href="/service-areas/">the towns we cover</a>.</p>
  </div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({ path: pagePath, title, description, crumbsItems: [{ name: "About", href: pagePath }] })
  });
}

function contactPage() {
  const pagePath = "/contact/";
  const title = `Free Fence Quote in Fort Collins, CO | ${NAME}`;
  const description = `Request a fence estimate from ${NAME} or call ${PHONE_DISPLAY}. The form records this site as the lead source.`;
  const body = `<section class="page-hero"><div class="wrap">
    ${crumbs([{ name: "Free Quote" }])}
    <div class="split">
      <div>
        <h1>Request a fence estimate</h1>
        <p>Send the town, the type of fence, and a short note about gates or repairs. Only use this form for an estimate. Do not send payment information.</p>
        <p>${phoneLink(PHONE_DISPLAY)} · Fort Collins, Colorado</p>
      </div>
      ${formBlock("Get a free quote")}
    </div>
  </div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({
      path: pagePath,
      title,
      description,
      crumbsItems: [{ name: "Free Quote", href: pagePath }],
      mainEntity: { "@id": `${SITE}/#business` }
    })
  });
}

function privacyPage() {
  const pagePath = "/privacy-policy/";
  const title = `Privacy Policy | ${NAME}`;
  const description = `How ${NAME} handles quote requests sent through the estimate form and phone calls.`;
  const body = `<section class="page-hero"><div class="wrap prose">
    ${crumbs([{ name: "Privacy policy" }])}
    <h1>Privacy policy</h1>
    <p>This policy covers ${SITE.replace("https://", "")}. If you call ${PHONE_DISPLAY}, we use that number to talk about your fence. If you submit the quote form, the form is provided by Tally and includes a hidden source field set to “${esc(NAME)}” so the lead can be identified.</p>
    <p>We use the name, phone, email, and project notes you submit to respond to the estimate. We do not ask for payment card numbers through this form. We do not sell the information you send.</p>
    <p>The form provider processes the submission on its own systems. Their terms apply to that processing. This site does not run a separate customer account or a public storefront mailing list.</p>
    <p>Questions about a submission can be sent through the <a href="/contact/">quote form</a> or by phone.</p>
  </div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({ path: pagePath, title, description, crumbsItems: [{ name: "Privacy policy", href: pagePath }] })
  });
}

function termsPage() {
  const pagePath = "/terms/";
  const title = `Terms | ${NAME}`;
  const description = `Estimate terms for ${NAME}. A quote is not a contract, and property lines and HOA approval stay with the owner.`;
  const body = `<section class="page-hero"><div class="wrap prose">
    ${crumbs([{ name: "Terms" }])}
    <h1>Terms</h1>
    <p>An estimate from ${esc(NAME)} is a price for the fence described at that time. It is not a contract until both sides agree in writing. Footage, gates, grade, buried utilities, and fence rules can change the number after the line is seen.</p>
    <p>You are responsible for the property line, for marking private utilities the public locators do not cover, and for any HOA or neighbor approval. We do not decide a boundary dispute. Fort Collins, other towns, and Larimer County can require different heights and permits. Approval of a permit is not guaranteed by a quote.</p>
    <p>This site does not publish a warranty term, a license number, or a financing offer. Do not send payment through the quote form.</p>
  </div></section>`;
  return layout({
    title,
    description,
    path: pagePath,
    body,
    schema: graph({ path: pagePath, title, description, crumbsItems: [{ name: "Terms", href: pagePath }] })
  });
}

function notFoundPage() {
  const pagePath = "/404.html";
  const title = `Page not found | ${NAME}`;
  const description = "That page is not on the Fort Collins Fence Company site.";
  const body = `<section class="page-hero"><div class="wrap">
    <h1>That page is not on this site.</h1>
    <p>Use the menu, view <a href="/services/">fence services</a>, or call ${phoneLink(PHONE_DISPLAY)}.</p>
  </div></section>`;
  return layout({ title, description, path: pagePath, body, robots: "noindex,follow" });
}

const pages = [
  ["index.html", homePage()],
  ["services/index.html", servicesPage()],
  ["service-areas/index.html", areasPage()],
  ["faqs/index.html", faqPage()],
  ["about/index.html", aboutPage()],
  ["contact/index.html", contactPage()],
  ["privacy-policy/index.html", privacyPage()],
  ["terms/index.html", termsPage()],
  ["404.html", notFoundPage()],
  ...services.map((service) => [`${service.slug}/index.html`, servicePage(service)]),
  ...locations.map((location) => [`service-areas/${location.slug}/index.html`, locationPage(location)])
];

const urls = pages
  .map(([file]) => file.replace(/index\.html$/, "").replace(/\/$/, ""))
  .filter((file) => file !== "404.html")
  .map((file) => (file ? `${SITE}/${file}/` : `${SITE}/`));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><lastmod>2026-10-16</lastmod></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

const llms = `# ${NAME}

> Fence installation and repair in Fort Collins, Colorado. Phone ${PHONE_DISPLAY}. No public storefront is listed. Do not invent prices, licenses, warranties, or reviews.

## Main
- ${SITE}/
- ${SITE}/services/
- ${SITE}/service-areas/
- ${SITE}/faqs/
- ${SITE}/contact/

## Services
${services.map((service) => `- ${SITE}/${service.slug}/`).join("\n")}

## Service area
${locations.map((location) => `- ${SITE}/service-areas/${location.slug}/`).join("\n")}
`;

function validate() {
  const counts = services.map((service) => words(service.card));
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  if (max - min > 8) {
    console.log(services.map((service) => `${words(service.card)}\t${service.slug}`).join("\n"));
    throw new Error(`Card descriptions vary too much (${min}-${max} words)`);
  }
  const titles = new Set();
  const descriptions = new Set();
  for (const [, html] of pages) {
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/name="description" content="(.*?)"/)[1];
    const h1s = html.match(/<h1/g) || [];
    if (h1s.length !== 1) throw new Error(`Expected one H1, found ${h1s.length} in ${title}`);
    if (titles.has(title)) throw new Error(`Duplicate title ${title}`);
    if (descriptions.has(description)) throw new Error(`Duplicate description ${description}`);
    titles.add(title);
    descriptions.add(description);
    if (!html.includes('rel="canonical"')) throw new Error(`Missing canonical in ${title}`);
  }
  console.log(`Card words ${min}-${max}. Pages ${pages.length}.`);
}

async function cleanGenerated() {
  const keep = new Set([".git", "css", "images", "js", "src", "node_modules"]);
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(root, { withFileTypes: true });
  await Promise.all(entries.filter((entry) => !keep.has(entry.name) && entry.name !== "package.json").map((entry) =>
    rm(path.join(root, entry.name), { recursive: true, force: true })
  ));
}

validate();
await cleanGenerated();
await Promise.all(pages.map(async ([file, html]) => {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}));
await writeFile(path.join(root, "sitemap.xml"), sitemap);
await writeFile(path.join(root, "robots.txt"), robots);
await writeFile(path.join(root, "llms.txt"), llms);
console.log("Built", pages.length, "pages");
