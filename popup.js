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
    // Создаем основной контейнер строки
    const row = document.createElement("div");
    row.className = "hotkey-row";

    // Создаем элемент для метки
    const labelSpan = document.createElement("span");
    labelSpan.textContent = `${label}:`;

    // Создаем input
    const input = document.createElement("input");
    input.type = "text";
    input.id = key;
    input.maxLength = "10";

    // Добавляем элементы в строку
    row.appendChild(labelSpan);
    row.appendChild(input);

    // Добавляем строку в контейнер
    container.appendChild(row);
  });

  // Загружаем сохраненные настройки
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

  function showNotification() {
    const notification = document.getElementById("notification");
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 2000);
  }

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
});
function showNotification() {
  const notification = document.getElementById("notification");
  notification.classList.add("show");

  // Скрываем уведомление через 2 секунды
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Изменяем обработчик кнопки сохранения:
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
      showNotification(); // Показываем уведомление после сохранения
    });
  });
});
