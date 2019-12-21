export default function buildSearchBar() {
  const htmlStringOfElement = `
  <div class="search container">
    <div class="search--fake_input">
      <input class="search--query"/>
      <div class="search--icon search--icon-microphone"></div>
      <div class="search--icon search--icon-loupe"></div>
    </div>
  </div>
  `;

  const fragment = document.createRange().createContextualFragment(htmlStringOfElement);

  return fragment.firstElementChild;
}
