import EventEmitter from '../../helpers/EventEmitter';
import templates from '../../templates/templates';
import keyboardShortcuts from '../Canvas/tools/shortcuts/shortcuts';

export default class UserInterface extends EventEmitter {
  constructor(savedState) {
    super();
    this.controls = document.querySelector('.controls');
    this.dialogBox = document.querySelector('.dialog_box_wrap');
    this.dialogContent = null;
    this.sizeSelector = document.querySelector('.controls--size_selector');
    this.imageQueryInput = document.querySelector('.controls--img_keyword_input');
    this.canvasToolbar = document.querySelector('.canvas_toolbar');
    this.paletteBar = document.querySelector('.palette_bar');
    this.primColorElem = document.querySelector('.primary_color');
    this.secColorElem = document.querySelector('.secondary_color');
    this.sizeSelector = document.querySelector('.controls--size_selector');
    this.sizeInfoContainer = document.querySelector('.canvas_info--size');
    this.coordsContainer = document.querySelector('.canvas_info--target_coords');

    this.keyboardShortcuts = savedState.keyboardShortcuts || keyboardShortcuts;
  }

  static selectTool(tool) {
    const activeClass = 'tools_list--tool_button-active';

    document.querySelector(`.${activeClass}`).classList.remove(activeClass);
    document.querySelector(`li[data-name=${tool}]`).classList.add(activeClass);
  }

  static selectPenSize(size) {
    const activeClass = 'pen_sizes_list--size-active';

    document.querySelector(`.${activeClass}`).classList.remove(activeClass);
    document.querySelector(`[data-pen-size='${size}']`).classList.add(activeClass);
  }

  selectToolByPressedKey({ code }) {
    if (document.querySelector('input:focus-within') || this.dialogContent) {
      return;
    }

    if (code in this.keyboardShortcuts) {
      const toolName = this.keyboardShortcuts[code];

      UserInterface.selectTool(toolName);
      this.emit('changeTool', toolName);
    }
  }

  renderLastColors(primColor, secColor) {
    function setBgIfNotTransparent(color) {
      return color === null ? '' : color;
    }

    this.primColorElem.style.background = setBgIfNotTransparent(primColor);
    this.secColorElem.style.background = setBgIfNotTransparent(secColor);
  }

  swapColors(primBg, secBg) {
    this.primColorElem.style.background = secBg || '';
    this.secColorElem.style.background = primBg || '';
  }

  renderCanvasSizeInfo(side) {
    this.sizeInfoContainer.innerText = `[${side}x${side}]`;
  }

  updateDisplayedValues(sideLength) {
    [...this.sizeSelector.options].forEach((option, index) => {
      if (Number(option.value) === sideLength) {
        this.sizeSelector.selectedIndex = index;
      }
    });

    this.renderCanvasSizeInfo(sideLength);
  }

  clearCoordsContainer() {
    this.coordsContainer.innerText = '';
  }

  updateCoordsContainer(row, col) {
    this.coordsContainer.innerText = `${row}:${col}`;
  }

  toggleShowingKeyboardShortcuts(ev) {
    this.dialogBox.classList.toggle('dialog_box_wrap--showed');

    if (!this.dialogContent) {
      const cheatsheet = templates.buildCheatsheetList(this.keyboardShortcuts);

      this.dialogBox.insertAdjacentHTML('afterbegin', cheatsheet);
      this.dialogContent = this.dialogBox.firstElementChild;
      ev.stopImmediatePropagation();

      return;
    }

    this.dialogContent.remove();
    this.dialogContent = null;
  }

  closeDialogBoxIfClickNotInIt(ev) {
    if (
      (this.dialogContent && !ev.target.closest('.dialog_box'))
      || ev.target.closest('.dialog_box--close')
    ) {
      this.toggleShowingKeyboardShortcuts(ev);
    }
  }

  waitForNewHotkey(pressedToolButton) {
    const keyElement = pressedToolButton.nextElementSibling.firstElementChild;
    const prevKey = keyElement.innerText;

    keyElement.classList.add('shortcuts_list--item_key-blinking');

    document.addEventListener(
      'keydown',
      ({ code }) => {
        this.changeKeyboardShortcuts({ code, prevKey });
        keyElement.innerText = code;
        keyElement.classList.remove('shortcuts_list--item_key-blinking');
      },
      {
        once: true,
      },
    );
  }

  changeKeyboardShortcuts({ code, prevKey }) {
    const toolName = this.keyboardShortcuts[prevKey];

    delete this.keyboardShortcuts[prevKey];
    this.keyboardShortcuts[code] = toolName;
  }

  addToolbarListeners() {
    this.canvasToolbar.addEventListener('click', ({ target }) => {
      if (
        target.classList.contains('tools_list--tool_button')
        && !target.classList.contains('tools_list--tool_button-disabled')
      ) {
        const toolName = target.dataset.name;

        UserInterface.selectTool(toolName);
        this.emit('changeTool', toolName);

        return;
      }

      if (target.classList.contains('pen_sizes_list--size')) {
        const { penSize } = target.dataset;

        UserInterface.selectPenSize(penSize);
        this.emit('changePenSize', Number(penSize));
      }
    });
  }

  addSettingsListeners() {
    this.controls.addEventListener('click', (ev) => {
      const {
        target: { classList },
      } = ev;

      if (classList.contains('controls--save_state')) {
        this.emit('saveAppState');
        return;
      }

      if (classList.contains('controls--delete_state')) {
        this.emit('deleteAppState');
        return;
      }

      if (classList.contains('controls--download_as_gif')) {
        this.emit('downloadAsGif');
        return;
      }

      if (classList.contains('controls--download_as_apng')) {
        this.emit('downloadAsApng');
        return;
      }

      if (classList.contains('controls--paste_img_btn')) {
        const query = this.imageQueryInput.value;

        this.emit('pasteImg', query); // TODO:

        return;
      }

      if (classList.contains('controls--grayscaling')) {
        this.emit('grayscaleCanvas'); // TODO:
      }

      if (classList.contains('controls--keyboard_shortcuts')) {
        this.toggleShowingKeyboardShortcuts(ev);
      }
    });

    this.sizeSelector.addEventListener('change', ({ target: { value } }) => {
      this.renderCanvasSizeInfo(value);
      this.emit('changeCanvasSize', Number(value));
    });
  }

  addPaletteListeners() {
    this.paletteBar.addEventListener(
      'mousedown',
      ({ target: { classList, style }, button: mouseBtnCode }) => {
        const primBg = this.primColorElem.style.background;
        const secBg = this.secColorElem.style.background;

        if (classList.contains('palette--color')) {
          const color = style.backgroundColor;

          if (mouseBtnCode) {
            this.renderLastColors(primBg, color);
          } else this.renderLastColors(color, secBg);

          this.emit('pickNewColor', mouseBtnCode, color);

          return;
        }

        if (classList.contains('last_colors--swap_colors')) {
          this.swapColors(primBg, secBg);
          this.emit('swapColors');
        }
      },
    );

    this.paletteBar.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });
  }

  addShortcutsListeners() {
    document.addEventListener('keydown', this.selectToolByPressedKey.bind(this));
  }

  addDialogBoxListeners() {
    document.addEventListener('mousedown', this.closeDialogBoxIfClickNotInIt.bind(this));

    this.dialogBox.addEventListener('click', ({ target }) => {
      if (target.closest('.shortcuts_list--item_icon')) this.waitForNewHotkey(target);
    });
  }

  addListeners() {
    this.addSettingsListeners();
    this.addToolbarListeners();
    this.addPaletteListeners();
    this.addShortcutsListeners();
    this.addDialogBoxListeners();

    const canvas = document.querySelector('.canvas_box--canvas');
    canvas.addEventListener('mouseleave', this.clearCoordsContainer.bind(this));
  }

  init({
    activeTool, primColor, secColor, fpsValue, sideCellCount, penSize,
  }) {
    this.addListeners();
    this.updateDisplayedValues(sideCellCount, fpsValue);
    UserInterface.selectTool(activeTool);
    UserInterface.selectPenSize(penSize);
    this.renderLastColors(primColor, secColor);
  }
}
