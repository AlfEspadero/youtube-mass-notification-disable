// ==UserScript==
// @name        YouTube Disable All Notifications
// @namespace   https://github.com/AlfEspadero
// @version     1.1
// @description Adds a button to disable notifications for all subscribed channels
// @match       https://www.youtube.com/feed/channels
// @grant       GM_addStyle
// @run-at      document-idle
// ==/UserScript==

(function () {
	"use strict";

	const ACTION_DELAY = 100;
	const SCROLL_DELAY = 2000;

	let cancelled = false;
	let running = false;

	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	GM_addStyle(`
		#yt-disable-notifs-btn {
			position: fixed;
			top: 60px;
			right: 20px;
			z-index: 9999;
			padding: 10px 20px;
			border: none;
			border-radius: 8px;
			background: #c00;
			color: #fff;
			font-size: 14px;
			font-weight: 600;
			cursor: pointer;
			font-family: "YouTube Sans", "Roboto", sans-serif;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
			transition: background 0.2s, opacity 0.2s;
		}
		#yt-disable-notifs-btn:hover {
			background: #900;
		}
		#yt-disable-notifs-btn:disabled {
			background: #666;
			cursor: not-allowed;
		}
		#yt-disable-notifs-progress {
			position: fixed;
			top: 105px;
			right: 20px;
			z-index: 9999;
			padding: 6px 14px;
			border-radius: 6px;
			background: rgba(0, 0, 0, 0.8);
			color: #fff;
			font-size: 12px;
			font-family: "YouTube Sans", "Roboto", sans-serif;
			display: none;
		}
	`);

	// create UI elements
	const btn = document.createElement("button");
	btn.id = "yt-disable-notifs-btn";
	btn.textContent = "Disable All Notifications";
	document.body.appendChild(btn);

	const progress = document.createElement("div");
	progress.id = "yt-disable-notifs-progress";
	document.body.appendChild(progress);

	const updateProgress = (text) => {
		progress.style.display = "block";
		progress.textContent = text;
	};

	// disable notifications for a single channel
	const disableNotifications = async (channel) => {
		const channelName =
			channel.querySelector("#channel-title")?.innerText ?? "Unknown";

		const subRenderer = channel.querySelector("ytd-subscribe-button-renderer");
		if (!subRenderer) {
			console.warn(`No subscribe renderer found for: ${channelName}`);
			return;
		}

		const buttons = Array.from(subRenderer.querySelectorAll("button"));

		const targetButton =
			buttons.find(
				(b) =>
					b.getAttribute("aria-label")?.toLowerCase().includes("notif") ||
					b.getAttribute("aria-label")?.toLowerCase().includes("bell") ||
					b.getAttribute("aria-label")?.toLowerCase().includes("personali") ||
					b.getAttribute("aria-label")?.toLowerCase().includes("all"),
			) || (buttons.length >= 2 ? buttons[1] : null);

		if (!targetButton) {
			console.warn(`No notification button for: ${channelName}`);
			return;
		}

		targetButton.click();
		await wait(ACTION_DELAY);

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
	};

	// main process — scroll, discover, and process all channels
	const disableAllNotifications = async () => {
		cancelled = false;
		running = true;
		btn.textContent = "Stop";
		btn.style.background = "#e65100";
		let totalProcessed = 0;

		try {
			while (!cancelled) {
				const channels = Array.from(
					document.querySelectorAll("ytd-channel-renderer"),
				);
				const unprocessed = channels.filter((ch) => !ch.dataset.notifProcessed);

				if (unprocessed.length === 0) {
					window.scrollTo(0, document.documentElement.scrollHeight);
					await wait(SCROLL_DELAY);

					const newChannels = Array.from(
						document.querySelectorAll("ytd-channel-renderer"),
					).filter((ch) => !ch.dataset.notifProcessed);

					if (newChannels.length === 0) break;
					continue;
				}

				for (const channel of unprocessed) {
					if (cancelled) break;
					await disableNotifications(channel);
					channel.dataset.notifProcessed = "true";
					totalProcessed++;
					updateProgress(`Processed ${totalProcessed} channels...`);
				}

				if (cancelled) break;
				window.scrollTo(0, document.documentElement.scrollHeight);
				await wait(SCROLL_DELAY);
			}

			if (cancelled) {
				updateProgress(`Stopped. ${totalProcessed} channels processed.`);
				console.log(`Process stopped by user. Total: ${totalProcessed}`);
			} else {
				updateProgress(`Done! ${totalProcessed} channels processed.`);
				console.log(
					`Notification disable process completed. Total: ${totalProcessed}`,
				);
			}
		} catch (error) {
			console.error("Error during notification disable:", error);
			updateProgress(`Error after ${totalProcessed} channels.`);
		} finally {
			running = false;
			btn.textContent = "Disable All Notifications";
			btn.style.background = "";
		}
	};

	btn.addEventListener("click", () => {
		if (running) {
			cancelled = true;
			btn.textContent = "Stopping...";
			btn.disabled = true;
			return;
		}
		if (
			confirm(
				"Disable notifications for ALL subscribed channels?\n\nThis may take a while if you have many subscriptions.",
			)
		) {
			disableAllNotifications();
		}
	});
})();
