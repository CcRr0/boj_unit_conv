if(document.readyState !== "loading") {
    void main();
} else {
    document.addEventListener("DOMContentLoaded", main);
}

async function main() {
    const settings = await chrome.storage.local.get(["memoryUnit", "timeUnit"]);
    let memoryUnit = settings.memoryUnit ?? 0;
    let timeUnit = settings.timeUnit ?? 0;

    const topSubmitIdx = Number(document.querySelector(".table-responsive tbody tr td").textContent);

    document.querySelectorAll(".ms-text").forEach((el) => {
        el.remove();
    });

    const timeUnitEl = document.createElement("span");
    timeUnitEl.className = "time-unit";
    timeUnitEl.style.color = "#E74C3C";

    const memoryTh = document.querySelector(".table-responsive th:nth-of-type(5)");
    const timeTh = document.querySelector(".table-responsive th:nth-of-type(6)");

    const memoryTds = document.querySelectorAll(".table-responsive td:nth-of-type(5)");
    const timeTds = document.querySelectorAll(".table-responsive td:nth-of-type(6)");

    let memoryVals = Array.from(memoryTds).map((td) => td.firstChild ? Number(td.firstChild.textContent) : null);
    let timeVals = Array.from(timeTds).map((td) => td.firstChild ? Number(td.firstChild.textContent) : null);

    timeTds.forEach((td) => {
        if(!td.firstChild) return;
        td.appendChild(timeUnitEl.cloneNode(true));
    });
    displayMemory();
    displayTime();

    document.querySelectorAll(".result-wait, .result-compile, .result-judging").forEach((el) => {
        const memoryTd = el.parentElement.parentElement.querySelector(".memory");
        const timeTd = el.parentElement.parentElement.querySelector(".time");
        (new MutationObserver((mutationsList, observer) => {
            for(const mutation of mutationsList) {
                if(mutation.type === "childList") {
                    const submitIdx = Number(mutation.target.parentElement.querySelector("td").textContent);
                    const memoryVal = Number(mutation.target.firstChild.textContent);
                    memoryVals[topSubmitIdx - submitIdx] = memoryVal;
                    if(memoryUnit) {
                        mutation.target.querySelector(".kb-text").className = "mb-text";
                        mutation.target.firstChild.textContent = (memoryVal / 1024).toFixed(memoryUnit);
                    }
                    observer.disconnect();
                }
            }
        })).observe(memoryTd, { childList: true, subtree: false });
        (new MutationObserver((mutationsList, observer) => {
            for(const mutation of mutationsList) {
                if(mutation.type === "childList") {
                    mutation.target.querySelector(".ms-text").remove();
                    const submitIdx = Number(mutation.target.parentElement.querySelector("td").textContent);
                    const timeVal = Number(mutation.target.firstChild.textContent);
                    timeVals[topSubmitIdx - submitIdx] = timeVal;
                    let timeUnitElCopy = timeUnitEl.cloneNode(true);
                    if(timeUnit) {
                        mutation.target.firstChild.textContent = (timeVal / 1000).toFixed(timeUnit);
                        timeUnitElCopy.textContent = " s";
                    } else {
                        timeUnitElCopy.textContent = " ms";
                    }
                    mutation.target.appendChild(timeUnitElCopy);
                    observer.disconnect();
                }
            }
        })).observe(timeTd, { childList: true, subtree: false });
    });

    const memoryUnitSetter = document.createElement("a");
    memoryUnitSetter.className = "memoryUnitSetter";
    memoryUnitSetter.style.cursor = "pointer";
    memoryUnitSetter.textContent = ` ${memoryUnit ? `MB .${memoryUnit}` : "KB"}`;
    memoryUnitSetter.addEventListener("mousedown", (e) => e.preventDefault());
    memoryUnitSetter.addEventListener("click", () => {
        memoryUnit = (memoryUnit + 1) % 4;
        void chrome.storage.local.set({ "memoryUnit": memoryUnit });
        memoryUnitSetter.textContent = ` ${memoryUnit ? `MB .${memoryUnit}` : "KB"}`;
        displayMemory();
    });

    const timeUnitSetter = document.createElement("a");
    timeUnitSetter.className = "timeUnitSetter";
    timeUnitSetter.style.cursor = "pointer";
    timeUnitSetter.textContent = ` ${timeUnit ? `s .${timeUnit}` : "ms"}`;
    timeUnitSetter.addEventListener("mousedown", (e) => e.preventDefault());
    timeUnitSetter.addEventListener("click", () => {
        timeUnit = (timeUnit + 1) % 4;
        void chrome.storage.local.set({ "timeUnit": timeUnit });
        timeUnitSetter.textContent = ` ${timeUnit ? `s .${timeUnit}` : "ms"}`;
        displayTime();
    });

    memoryTh.appendChild(memoryUnitSetter);
    timeTh.appendChild(timeUnitSetter);

    function displayMemory() {
        if(!memoryUnit) {
            document.querySelectorAll(".mb-text").forEach((el) => {
                el.className = "kb-text";
            });
            memoryTds.forEach((td, i) => {
                if(!td.firstChild) return;
                td.firstChild.textContent = memoryVals[i];
            });
        } else {
            document.querySelectorAll(".kb-text").forEach((el) => {
                el.className = "mb-text";
            });
            memoryTds.forEach((td, i) => {
                if(!td.firstChild) return;
                td.firstChild.textContent = (memoryVals[i] / 1024).toFixed(memoryUnit);
            });
        }
    }

    function displayTime() {
        if(!timeUnit) {
            document.querySelectorAll(".time-unit").forEach((el) => {
                el.textContent = " ms";
            });
            timeTds.forEach((td, i) => {
                if(!td.firstChild) return;
                td.firstChild.textContent = timeVals[i];
            });
        } else {
            document.querySelectorAll(".time-unit").forEach((el) => {
                el.textContent = " s";
            });
            timeTds.forEach((td, i) => {
                if(!td.firstChild) return;
                td.firstChild.textContent = (timeVals[i] / 1000).toFixed(timeUnit);
            });
        }
    }
}
