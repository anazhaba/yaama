let currentHotkeys = {
  playPause: "K",
  mute: "M",
  forward: "ArrowRight",
  backward: "ArrowLeft",
  volumeUp: "ArrowUp",
  volumeDown: "ArrowDown",
  like: "F",
  dislike: "D",
  repeat: "R",
  shuffle: "S",
  nextTrack: "N",
  prevTrack: "P",
  fullscreen: "W",
};

// Загрузка сохраненных настроек
browser.storage.local.get(["hotkeys"]).then((result) => {
  if (result.hotkeys) {
    currentHotkeys = result.hotkeys;
  }
});

// Слушатель сообщений от popup
browser.runtime.onMessage.addListener((message) => {
  if (message.type === "UPDATE_HOTKEYS") {
    currentHotkeys = message.hotkeys;
  }
});

// Мапинг наших клавиш к оригинальным
const ORIGINAL_KEYS = {
  playPause: "K",
  mute: "M",
  forward: "ArrowRight",
  backward: "ArrowLeft",
  volumeUp: "ArrowUp",
  volumeDown: "ArrowDown",
  like: "F",
  dislike: "D",
  repeat: "R",
  shuffle: "S",
  nextTrack: "N",
  prevTrack: "P",
  fullscreen: "W",
};

function simulateKeyPress(originalKey) {
  // Создаём события keydown и keyup
  const eventDown = new KeyboardEvent("keydown", {
    key: originalKey,
    code:
      originalKey.length === 1
        ? "Key" + originalKey.toUpperCase()
        : originalKey,
    keyCode: originalKey.charCodeAt(0),
    which: originalKey.charCodeAt(0),
    bubbles: true,
    cancelable: true,
  });

  const eventUp = new KeyboardEvent("keyup", {
    key: originalKey,
    code:
      originalKey.length === 1
        ? "Key" + originalKey.toUpperCase()
        : originalKey,
    keyCode: originalKey.charCodeAt(0),
    which: originalKey.charCodeAt(0),
    bubbles: true,
    cancelable: true,
  });

  // Отправляем события в document
  document.dispatchEvent(eventDown);
  document.dispatchEvent(eventUp);
}

// Обработчик нажатий клавиш
document.addEventListener("keydown", (e) => {
  // Проверяем, что не находимся в текстовом поле
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  const pressedKey = e.key;

  // Ищем, какому действию соответствует нажатая клавиша
  const action = Object.entries(currentHotkeys).find(
    ([, value]) => value === pressedKey
  )?.[0];

  if (!action) return;

  e.preventDefault(); // Предотвращаем стандартное действие браузера

  // Получаем оригинальную клавишу для этого действия
  const originalKey = ORIGINAL_KEYS[action];

  if (originalKey) {
    simulateKeyPress(originalKey);
  }
});

// Добавляем MutationObserver для повторной инициализации после перезагрузки плеера
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      // Если добавлены новые узлы, проверяем, не является ли один из них плеером
      const playerAdded = Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === 1 &&
          (node.classList?.contains("player") ||
            node.querySelector?.(".player"))
      );

      if (playerAdded) {
        // Переинициализируем обработчики если нужно
        console.log("Player reinitialized");
      }
    }
  }
});

// Начинаем наблюдение за изменениями в DOM
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
