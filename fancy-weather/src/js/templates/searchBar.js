export default function buildSearchBar() {
  const htmlStringOfElement = `
  <div class="search">
    <div class="search--microphone"></div>
    <input class="search--query" />
    <div class="search--btn"></div>
  </div>
  `;

  const fragment = document.createRange().createContextualFragment(htmlStringOfElement);

  return fragment.firstElementChild;
}
