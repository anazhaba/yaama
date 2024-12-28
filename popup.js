const DEFAULT_HOTKEYS = {
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

const HOTKEY_LABELS = {
  playPause: "Воспроизведение/Пауза",
  mute: "Отключить/включить звук",
  forward: "Промотать вперед",
  backward: "Промотать назад",
  volumeUp: "Увеличить громкость",
  volumeDown: "Уменьшить громкость",
  like: "Лайк",
  dislike: "Дизлайк",
  repeat: "Режим повтора",
  shuffle: "Случайный порядок",
  nextTrack: "Следующий трек",
  prevTrack: "Предыдущий трек",
  fullscreen: "Полноэкранный режим",
};

const CYRILLIC_TO_LATIN = {
  Ц: "W",
  А: "F",
  В: "D",
  С: "S",
  Е: "T",
  Н: "Y",
  К: "R",
  М: "V",
  О: "J",
  Р: "P",
  Т: "N",
  У: "G",
  Х: "H",
  Й: "Q",
  Ы: "I",
  Ф: "A",
  П: "Z",
  Л: "K",
  Д: "L",
  З: "X",
  Ш: "C",
  Щ: "B",
  Ч: "M",
  Ь: "E",
  Б: "U",
  Ю: "O",
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("hotkeyContainer");

  // Создаем строки для каждой горячей клавиши
  Object.entries(HOTKEY_LABELS).forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "hotkey-row";

    const rowContent = document.createElement("div");
    rowContent.className = "hotkey-row-content";

    const labelSpan = document.createElement("span");
    labelSpan.textContent = `${label}:`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = key;
    input.maxLength = "10";

    const resetButton = document.createElement("button");
    resetButton.className = "reset-button";
    resetButton.textContent = "Сбросить";
    resetButton.addEventListener("click", () => resetSingle(key));

    rowContent.appendChild(labelSpan);
    rowContent.appendChild(input);

    row.appendChild(rowContent);
    row.appendChild(resetButton);

    container.appendChild(row);
  });

  // Функция сброса одной настройки
  function resetSingle(key) {
    const input = document.getElementById(key);
    if (input && DEFAULT_HOTKEYS[key]) {
      input.value = DEFAULT_HOTKEYS[key];
      showNotification("Настройка сброшена", "notification-error");
    }
  }

  // Функция сброса всех настроек
  function resetAll() {
    Object.entries(DEFAULT_HOTKEYS).forEach(([key, value]) => {
      const input = document.getElementById(key);
      if (input) {
        input.value = value;
      }
    });
    showNotification("Все настройки сброшены", "notification-error");
  }

  // Функция показа уведомления с разным текстом
  function showNotification(text, type = "notification-success") {
    const notification = document.getElementById(type);
    notification.textContent = text;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 2000);
  }

  // Загрузка сохраненных настроек
  browser.storage.local.get(["hotkeys"]).then((result) => {
    const hotkeys = result.hotkeys || DEFAULT_HOTKEYS;
    Object.entries(hotkeys).forEach(([key, value]) => {
      const input = document.getElementById(key);
      if (input) {
        input.value = value;
      }
    });
  });

  // Обработка специальных клавиш
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      e.preventDefault();
      let key = e.key.toUpperCase();
      if (key === " ") key = "Space";

      // Преобразование кириллических символов в латинские
      if (CYRILLIC_TO_LATIN[key]) {
        key = CYRILLIC_TO_LATIN[key];
      }

      // Проверка на дублирование горячих клавиш
      const isDuplicate = Object.keys(HOTKEY_LABELS).some(
        (hotkey) => document.getElementById(hotkey).value.toUpperCase() === key
      );

      if (isDuplicate) {
        showNotification(
          "Такая кнопка уже назначена",
          "notification-duplicate"
        );
      } else {
        input.value = key;
      }
    });
  });

  // Сохранение настроек
  document.getElementById("saveBtn").addEventListener("click", () => {
    const hotkeys = {};
    Object.keys(HOTKEY_LABELS).forEach((key) => {
      const input = document.getElementById(key);
      hotkeys[key] = input.value.toUpperCase();
    });

    browser.storage.local.set({ hotkeys }).then(() => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          type: "UPDATE_HOTKEYS",
          hotkeys,
        });
        showNotification("Настройки сохранены", "notification-success");
      });
    });
  });

  // Сброс всех настроек
  document.getElementById("resetAllBtn").addEventListener("click", resetAll);
});
