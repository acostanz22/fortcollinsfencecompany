import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { services, locations, homeFaqs } from "./data.mjs";
import { homeIntro, serviceIntros, locationIntros, pageIntros } from "./intros.mjs";

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
    <iframe data-tally-src="${TALLY}" loading="eager" width="100%" height="520" frameborder="0" marginheight="0" marginwidth="0" title="Get a free quote"></iframe>
    <p class="note">If the form does not load, <a href="${TALLY_PAGE}">open the quote form</a>.</p>
  </div>`;
}

const logoLink = (className = "logo") => `<a class="${className}" href="/" aria-label="${esc(NAME)} home">
        ${logo}
        <span class="logo-text"><span class="logo-kicker">Fort Collins</span><span class="logo-word">Fence Company</span></span>
      </a>`;

// Every page registers its intro here so validate() can enforce the checklist.
const introRegistry = [];

function pageHero({ path: pagePath, crumbItems, h1, intro }) {
  introRegistry.push({ path: pagePath, intro });
  return `<div class="crumb-bar"><div class="wrap">${crumbs(crumbItems)}</div></div>
  <section class="hero slim-hero">
    <div class="wrap slim-grid">
      <div class="slim-copy">
        <p class="eyebrow">${esc(NAME)}</p>
        <h1>${esc(h1)}</h1>
        <p class="lede intro">${esc(intro)}</p>
        <div class="hero-actions">${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-outline")}</div>
      </div>
      ${formBlock()}
    </div>
  </section>`;
}

function finalCta(heading, text) {
  return `<section class="section section-cta">
    <div class="wrap cta-inner">
      <div><h2>${esc(heading)}</h2><p>${esc(text)}</p></div>
      <div class="cta-actions"><a class="btn btn-dark" href="#quote">Get a free quote</a>${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-outline")}</div>
    </div>
  </section>`;
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
      ${logoLink()}
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

const OFFICE_HOURS = "Monday–Sunday: 7 am – 7 pm";
const OFFICE_HOURS_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const OFFICE_HOURS_TIME = "7 am – 7 pm";

function officeHoursBlock() {
  const rows = OFFICE_HOURS_DAYS.map((day) => `<div><span>${day}</span><span>${OFFICE_HOURS_TIME}</span></div>`).join("");
  return `<div class="hours-list">${rows}</div>`;
}

function footer() {
  const serviceItems = services.map((service) => `<li><a href="/${service.slug}/">${esc(service.name)}</a></li>`).join("");
  return `<footer class="site-footer">
    <div class="wrap footer-brand">
      ${logoLink("logo footer-logo")}
      <p>Fence installation and repair for Fort Collins and nearby Colorado towns. Call ${phoneLink(PHONE_DISPLAY)}.</p>
    </div>
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
      <div>
        <h2>Office Hours</h2>
        ${officeHoursBlock()}
      </div>
    </div>
    <div class="wrap footer-bottom">
      <p>${esc(NAME)}. Fence installation and repair for Fort Collins and nearby towns. No public storefront is listed.</p>
      <p>© ${new Date().getFullYear()} ${esc(NAME)}</p>
    </div>
  </footer>
  <div class="mobile-bar">
    ${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-line")}
    <a class="btn btn-red" href="#quote">Free quote</a>
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


const whyChoose = [
  ["Quoted from the property", "Footage, slope, gates, and the rules for your town change the price more than the fence style does. We build the number from the line on the ground, not from a brochure range."],
  ["Every common fence material", "Wood, vinyl, aluminum, ornamental metal, chain link, and farm fence are all installed and repaired here. The material follows the job, not a single house default."],
  ["Repair before replace", "If the posts are sound and the failure is local, we repair that section. We say so plainly when a full replacement is the honest answer instead."],
  ["Town-by-town rules", "Fort Collins, Loveland, Windsor, Timnath, and unincorporated Larimer County do not share one fence sheet. We check the rules that apply to your parcel, including HOA packets."],
  ["Gates built for the opening", "Walk gates, drive gates, and sliding gates are sized to the width, the slope, and the hinge load. Most sag is an undersized post, so we set gate posts to the leaf."],
  ["Straight answers, easy to reach", "No invented prices, review scores, or license claims on this site. Call (970) 235-8596 any day between 7 am and 7 pm, or send the quote form."]
];

const localProcess = [
  ["Tell us about the job", "Call or send the quote form with the town, the fence type, and what the line has to do. Screening a yard, holding an animal, or securing a lot each point to a different material."],
  ["We check the property and the rules", "We look at the line, the grade, and every gate opening. We also check the rules for that parcel, because Fort Collins, Loveland, Windsor, Timnath, and the county are not the same, and HOA rules can be stricter than the town."],
  ["Decide repair or replacement", "Sound posts can take new boards or mesh. Posts that have rotted or heaved cannot. If the line is still mostly straight, we start with a repair."],
  ["Build and hang the gates", "Posts, panels or fabric, and gates go in as agreed. The job is done when the gate closes without lifting it and the new section matches the fence beside it."]
];

const reviewsSection = `<section class="section section-paper" id="reviews">
    <div class="wrap">
      <div class="section-head"><h2>Customer reviews</h2></div>
      <div class="two">
        <article class="panel">
          <h3>No reviews posted here yet</h3>
          <p>We only show reviews written by real customers, with their permission. None are published on this site yet, so there are no star ratings, scores, or quotes on this page. We would rather show nothing than show something we cannot back up.</p>
          <p>If we have fenced your property and you would like to share your experience, mention it when you call ${phoneLink(PHONE_DISPLAY)}.</p>
        </article>
        <article class="panel">
          <h3>What to ask any fence company</h3>
          <ul class="check-list">
            <li>Which town&#39;s fence rules apply to my address, and does my HOA need to approve it?</li>
            <li>What are the post size, depth, and spacing, and how are the gate posts set?</li>
            <li>Is old-fence removal and haul-off included in the price?</li>
            <li>What happens if the line turns out different from the quote once the ground is opened?</li>
          </ul>
        </article>
      </div>
    </div>
  </section>`;

function homePage() {
  const title = "Fence Company Fort Collins CO | Vinyl Fence, Wood Fence, Aluminum Fence & More";
  const description = "Fort Collins Fence Company installs and repairs wood, vinyl, aluminum, chain link, and farm fence in Fort Collins, CO. Call (970) 235-8596 for a free quote.";
  introRegistry.push({ path: "/", intro: homeIntro });
  const body = `<section class="hero" id="top"><div class="wrap hero-grid">
    <div>
      <p class="eyebrow">Fort Collins, Colorado</p>
      <h1>Fence Company Fort Collins CO</h1>
      <p class="lede intro">${esc(homeIntro)}</p>
      <div class="hero-actions">${phoneLink(`Call ${PHONE_DISPLAY}`, "btn btn-outline")}<a class="btn btn-red" href="#services">See fence services</a></div>
    </div>
    ${formBlock()}
  </div></section>
  <section class="section" id="why-choose-us">
    <div class="wrap">
      <div class="section-head"><h2>Why choose ${esc(NAME)}</h2><p>A fence is a long line in the ground. These are the habits that keep the quote, the build, and the gate honest.</p></div>
      <div class="why-grid">${whyChoose.map(([heading, copy], index) => `<article class="why-item"><span class="why-num" aria-hidden="true">${index + 1}</span><h3>${esc(heading)}</h3><p>${esc(copy)}</p></article>`).join("")}</div>
    </div>
  </section>
  <section class="section section-paper" id="services">
    <div class="wrap">
      <div class="section-head"><h2>Fence services</h2><p>Start with the job, then the material. A front-yard picket, a backyard screen, and a pasture line are not the same fence.</p></div>
      ${cards()}
    </div>
  </section>
  <section class="section" id="gallery">
    <div class="wrap">
      <div class="section-head"><h2>Fence styles we build</h2><p>These photos show the fence types we install and repair. They are not labeled as specific local jobs.</p></div>
      <div class="gallery">
        ${services.slice(0, 8).map((service) => `<a href="/${service.slug}/"><img src="${service.image}" alt="${esc(service.alt)}" loading="lazy" decoding="async"><span>${esc(service.nav)}</span></a>`).join("")}
      </div>
    </div>
  </section>
  ${reviewsSection}
  <section class="section" id="process"><div class="wrap">
    <div class="section-head"><h2>How the work goes</h2><p>The price comes from the line on the ground. These four steps are how a job moves from a call to a closed gate.</p></div>
    <ol class="process-grid">${localProcess.map(([heading, copy], index) => `<li><span class="why-num" aria-hidden="true">${index + 1}</span><h3>${esc(heading)}</h3><p>${esc(copy)}</p></li>`).join("")}</ol>
  </div></section>
  <section class="section section-paper" id="areas"><div class="wrap">
    <div class="section-head"><h2>Areas we serve</h2><p>We work in Fort Collins and nearby communities. Each town has its own lot patterns and its own fence rules. <a href="/service-areas/">See the service area</a>.</p></div>
    <div class="area-grid">${locations.map((location) => `<a href="/service-areas/${location.slug}/">${esc(location.name)} <span aria-hidden="true">→</span></a>`).join("")}</div>
  </div></section>
  <section class="section" id="faq"><div class="wrap">
    <div class="section-head"><h2>Questions before you call</h2></div>
    ${faqList(homeFaqs)}
    <p><a href="/faqs/">More fence questions</a></p>
  </div></section>
  ${finalCta("Ready for a fence quote?", `Call ${PHONE_DISPLAY} or use the quote form at the top of this page. Tell us the town, the fence type, and what the line has to do.`)}`;
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

function serviceGallery(service) {
  const alt = services.find((item) => service.related.includes(item.slug) && item.image !== service.image)
    || services.find((item) => item.slug !== service.slug && item.image !== service.image);
  const shots = [service, alt].filter(Boolean).map((item) =>
    `<figure class="service-shot"><img src="${item.image}" alt="${esc(item.alt)}" width="800" height="600" loading="lazy" decoding="async"></figure>`
  ).join("");
  return `<div class="service-gallery">${shots}</div>`;
}

function servicePage(service) {
  const pagePath = `/${service.slug}/`;
  const title = `${service.title} | ${NAME}`;
  const related = service.related.map((slug) => services.find((item) => item.slug === slug));
  const faqs = service.faqs.map(([q, a]) => ({ q, a }));
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Services", href: "/services/" }, { name: service.name }], h1: service.h1, intro: serviceIntros[service.slug] })}
  <section class="section service-body">
    <div class="wrap service-layout">
      <div class="service-main">
        ${serviceGallery(service)}
        <div class="service-copy">
          <h2>${esc(service.whenTitle)}</h2>
          <p>${esc(service.whenIntro)}</p>
          <div class="situation-grid">${service.when.map(([titleText, copy]) => `<article class="situation"><h3>${esc(titleText)}</h3><p>${esc(copy)}</p></article>`).join("")}</div>
          <h2>How the work goes</h2>
          <ol class="steps">${service.process.map(([titleText, copy], index) => `<li><strong>${index + 1}. ${esc(titleText)}</strong> ${esc(copy)}</li>`).join("")}</ol>
          <h2>What changes the price</h2>
          <p>We do not publish a per-foot rate. These are the items that move an estimate for this fence.</p>
          <div class="factor-grid">${service.costs.map(([titleText, copy]) => `<article class="factor"><h3>${esc(titleText)}</h3><p>${esc(copy)}</p></article>`).join("")}</div>
          <h2>Questions about ${esc(service.name.toLowerCase())}</h2>
          ${faqList(faqs)}
        </div>
      </div>
      <aside class="service-aside" aria-label="Estimate and related services">
        <div class="side-card">
          <p class="side-kicker">Talk through the line</p>
          <p>Tell us the length, the gates, and the town. We will estimate this ${esc(service.name.toLowerCase())} from the property.</p>
          <p class="side-phone">${phoneLink(PHONE_DISPLAY, "phone-link-lg")}</p>
          <p class="side-hours">${OFFICE_HOURS}</p>
          <p><a class="btn btn-red" href="#quote">Request an estimate</a></p>
        </div>
        <div class="side-card side-card-muted">
          <p class="side-kicker">Related</p>
          <ul class="side-links">${related.map((item) => `<li><a href="/${item.slug}/">${esc(item.name)}</a></li>`).join("")}<li><a href="/service-areas/fort-collins/">Fort Collins lots</a></li></ul>
        </div>
      </aside>
    </div>
  </section>
  <section class="section section-paper section-towns">
    <div class="wrap">
      <h2>Towns we serve</h2>
      <div class="area-grid">${locations.map((location) => `<a href="/service-areas/${location.slug}/">${esc(location.name)} <span aria-hidden="true">→</span></a>`).join("")}</div>
      <p class="towns-links"><a href="/service-areas/">Service area</a> · <a href="/contact/">Contact</a> · <a href="/services/">All services</a></p>
    </div>
  </section>
  ${finalCta(`Get a ${service.name.toLowerCase()} quote`, `Call ${PHONE_DISPLAY} or use the quote form at the top of this page.`)}`;
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
        description: serviceIntros[service.slug],
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Service Areas", href: "/service-areas/" }, { name: location.name }], h1: location.h1, intro: locationIntros[location.slug] })}
  <section class="section"><div class="wrap">
    <div class="split local-split">
      <div class="section-head"><h2>What fencing looks like here</h2><p>${esc(location.body)}</p></div>
      <img src="${location.image}" alt="${esc(location.alt)}" loading="lazy" decoding="async">
    </div>
    <ul class="steps">${location.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>Services that fit these lots</h2></div>
    ${cards(linked)}
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>Questions about fencing in ${esc(location.name)}</h2></div>
    ${faqList(faqs)}
  </div></section>
  ${finalCta(`Fence quote in ${location.name}`, `Send the ${location.name} address, the fence type, and whether an HOA has to approve it.`)}`;
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

const houseLotPanels = `<div class="two">
    <article class="panel"><h2>Houses</h2><p>Backyard privacy, front-yard picket, pet yards, and gates that clear a mower. Many in-town Fort Collins jobs are a 6-foot wood or vinyl screen on the rear and side, with a shorter fence if the run faces the street.</p><p><a href="/privacy-fence/">Privacy fences</a> and <a href="/picket-fencing/">picket fences</a> follow different height rules.</p></article>
    <article class="panel"><h2>Lots and acreage</h2><p>Commercial yards need a heavier chain-link spec and a gate a truck can use. Pasture north and east of town needs rail or wire, not a backyard panel. <a href="/commercial-fencing/">Commercial fencing</a> and <a href="/farm-fencing/">farm fencing</a> are quoted as their own jobs.</p></article>
  </div>`;

function servicesPage() {
  const pagePath = "/services/";
  const title = `Fence Services in Fort Collins, CO | ${NAME}`;
  const description = "Wood, vinyl, aluminum, metal, chain link, privacy, picket, farm fence, gates, commercial fencing, and repair in Fort Collins, CO.";
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Services" }], h1: "Fence services in Fort Collins", intro: pageIntros.services })}
  <section class="section"><div class="wrap">${cards()}</div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>Choosing between them</h2><p>The job usually picks the material faster than a style photo does.</p></div>
    ${houseLotPanels}
  </div></section>
  ${finalCta("Not sure which fence fits?", `Call ${PHONE_DISPLAY} or use the quote form at the top of this page.`)}`;
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Service Areas" }], h1: "Fence service area", intro: pageIntros["service-areas"] })}
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>Towns we serve</h2></div>
    <div class="area-grid">${locations.map((location) => `<a href="/service-areas/${location.slug}/">${esc(location.name)} <span aria-hidden="true">→</span></a>`).join("")}</div>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>Why the town matters</h2><p>The same fence can be legal in one place and not in the next.</p></div>
    <div class="two">
      <article class="panel"><h3>Inside Fort Collins</h3><p>Fences 6 feet and under generally do not need a building permit. Front yards are generally limited to 4 feet and rear yards to 6 feet. See the <a href="/service-areas/fort-collins/">Fort Collins page</a>.</p></article>
      <article class="panel"><h3>Neighboring towns</h3><p>Loveland, Windsor, Timnath, Berthoud, and Johnstown set their own rules, and many neighborhoods add HOA review on top. We confirm the town before we set a height.</p></article>
    </div>
  </div></section>
  ${finalCta("Tell us which town", "Add the town to the quote form so the estimate uses the right lot and the right rules, not a copied city name.")}`;
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "FAQs" }], h1: "Fence questions", intro: pageIntros.faqs })}
  <section class="section"><div class="wrap">
    ${faqList(faqs)}
  </div></section>
  <section class="section section-paper"><div class="wrap prose">
    <h2>Check the rules for your lot</h2>
    <p>Fort Collins publishes its height and building-permit basics on the <a href="${CITY_RULES}">city&#39;s rules for common projects</a>. If your lot is outside Fort Collins, say which town on the quote form, because the answer changes. See the <a href="/service-areas/">service area</a> for the towns we cover.</p>
  </div></section>
  ${finalCta("Still have a question?", `Call ${PHONE_DISPLAY} or use the quote form at the top of this page.`)}`;
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "About" }], h1: `About ${NAME}`, intro: pageIntros.about })}
  <section class="section"><div class="wrap">
    <div class="split local-split">
      <div class="section-head"><h2>What we work on</h2><p>Houses, commercial lots, and agricultural properties get different fences. We install and repair each one as its own job, and we send you to the page that matches your yard.</p><p><a href="/services/">See all fence services</a> or <a href="/service-areas/">the towns we cover</a>.</p></div>
      <img src="/images/aluminum.jpg" alt="Black aluminum fence with vertical pickets" loading="lazy" decoding="async">
    </div>
  </div></section>
  <section class="section section-paper"><div class="wrap prose">
    <h2>What we will not invent</h2>
    <p>Fort Collins is in Colorado, and the phone number published here is ${PHONE_DISPLAY}. Fence rules for Loveland, Windsor, Timnath, Wellington, Berthoud, Johnstown, and Larimer County are not copies of the Fort Collins sheet.</p>
    <p>Photos on this site show fence types. They are not labeled as a specific completed job unless we say so, and this site does not display reviews we cannot verify.</p>
  </div></section>
  ${finalCta("Talk through your fence", `Call ${PHONE_DISPLAY} or use the quote form at the top of this page.`)}`;
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Contact" }], h1: "Request a fence estimate", intro: pageIntros.contact })}
  <section class="section"><div class="wrap">
    <div class="section-head"><h2>Ways to reach us</h2></div>
    <div class="two">
      <article class="panel"><h3>Call</h3><p>${phoneLink(PHONE_DISPLAY, "phone-link-lg")}</p><p>${OFFICE_HOURS}. No public storefront is listed, so work is quoted and done at the property.</p></article>
      <article class="panel"><h3>What to include in the form</h3><ul class="check-list"><li>The town and the address of the fence.</li><li>The type of fence, or the job it has to do.</li><li>Gates, slope, and whether an old fence has to come out.</li><li>Whether an HOA has to approve it.</li></ul></article>
    </div>
  </div></section>
  <section class="section section-paper"><div class="wrap">
    <div class="section-head"><h2>What happens next</h2></div>
    <ol class="process-grid">${localProcess.slice(0, 3).map(([heading, copy], index) => `<li><span class="why-num" aria-hidden="true">${index + 1}</span><h3>${esc(heading)}</h3><p>${esc(copy)}</p></li>`).join("")}</ol>
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
      crumbsItems: [{ name: "Contact", href: pagePath }],
      mainEntity: { "@id": `${SITE}/#business` }
    })
  });
}

function privacyPage() {
  const pagePath = "/privacy-policy/";
  const title = `Privacy Policy | ${NAME}`;
  const description = `How ${NAME} handles quote requests sent through the estimate form and phone calls.`;
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Privacy policy" }], h1: "Privacy policy", intro: pageIntros.privacy })}
  <section class="section"><div class="wrap prose">
    <p>This policy covers ${SITE.replace("https://", "")}. We use the name, phone, email, and project notes you submit to respond to the estimate.</p>
    <p>The form provider processes the submission on its own systems, and their terms apply to that processing. This site does not run a separate customer account or a public mailing list.</p>
    <p>Questions about a submission can be sent through the <a href="#quote">quote form</a> or by phone at ${phoneLink(PHONE_DISPLAY)}.</p>
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Terms" }], h1: "Terms", intro: pageIntros.terms })}
  <section class="section"><div class="wrap prose">
    <p>Fort Collins, other towns, and Larimer County can require different heights and permits. Approval of a permit is not guaranteed by a quote.</p>
    <p>Do not send payment through the quote form.</p>
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
  const body = `${pageHero({ path: pagePath, crumbItems: [{ name: "Page not found" }], h1: "That page is not on this site", intro: pageIntros.notFound })}
  <section class="section"><div class="wrap prose">
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
  for (const { path: pagePath, intro } of introRegistry) {
    const sentences = intro.trim().split(/(?<=[.!?])\s+(?=[A-Z])/);
    if (!intro.startsWith(NAME)) throw new Error(`Intro on ${pagePath} must start with ${NAME}`);
    if (sentences.length < 5 || sentences.length > 6) throw new Error(`Intro on ${pagePath} has ${sentences.length} sentences`);
  }
  if (introRegistry.length !== pages.length) throw new Error(`Intros ${introRegistry.length} vs pages ${pages.length}`);
  const home = pages.find(([file]) => file === "index.html")[1];
  if (!home.includes("<h1>Fence Company Fort Collins CO</h1>")) throw new Error("Home H1 mismatch");
  if (!home.includes("<title>Fence Company Fort Collins CO | Vinyl Fence, Wood Fence, Aluminum Fence &amp; More</title>")) throw new Error("Home title mismatch");
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
