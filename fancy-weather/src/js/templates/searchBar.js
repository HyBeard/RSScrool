export default function buildSearchBar() {
  const htmlStringOfElement = `
  <div class="search container">
    <form class="search--fake_input">
      <input class="search--query" required/>
      <div class="search--icon search--icon-microphone"></div>
      <button class="search--icon search--icon-loupe" type="submit"></button>
    </form>
  </div>
  `;

  const fragment = document.createRange().createContextualFragment(htmlStringOfElement);

  return fragment.firstElementChild;
}
