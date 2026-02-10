# YouTube Mass Notification Disabler

A JS script developed to automate the process of mass disabling notifications from all YouTube channels associated with a user's account. The script operates directly within the browser, requiring no additional installations or extensions.

## Features

- Automates mass disabling notifications from YouTube channels
- Compatible with all major browsers
- Functions across all YouTube language interfaces
- Simple execution through the browser's Developer Console

## Usage Instructions

### First Method: Userscript (e.g., Violentmonkey)

1. Install a userscript manager extension such as [Violentmonkey](https://violentmonkey.github.io/) for your browser.
2. Install the script, you can do this at [Greasy Fork](https://greasyfork.org/en/scripts/565837-youtube-disable-all-notifications) or by copying the contents of [`youtube-mass-notification-disabler.js`](./youtube-mass-notification-disabler.js) and creating a new userscript in your userscript manager.
3. Once the script is installed, navigate to the [YouTube Subscriptions page](https://www.youtube.com/feed/channels) and the script will create a button for you to begin and stop the mass notification disabling process.

### Second Method: Using the Browser's Developer Console

1. Navigate to the [YouTube Subscriptions page](https://www.youtube.com/feed/channels).
2. Access the browser's Developer Tools:
   - Right-click on the page and select **Inspect**, or
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac).
3. Click on the **Console** tab within the Developer Tools panel.
4. Paste the contents of [`youtube-mass-notification-disabler.js`](./youtube-mass-notification-disabler.js) into the console.
5. Press `Enter` to execute the script.
