import { system } from '@minecraft/server';
// Keeps track of active text animations for each player
const activeTexts = new Map();
/**
 * Removes color codes from the given text.
 * @param text - The string from which color codes will be removed.
 * @returns The text without color codes.
 */
function stripColorCodes(text) {
    return text.replace(/§[0-9a-fklmnor]/gi, '');
}
/**
 * Stops any ongoing animations for a player.
 * @param target - The player whose animation should be stopped.
 */
function stopAnimation(target) {
    const existingIntervalId = activeTexts.get(target);
    if (existingIntervalId !== undefined) {
        system.clearRun(existingIntervalId);
        activeTexts.delete(target);
    }
}
/**
 * Displays animated text dynamically to a target player.
 * Supports Action Bar, Title, and Subtitle animations.
 * @param target - The player to whom the text will be displayed.
 * @param text - The main text to display.
 * @param subtitle - The subtitle text to display (optional, runs after title finishes).
 * @param speed - The update interval in ticks.
 * @param mode - The display mode ('actionbar', 'title').
 * @param waitTime - The delay before starting the subtitle animation (default: 20 ticks).
 */
export function animateText(target, text, subtitle, speed, mode, waitTime = 20) {
    stopAnimation(target);
    const strippedText = stripColorCodes(text);
    target.setDynamicProperty('letterProcess', 0);
    const intervalId = system.runInterval(() => {
        let letterProcess = target.getDynamicProperty('letterProcess') || 0;
        if (letterProcess <= strippedText.length) {
            target.setDynamicProperty('letterProcess', letterProcess + 1);
            target.playSound('random.click', { pitch: 1.5, volume: 1.0 });
            const displayedText = applyCharacterProgression(text, letterProcess);
            if (mode === 'actionbar') {
                target.onScreenDisplay.setActionBar(displayedText);
            }
            else if (mode === 'title') {
                target.onScreenDisplay.setTitle(displayedText);
            }
        }
        if (letterProcess === strippedText.length) {
            system.clearRun(intervalId);
            activeTexts.delete(target);
            if (mode === 'title' && subtitle) {
                system.runTimeout(() => animateSubtitle(target, text, subtitle, speed), waitTime);
            }
        }
    }, speed);
    activeTexts.set(target, intervalId);
}
/**
 * Displays the subtitle dynamically after the title has finished while keeping the full title visible.
 * @param target - The player to whom the text will be displayed.
 * @param title - The fully typed-out title.
 * @param subtitle - The subtitle text to display.
 * @param speed - The update interval in ticks.
 */
function animateSubtitle(target, title, subtitle, speed) {
    stopAnimation(target);
    target.setDynamicProperty('letterProcess', 0);
    const subtitleIntervalId = system.runInterval(() => {
        let letterProcess = target.getDynamicProperty('letterProcess') || 0;
        if (letterProcess <= subtitle.length) {
            target.setDynamicProperty('letterProcess', letterProcess + 1);
            target.playSound('random.click', { pitch: 1.5, volume: 1.0 });
            target.onScreenDisplay.setTitle(title);
            target.onScreenDisplay.updateSubtitle(subtitle.substring(0, letterProcess));
        }
        if (letterProcess === subtitle.length) {
            system.clearRun(subtitleIntervalId);
            activeTexts.delete(target);
        }
    }, speed);
    activeTexts.set(target, subtitleIntervalId);
}
/**
 * Applies progressive character display while maintaining color codes.
 * @param text - The full text string.
 * @param letterCount - The number of visible letters.
 * @returns The progressively displayed text with proper color codes.
 */
function applyCharacterProgression(text, letterCount) {
    let displayText = '';
    let visibleCharacters = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '§' && i + 1 < text.length) {
            displayText += text[i] + text[i + 1];
            i++;
        }
        else {
            if (visibleCharacters < letterCount) {
                displayText += text[i];
                visibleCharacters++;
            }
            else {
                break;
            }
        }
    }
    return displayText;
}
