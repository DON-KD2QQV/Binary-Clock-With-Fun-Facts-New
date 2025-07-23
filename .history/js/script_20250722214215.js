// Author: Don Bryant
const hourColumn = document.getElementById('hours');
const minuteColumn = document.getElementById('minutes');
const secondColumn = document.getElementById('seconds');
const digitalClock = document.getElementById('digital-clock');
const geminiButton = document.getElementById('gemini-button');
const factContainer = document.getElementById('fact-container');

const BITS = 6;
let currentTime = { h: 0, m: 0 };

function createLights(columnElement) {
    for (let i = 0; i < BITS; i++) {
        const light = document.createElement('div');
        light.classList.add(
            'light', 'w-8', 'h-8', 'md:w-12', 'md:h-12',
            'rounded-full', 'bg-gray-700'
        );
        light.dataset.value = Math.pow(2, i);
        columnElement.appendChild(light);
    }
}

function updateColumn(columnElement, onClass, number) {
    const binaryString = number.toString(2).padStart(BITS, '0');
    const lights = columnElement.children;
    for (let i = 0; i < BITS; i++) {
        const light = lights[i];
        const bit = binaryString[BITS - 1 - i];
        light.classList.toggle(onClass, bit === '1');
    }
}

function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    currentTime = { h, m };

    updateColumn(hourColumn, 'hour-on', h);
    updateColumn(minuteColumn, 'minute-on', m);
    updateColumn(secondColumn, 'second-on', s);

    digitalClock.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Fallback fact generator
function getLocalTimeFact(h, m) {
    const facts = [
        `Did you know? ${h}:00 is a great time to stretch!`,
        `At ${h}:${m}, the sun is in a different position around the world.`,
        `Binary for ${h} is ${h.toString(2)}, and for ${m} is ${m.toString(2)}.`,
        `Fun fact: ${h}:${m} in 24-hour time is ${((h % 12) || 12)}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}.`,
        `Some clocks chime at ${h}:${m}!`,
        `In binary, ${h}:${m} is ${h.toString(2).padStart(6, '0')}:${m.toString(2).padStart(6, '0')}.`
    ];
    return facts[m % facts.length];
}

async function getTimeFact() {
    geminiButton.disabled = true;
    geminiButton.textContent = 'Thinking...';
    factContainer.innerHTML = '<div class="animate-pulse">Fetching a fact from the cosmos...</div>';

    const { h, m } = currentTime;
    const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const prompt = `Tell me a short, interesting, or historical fact related to the time ${timeString}.`;

    try {
        const response = await fetch('timefact.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        factContainer.textContent = data.fact || getLocalTimeFact(h, m);
    } catch (error) {
        console.error(error);
        factContainer.textContent = getLocalTimeFact(h, m);
    } finally {
        geminiButton.disabled = false;
        geminiButton.textContent = 'Get Time Fact ✨';
    }
}

createLights(hourColumn);
createLights(minuteColumn);
createLights(secondColumn);
updateClock();
setInterval(updateClock, 1000);
geminiButton.addEventListener('click', getTimeFact);