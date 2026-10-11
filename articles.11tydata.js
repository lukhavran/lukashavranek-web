// Společná nastavení všech článků blogu (soubory v této složce).
// Článek s vyplněným "external_url" je jen karta s odkazem ven (vlastní stránka se nevytváří).
// Článek bez "external_url" dostane vlastní stránku /blog/<název-souboru>/.
module.exports = {
  layout: "article.njk",
  permalink: (data) => (data.external_url ? false : `/blog/${data.page.fileSlug}/`),
  eleventyComputed: {
    nav: () => "blog",
    og_type: () => "article",
    description: (d) => d.seo_description || d.summary,
    seo_title: (d) => `${d.title} | Lukáš Havránek`,
    og_title: (d) => d.title,
    og_description: (d) => d.seo_description || d.summary,
    og_image: (d) => (d.image ? `${d.site.url}${d.image}` : ""),

    jsonld: (d) => {
      const ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: d.title,
        description: d.seo_description || d.summary,
        url: `${d.site.url}/blog/${d.page.fileSlug}/`,
        author: { "@type": "Person", name: "Lukáš Havránek" },
      };
      if (d.date) ld.datePublished = new Date(d.date).toISOString().slice(0, 10);
      if (d.image) ld.image = `${d.site.url}${d.image}`;
      return JSON.stringify(ld, null, 2).replace(/</g, "\\u003c");
    },
  },
};
