const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const yaml = require("js-yaml");

const md = new MarkdownIt({ html: true });

const toDate = (v) => (v instanceof Date ? v : new Date(v));

module.exports = function (eleventyConfig) {
  // Statické soubory se kopírují beze změny
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "src/admin": "admin",
    "src/robots.txt": "robots.txt",
    "src/404.html": "404.html",
  });

  // Datové soubory ve formátu YAML (src/_data/podcast.yml se upravuje v editoru)
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // ---------- Filtry ----------
  // "2:30" -> 150, "1:02:03" -> 3723 (pro odkazy na kapitoly v YouTube)
  eleventyConfig.addFilter("seconds", (t) =>
    String(t || "0")
      .trim()
      .split(":")
      .reduce((acc, part) => acc * 60 + (parseInt(part, 10) || 0), 0)
  );

  // 1 minuta / 2–4 minuty / 5+ minut
  eleventyConfig.addFilter("minutes", (n) => {
    const v = parseInt(n, 10);
    const word = v === 1 ? "minuta" : v >= 2 && v <= 4 ? "minuty" : "minut";
    return `${v} ${word}`;
  });

  // Obrázek z editoru ("/assets/img/x.jpg") -> relativní cesta; absolutní URL nechá být
  eleventyConfig.addFilter("assetUrl", (p, root) => {
    if (!p) return "";
    if (/^https?:/i.test(p)) return p;
    return (root || "") + String(p).replace(/^\//, "");
  });

  // Pokud vedle .jpg/.png leží stejnojmenný .webp, vrátí jeho cestu
  eleventyConfig.addFilter("webpSibling", (p) => {
    if (!p || /^https?:/i.test(p) || !/\.(jpe?g|png)$/i.test(p)) return "";
    const webp = String(p).replace(/\.(jpe?g|png)$/i, ".webp");
    return fs.existsSync(path.join("src", webp)) ? webp : "";
  });

  eleventyConfig.addFilter("mdInline", (s) => (s ? md.renderInline(String(s)) : ""));
  eleventyConfig.addFilter("dateISO", (v) => (v ? toDate(v).toISOString().slice(0, 10) : ""));
  eleventyConfig.addFilter("dateCz", (v) => {
    if (!v) return "";
    const d = toDate(v);
    return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}. ${d.getUTCFullYear()}`;
  });

  // ---------- Kolekce ----------
  // Epizody podcastu: nejnovější (nejvyšší číslo) nahoře
  eleventyConfig.addCollection("episodes", (api) =>
    api
      .getFilteredByGlob("src/content/episodes/*.md")
      .sort((a, b) => String(b.data.episode).localeCompare(String(a.data.episode)))
  );

  // Články: nejdřív ty s datem (nejnovější nahoře), pak ty bez data podle pole "order"
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/content/articles/*.md").sort((a, b) => {
      const da = a.data.date ? toDate(a.data.date).getTime() : null;
      const db = b.data.date ? toDate(b.data.date).getTime() : null;
      if (da !== null && db !== null) return db - da;
      if (da !== null) return -1;
      if (db !== null) return 1;
      return (a.data.order ?? 999) - (b.data.order ?? 999);
    })
  );

  // Vlastní články (mají vlastní stránku), tj. ty bez odkazu na externí web
  eleventyConfig.addCollection("ownArticles", (api) =>
    api.getFilteredByGlob("src/content/articles/*.md").filter((i) => !i.data.external_url)
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: false, // text z editoru se nikdy nevyhodnocuje jako šablona
    htmlTemplateEngine: "njk",
  };
};
