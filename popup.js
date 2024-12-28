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

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("hotkeyContainer");

  // Создаем строки для каждой горячей клавиши
  Object.entries(HOTKEY_LABELS).forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "hotkey-row";

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

    row.appendChild(labelSpan);
    row.appendChild(input);
    row.appendChild(resetButton);

    container.appendChild(row);
  });

  // Функция сброса одной настройки
  function resetSingle(key) {
    const input = document.getElementById(key);
    if (input && DEFAULT_HOTKEYS[key]) {
      input.value = DEFAULT_HOTKEYS[key];
      showNotification("Настройка сброшена");
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
    showNotification("Все настройки сброшены");
  }

  // Функция показа уведомления с разным текстом
  function showNotification(text = "Настройки сохранены") {
    const notification = document.getElementById("notification");
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
      let key = e.key;
      if (key === " ") key = "Space";
      input.value = key;
    });
  });

  // Сохранение настроек
  document.getElementById("saveBtn").addEventListener("click", () => {
    const hotkeys = {};
    Object.keys(HOTKEY_LABELS).forEach((key) => {
      const input = document.getElementById(key);
      hotkeys[key] = input.value;
    });

    browser.storage.local.set({ hotkeys }).then(() => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          type: "UPDATE_HOTKEYS",
          hotkeys,
        });
        showNotification();
      });
    });
  });

  // Сброс всех настроек
  document.getElementById("resetAllBtn").addEventListener("click", resetAll);
});
