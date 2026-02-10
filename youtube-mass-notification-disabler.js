(async function () {
  const ACTION_DELAY = 100;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // function to turn off notifications for a single channel
  const disableNotifications = async (channel) => {
    try {
      const channelName =
        channel.querySelector("#channel-title")?.innerText ?? "Unknown";

      // find all buttons inside the subscribe button renderer
      const subRenderer = channel.querySelector(
        "ytd-subscribe-button-renderer",
      );
      if (!subRenderer) {
        console.warn(`No subscribe renderer found for: ${channelName}`);
        return;
      }

      // get all buttons — the dropdown/bell trigger is usually the
      // second button or has an aria-label about notifications
      const buttons = Array.from(subRenderer.querySelectorAll("button"));

      // try to find a notification-specific button first (bell icon / dropdown arrow)
      let targetButton =
        buttons.find(
          (btn) =>
            btn.getAttribute("aria-label")?.toLowerCase().includes("notif") ||
            btn.getAttribute("aria-label")?.toLowerCase().includes("bell") ||
            btn
              .getAttribute("aria-label")
              ?.toLowerCase()
              .includes("personali") ||
            btn.getAttribute("aria-label")?.toLowerCase().includes("all"),
        ) ||
        // fallback: if there are 2 buttons, the second one is typically the dropdown
        (buttons.length >= 2 ? buttons[1] : null);

      if (!targetButton) {
        console.warn(`No notification button for: ${channelName}`);
        return;
      }

      targetButton.click();
      await wait(ACTION_DELAY);

      // look for the popup that just appeared — scope to popup containers
      const popupContainer = document.querySelector(
        "ytd-popup-container, tp-yt-iron-dropdown, ytd-menu-popup-renderer",
      );
      const popupItems = popupContainer
        ? popupContainer.querySelectorAll(
            "ytd-menu-service-item-renderer, tp-yt-paper-item, yt-list-item-view-model",
          )
        : [];

      const noneOption = Array.from(popupItems).find((item) =>
        item.innerText.trim().toLowerCase().includes("none"),
      );

      if (noneOption) {
        noneOption.click();
        await wait(ACTION_DELAY);
        console.log(`Notifications turned off for: ${channelName}`);
      } else {
        // dismiss any open popup
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            bubbles: true,
            composed: true,
          }),
        );
        await wait(ACTION_DELAY / 2);
        console.warn(`Could not find "None" for: ${channelName}`);
      }
    } catch (error) {
      console.error("Error disabling notifications:", error);
    }
  };

  // main function — scrolls to load all channels, then processes in batches
  const disableAllNotifications = async () => {
    let totalProcessed = 0;

    while (true) {
      const channels = Array.from(
        document.querySelectorAll("ytd-channel-renderer"),
      );
      const unprocessed = channels.filter((ch) => !ch.dataset.notifProcessed);

      if (unprocessed.length === 0) {
        // scroll down to trigger lazy loading
        window.scrollTo(0, document.documentElement.scrollHeight);
        await wait(2000);

        // check if new channels appeared
        const newChannels = Array.from(
          document.querySelectorAll("ytd-channel-renderer"),
        ).filter((ch) => !ch.dataset.notifProcessed);

        if (newChannels.length === 0) {
          // no more channels loaded — we're done
          break;
        }
        continue;
      }

      console.log(
        `Processing batch of ${unprocessed.length} channels (${totalProcessed} done so far)...`,
      );

      for (const channel of unprocessed) {
        await disableNotifications(channel);
        channel.dataset.notifProcessed = "true";
        totalProcessed++;
      }

      // scroll down to load more
      window.scrollTo(0, document.documentElement.scrollHeight);
      await wait(2000);
    }

    console.log(
      `Notification disable process completed. Total: ${totalProcessed} channels.`,
    );
  };

  disableAllNotifications();
})();
