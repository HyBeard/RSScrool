export default function buildCheatsheetList(shortcuts) {
  const createToolShortcutElem = (key, toolName) => `
    <li class="shortcuts_list--item"">
      <div class="shortcuts_list--item_icon ${toolName} data-name="${toolName}"></div>
      <div class="shortcuts_list--item_info_wrap">
        <span class="shortcuts_list--item_key">${key}</span>
        <span class="shortcuts_list--item_description"> - ${toolName} tool</span>
      </div>
    </li>`;
  const shortcutsList = Object.entries(shortcuts).reduce(
    (htmlString, [key, tool]) => htmlString + createToolShortcutElem(key, tool),
    '',
  );

  return `
  <div class="dialog_box">
    <h3 class="dialog_box--title">Tool shortcuts</h3>
    <div class="dialog_box--close"></div>
    <ul class="dialog_box--content shortcuts_list">${shortcutsList}</ul>
  </div>`;
}
