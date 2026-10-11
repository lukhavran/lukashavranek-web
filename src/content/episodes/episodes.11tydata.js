// Společná nastavení všech epizod podcastu (soubory v této složce).
const PLATFORMS = { youtube: "YouTube", spotify: "Spotify" };

module.exports = {
  layout: "episode.njk",
  permalink: (data) => `/podcast/${data.page.fileSlug}/`,
  eleventyComputed: {
    nav: () => "podcast",
    theme_color: () => "#FF5D01",
    og_type: () => "article",
    platform_label: (d) => PLATFORMS[d.platform || "youtube"] || "YouTube",

    seo_title: (d) => `${d.title} — podcast Rezonance | Lukáš Havránek`,
    og_title: (d) => `${d.title} — podcast Rezonance`,
    og_description: (d) => d.social_description || d.description,

    // Obrázek epizody: nahraný v editoru, jinak náhled z YouTube
    thumb: (d) => {
      if (d.image) return d.image;
      if ((d.platform || "youtube") === "youtube" && d.media_id) {
        return `https://i.ytimg.com/vi/${d.media_id}/maxresdefault.jpg`;
      }
      return "";
    },
    og_image: (d) => {
      const t = d.image || ((d.platform || "youtube") === "youtube" && d.media_id
        ? `https://i.ytimg.com/vi/${d.media_id}/maxresdefault.jpg`
        : "");
      if (!t) return "";
      return /^https?:/i.test(t) ? t : `${d.site.url}${t}`;
    },

    jsonld: (d) => {
      const url = `${d.site.url}/podcast/${d.page.fileSlug}/`;
      const ld = {
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        name: d.title,
        episodeNumber: parseInt(d.episode, 10),
        datePublished: d.date ? new Date(d.date).toISOString().slice(0, 10) : undefined,
        description: d.social_description || d.description,
        url,
        image: undefined, // doplní se níže
        partOfSeries: { "@type": "PodcastSeries", name: "Rezonance", url: `${d.site.url}/podcast/` },
        author: { "@type": "Person", name: "Lukáš Havránek" },
      };
      const img = d.image
        ? `${d.site.url}${d.image}`
        : (d.platform || "youtube") === "youtube" && d.media_id
        ? `https://i.ytimg.com/vi/${d.media_id}/maxresdefault.jpg`
        : "";
      if (img) ld.image = img;
      else delete ld.image;
      return JSON.stringify(ld, null, 2).replace(/</g, "\\u003c");
    },
  },
};
