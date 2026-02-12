(() => {
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const ampmEl = document.getElementById("ampm");
  const dateEl = document.getElementById("date");
  const formatToggle = document.getElementById("formatToggle");
  const modeToggle = document.getElementById("modeToggle");
  const timezoneSelect = document.getElementById("timezoneSelect");
  const themeToggleBtn = document.getElementById("themeToggle");
  const fullscreenToggleBtn = document.getElementById("fullscreenToggle");

  let is24Hour = JSON.parse(localStorage.getItem("clock-24h") || "false");
  let theme = localStorage.getItem("clock-theme") || "dark";
  let timezone = localStorage.getItem("clock-timezone") || "local";

  const dateFormatterCache = new Map();

  const toDateInZone = (zone) => {
    if (zone === "local") return new Date();
    // Create a Date that reflects the target timezone offset
    const now = new Date();
    const localeString = now.toLocaleString("en-US", { timeZone: zone });
    return new Date(localeString);
  };

  const pad = (value) => String(value).padStart(2, "0");

  const formatDate = (date, zone) => {
    const key = `${zone}-date`;
    if (!dateFormatterCache.has(key)) {
      dateFormatterCache.set(
        key,
        new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "short",
          day: "2-digit",
          year: "numeric",
          timeZone: zone === "local" ? undefined : zone,
        })
      );
    }
    return dateFormatterCache.get(key).format(date);
  };

  const applyTheme = (mode) => {
    document.body.classList.toggle("theme-light", mode === "light");
    document.body.classList.toggle("theme-dark", mode === "dark");
    modeToggle.checked = mode === "light";
  };

  const syncToggles = () => {
    formatToggle.checked = is24Hour;
    applyTheme(theme);
    timezoneSelect.value = timezone;
  };

  const computeTimeParts = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    let suffix = "";

    if (!is24Hour) {
      suffix = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    }

    return { hours, minutes, seconds, suffix };
  };

  const renderTime = () => {
    const now = toDateInZone(timezone);
    const { hours, minutes, seconds, suffix } = computeTimeParts(now);

    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
    ampmEl.textContent = suffix;
    ampmEl.style.visibility = is24Hour ? "hidden" : "visible";

    dateEl.textContent = formatDate(now, timezone);
  };

  const scheduleTick = () => {
    const now = Date.now();
    const msUntilNextSecond = 1000 - (now % 1000) + 2; // slight buffer to avoid drift
    setTimeout(() => {
      renderTime();
      scheduleTick();
    }, msUntilNextSecond);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const bindEvents = () => {
    formatToggle.addEventListener("change", (e) => {
      is24Hour = e.target.checked;
      localStorage.setItem("clock-24h", JSON.stringify(is24Hour));
      renderTime();
    });

    modeToggle.addEventListener("change", (e) => {
      theme = e.target.checked ? "light" : "dark";
      localStorage.setItem("clock-theme", theme);
      applyTheme(theme);
    });

    themeToggleBtn.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      localStorage.setItem("clock-theme", theme);
      applyTheme(theme);
    });

    timezoneSelect.addEventListener("change", (e) => {
      timezone = e.target.value;
      localStorage.setItem("clock-timezone", timezone);
      renderTime();
    });

    fullscreenToggleBtn.addEventListener("click", toggleFullscreen);

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "f") toggleFullscreen();
    });
  };

  const init = () => {
    syncToggles();
    renderTime();
    bindEvents();
    scheduleTick();
  };

  document.addEventListener("DOMContentLoaded", init);
})();

