document.addEventListener("DOMContentLoaded", () => {
    const WORDS_PER_PAGE = 400;
    const GAME_DURATION = 10 * 60; // 10 minut w sekundach
    let words = 0;
    let pages = 100;
    let autoClickerLevel = 0;
    let doubleWordsLevel = 0;
    let fasterClicksLevel = 0;
    let achievements = [];
    let timerStarted = false;
    let remainingTime = GAME_DURATION;

    const wordCounter = document.getElementById("word-counter");
    const pageCounter = document.getElementById("page-counter");
    const progressBar = document.getElementById("progress-bar");
    const clickButton = document.getElementById("click-button");
    const shopMenu = document.getElementById("shop-menu");
    const buyButton = document.getElementById("buy-button");
    const purchasedSkillsList = document.getElementById("purchased-skills-list");
    const achievementsList = document.getElementById("achievements-list");
    const timerElement = document.getElementById("timer");

    const upgradeSound = new Audio('assets/sounds/achievement.mp3');
    const buttonSound = new Audio('assets/sounds/button.mp3');
    const pageSound = new Audio('assets/sounds/page.mp3');
    const wordSound = new Audio('assets/sounds/word.mp3');

    const achievementList = [
        {
            id: "first-thesis",
            text: "Moja pierwsza praca dyplomowa",
            achieved: false,
            condition: () => pages >= 40,
            tooltip: "Napisz co najmniej 40 kartek, aby zdobyć to osiągnięcie."
        },
        {
            id: "scribe-master",
            text: "Skryba doskonały",
            achieved: false,
            condition: () => (words / (GAME_DURATION - remainingTime)) >= 100,
            tooltip: "Pisanie z prędkością co najmniej 100 słów na minutę."
        },
        {
            id: "master-upgrader",
            text: "Mistrz ulepszeń",
            achieved: false,
            condition: () => autoClickerLevel + doubleWordsLevel + fasterClicksLevel >= 5,
            tooltip: "Kup w sumie 5 ulepszeń."
        },
        {
            id: "speed-demon",
            text: "Demon szybkości",
            achieved: false,
            condition: () => fasterClicksLevel >= 3,
            tooltip: "Zwiększ poziom szybkiego klikania do 3."
        },
        {
            id: "perfectionist",
            text: "Perfekcjonista",
            achieved: false,
            condition: () => pages >= 200,
            tooltip: "Napisz co najmniej 200 kartek, aby zdobyć to osiągnięcie."
        }
    ];

    function updateUI() {
        wordCounter.textContent = `Słowa: ${words}/${WORDS_PER_PAGE}`;
        pageCounter.textContent = `Kartki: ${pages}`;
        progressBar.style.width = `${(words / WORDS_PER_PAGE) * 100}%`;
        buyButton.disabled = pages < 1 || shopMenu.value === "";
        updateAchievements();
    }

    function updateAchievements() {
        achievementsList.innerHTML = "";
        achievementList.forEach(achievement => {
            if (!achievement.achieved && achievement.condition()) {
                achievement.achieved = true;
                achievements.push(achievement.text);
                flashAchievement(achievement.text);
                playSound(upgradeSound);
            }
            const achievementElement = document.createElement("li");
            achievementElement.textContent = achievement.text;
            achievementElement.className = achievement.achieved ? "achievement achieved" : "achievement";
            achievementElement.setAttribute("data-tooltip", achievement.tooltip); // Dodanie podpowiedzi do atrybutu `data-tooltip`
            achievementsList.appendChild(achievementElement);
        });
    }

    function flashAchievement(text) {
        const achievementElement = document.querySelector(`.achievement:contains('${text}')`);
        if (achievementElement) {
            achievementElement.classList.add("flash");
            setTimeout(() => achievementElement.classList.remove("flash"), 2000);
        }
    }

    function addWords(count) {
        words += count;
        while (words >= WORDS_PER_PAGE) {
            pages++;
            words -= WORDS_PER_PAGE;
            playSound(pageSound);
        }
        updateUI();
    }

    function purchaseSkill(skill) {
        if (skill === "auto-clicker" && pages >= 40) {
            pages -= 40;
            autoClickerLevel++;
            updatePurchasedSkills("Automatyczny Klikacz", autoClickerLevel);
            if (autoClickerLevel === 1) startAutoClicker();
        } else if (skill === "double-words" && pages >= 20) {
            pages -= 20;
            doubleWordsLevel++;
            updatePurchasedSkills("Podwójne Słowa", doubleWordsLevel);
        } else if (skill === "faster-clicks" && pages >= 15) {
            pages -= 15;
            fasterClicksLevel++;
            updatePurchasedSkills("Szybsze Klikanie", fasterClicksLevel);
        }
        updateAchievements(); // Aktualizuje listę osiągnięć po zakupie
        updateUI();
    }

    function updatePurchasedSkills(skillName, level) {
        const skillElement = document.getElementById(skillName);
        if (skillElement) {
            skillElement.textContent = `${skillName}: ${level} poziom`;
        } else {
            const newSkill = document.createElement("li");
            newSkill.id = skillName;
            newSkill.textContent = `${skillName}: ${level} poziom`;
            purchasedSkillsList.appendChild(newSkill);
        }
    }

    function startAutoClicker() {
        setInterval(() => {
            const autoClickerWords = 5 * Math.pow(2, doubleWordsLevel) * autoClickerLevel;
            addWords(autoClickerWords);
            playSound(wordSound);
        }, 1000);
    }

    function startTimer() {
        const interval = setInterval(() => {
            remainingTime--;
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timerElement.textContent = `Pozostały czas: ${minutes}:${seconds.toString().padStart(2, "0")}`;
            if (remainingTime <= 0) {
                clearInterval(interval);
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        const totalPages = pages + words / WORDS_PER_PAGE;
        const totalTheses = totalPages / 40; // 40 kartek = 1 praca
        const achievementsText = achievements.length > 0 
            ? `Zdobyte osiągnięcia:\n- ${achievements.join("\n- ")}`
            : "Brak zdobytych osiągnięć.";
        alert(`Gratulacje! Udało ci się napisać ${totalTheses.toFixed(2)} prac dyplomowych.\n\n${achievementsText}`);
        location.reload();
    }

    function playSound(sound) {
        sound.play();
    }

    clickButton.addEventListener("click", () => {
        if (!timerStarted) {
            timerStarted = true;
            startTimer();
        }
        const wordIncrement = 1 * Math.pow(2, doubleWordsLevel);
        addWords(wordIncrement);
        playSound(buttonSound);
    });

    shopMenu.addEventListener("change", () => {
        buyButton.disabled = pages < 1 || shopMenu.value === "";
    });

    buyButton.addEventListener("click", () => {
        const selectedSkill = shopMenu.value;
        purchaseSkill(selectedSkill);
        shopMenu.value = "";
        buyButton.disabled = true;
        playSound(upgradeSound);
    });

    updateUI();
});
