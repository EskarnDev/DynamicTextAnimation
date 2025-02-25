# Title Usage:
```js
animateText(player, "§cYou died", "§7Back to spawn goofball", 2, "title", 20);
```
- The title will type out first.
- After 20 ticks, the full title remains while the subtitle types out.
- If using "actionbar" mode, subtitles are ignored, and only the actionbar message is displayed.

# ActionBar Usage:
```js
animateText(player, "§aWelcome Player to the Server", null, 2, "actionbar");
```
- Displays an animated actionbar message.
- Subtitles are ignored when using this mode.

# Features:
- Supports titles, subtitles, and actionbars.
- Letter-by-letter animation with a click sound effect.
- Subtitles only start after the title is fully displayed.
- Resets properly when triggered again.
