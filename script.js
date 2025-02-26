const liveScoresContainer = document.getElementById("liveScores");
const pastMatchesContainer = document.getElementById("pastMatches");
const upcomingMatchesContainer = document.getElementById("upcomingMatches");
const newsContainer = document.getElementById("news");

const newsApiKey = "84766c429e2d4757b4aa1e0cee5e5b46";
const matchesApiKey = "1be34a8a-da3c-4626-8663-70c7c8f272e9";

// Fetch live scores
async function fetchLiveScores() {
    try {
        const response = await fetch("https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live", {
            method: "GET",
            headers: {
                "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
                "x-rapidapi-key": matchesApiKey
            }
        });

        if (!response.ok) throw new Error("Failed to fetch live scores");

        const data = await response.json();
        displayLiveScores(data);
    } catch (error) {
        console.error("Error fetching live scores:", error);
        liveScoresContainer.innerHTML = "<p>Failed to load live scores.</p>";
    }
}

// Function to display live scores
function displayLiveScores(data) {
    liveScoresContainer.innerHTML = "";

    if (!data || !data.typeMatches) {
        liveScoresContainer.innerHTML = "<p>No live matches available.</p>";
        return;
    }

    data.typeMatches.forEach(matchType => {
        matchType.seriesMatches.forEach(series => {
            if (series.seriesAdWrapper) {
                series.seriesAdWrapper.matches.forEach(match => {
                    const matchElement = document.createElement("div");
                    matchElement.classList.add("match");
                    matchElement.innerHTML = `
                        <h3>${match.matchInfo.team1.teamName} vs ${match.matchInfo.team2.teamName}</h3>
                        <p><strong>Venue:</strong> ${match.matchInfo.venueInfo.ground}</p>
                        <p><strong>Status:</strong> ${match.matchInfo.status}</p>
                    `;
                    liveScoresContainer.appendChild(matchElement);
                });
            }
        });
    });
}

// Fetch past matches
async function fetchPastMatches() {
    try {
        const response = await fetch("https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent", {
            method: "GET",
            headers: {
                "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
                "x-rapidapi-key": matchesApiKey
            }
        });

        if (!response.ok) throw new Error("Failed to fetch past matches");

        const data = await response.json();
        displayMatches(data, pastMatchesContainer, "No past matches available.");
    } catch (error) {
        console.error("Error fetching past matches:", error);
        pastMatchesContainer.innerHTML = "<p>Failed to load past matches.</p>";
    }
}

// Fetch upcoming matches
async function fetchUpcomingMatches() {
    try {
        const response = await fetch("https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming", {
            method: "GET",
            headers: {
                "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
                "x-rapidapi-key": matchesApiKey
            }
        });

        if (!response.ok) throw new Error("Failed to fetch upcoming matches");

        const data = await response.json();
        displayMatches(data, upcomingMatchesContainer, "No upcoming matches available.");
    } catch (error) {
        console.error("Error fetching upcoming matches:", error);
        upcomingMatchesContainer.innerHTML = "<p>Failed to load upcoming matches.</p>";
    }
}

// Function to display past/upcoming matches
function displayMatches(data, container, emptyMessage) {
    container.innerHTML = "";

    if (!data || !data.typeMatches) {
        container.innerHTML = `<p>${emptyMessage}</p>`;
        return;
    }

    data.typeMatches.forEach(matchType => {
        matchType.seriesMatches.forEach(series => {
            if (series.seriesAdWrapper) {
                series.seriesAdWrapper.matches.forEach(match => {
                    const matchElement = document.createElement("div");
                    matchElement.classList.add("match");
                    matchElement.innerHTML = `
                        <h3>${match.matchInfo.team1.teamName} vs ${match.matchInfo.team2.teamName}</h3>
                        <p><strong>Date:</strong> ${new Date(match.matchInfo.startDate).toDateString()}</p>
                        <p><strong>Venue:</strong> ${match.matchInfo.venueInfo.ground}</p>
                    `;
                    container.appendChild(matchElement);
                });
            }
        });
    });
}

// Fetch cricket news
async function fetchNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=cricket&apiKey=${newsApiKey}`);
        if (!response.ok) throw new Error("Failed to fetch news");

        const data = await response.json();
        displayNews(data);
    } catch (error) {
        console.error("Error fetching news:", error);
        newsContainer.innerHTML = "<p>Failed to load news.</p>";
    }
}

// Function to display news articles
function displayNews(data) {
    newsContainer.innerHTML = "";

    if (!data.articles || data.articles.length === 0) {
        newsContainer.innerHTML = "<p>No news articles available.</p>";
        return;
    }

    newsContainer.innerHTML = data.articles.slice(0, 6).map(article => `
        <div class="news-article">
            <img src="${article.urlToImage || 'https://via.placeholder.com/150'}" alt="News Image">
            <h3>${article.title}</h3>
            <p>${article.description || "No description available."}</p>
            <a href="${article.url}" target="_blank">Read More</a>
        </div>
    `).join("");
}

// Refresh live scores every 30 seconds
setInterval(fetchLiveScores, 30000);

// Load data on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchLiveScores();
    fetchPastMatches();
    fetchUpcomingMatches();
    fetchNews();
});
async function fetchWithRetry(url, headers, retries = 3) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, { method: "GET", headers });
        if (response.ok) return response.json();
        if (response.status === 429) {
            console.warn(`Rate limit reached. Retrying in ${2 ** i} seconds...`);
            await new Promise(res => setTimeout(res, 2 ** i * 1000)); // Exponential backoff
        } else {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
    }
}