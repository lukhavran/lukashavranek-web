// Relativní cesta ke kořeni webu pro aktuální stránku ("" na Home, "../" v /podcast/, "../../" v epizodě…).
// Díky tomu web funguje na doméně i v podsložce (např. deploy preview nebo github.io/repo/).
module.exports = {
  root: (data) => {
    const url = data.page && data.page.url;
    if (!url || url === "/") return "";
    return "../".repeat(url.split("/").filter(Boolean).length);
  },
};
