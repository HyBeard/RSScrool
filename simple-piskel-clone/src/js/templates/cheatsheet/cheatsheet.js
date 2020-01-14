export default function buildCheatsheetList(shortcuts) {
  const createToolShortcutElem = (key, toolName) => `
    <li class="shortcuts_list--item" data-name="${toolName}">
      <div class="shortcuts_list--item_name ${toolName}"></div>
      <span class="shortcuts_list--item_key">${key}</span>
      <span class="shortcuts_list--item_description">${toolName} tool</span>
    </li>`;

  const shortcutsList = Object.entries(shortcuts).reduce(
    (htmlString, [key, tool]) => htmlString + createToolShortcutElem(key, tool),
    '',
  );

  return `<div class="cheatsheet_box dialog_content">
      <div class="cheatsheet_section">
        <h3 class="cheatsheet_section--title">Tool shortcuts</h3>
        <ul class="cheatsheet_section--shortcuts_list shortcuts_list">
          ${shortcutsList}
        </ul>
      </div>
    </div>`;
}
