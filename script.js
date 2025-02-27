const liveScoresContainer = document.getElementById("liveScores");
const pastMatchesContainer = document.getElementById("pastMatches");
const upcomingMatchesContainer = document.getElementById("upcomingMatches");
const newsContainer = document.getElementById("news");
const pastMatchesButton = document.getElementById("loadPastMatches");
const upcomingMatchesButton = document.getElementById("loadUpcomingMatches");
const readMoreButton = document.createElement("button");
readMoreButton.textContent = "Read More News";
readMoreButton.style = "display: block; margin-top: 10px; background-color: #007BFF; color: white; padding: 10px 15px; border-radius: 5px; text-align: center; text-decoration: none; width: fit-content; margin-left: auto; margin-right: auto; cursor: pointer;";

const newsApiKey = "69f3fb37-a083-480e-a7bc-6f4c709ef88b";
const matchesApiKey = "1be34a8a-da3c-4626-8663-70c7c8f272e9";
let currentNewsPage = 1;
const newsPerPage = 8;
let allArticles = [];

// Fetch matches list
async function fetchMatchesList() {
    try {
        const response = await fetch(`https://api.sportradar.us/cricket-t2/en/schedule.json?api_key=${matchesApiKey}`);
        if (!response.ok) throw new Error("Failed to fetch matches list");

        const data = await response.json();
        console.log("Matches List Data:", data);
        displayMatches(data, liveScoresContainer, "No matches available.");
    } catch (error) {
        console.error("Error fetching matches list:", error);
        liveScoresContainer.innerHTML = "<p>Failed to load matches.</p>";
    }
}

// Fetch cricket news
async function fetchNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=cricket&pageSize=20&apiKey=${newsApiKey}`, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch news, Status: ${response.status}`);

        const data = await response.json();
        allArticles = data.articles;
        console.log("News Data:", allArticles);
        displayNews();
    } catch (error) {
        console.error("Error fetching news:", error);
        newsContainer.innerHTML = "<p>Failed to load news.</p>";
    }
}

// Function to display news in a table format
function displayNews() {
    newsContainer.innerHTML = "";
    if (!allArticles || allArticles.length === 0) {
        newsContainer.innerHTML = "<p>No news available.</p>";
        return;
    }

    const table = document.createElement("table");
    table.classList.add("news-table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector("tbody");

    const startIndex = (currentNewsPage - 1) * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    const articlesToShow = allArticles.slice(0, endIndex);

    articlesToShow.forEach(article => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="${article.url}" target="_blank"><img src="${article.urlToImage || "https://via.placeholder.com/100"}" alt="News Image" width="100" style="border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);"></a></td>
            <td style="font-weight: bold; color: #333;">${article.title}</td>
            <td style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${article.description || "No description available."}</td>
        `;
        tbody.appendChild(row);
    });

    newsContainer.appendChild(table);

    if (endIndex < allArticles.length) {
        newsContainer.appendChild(readMoreButton);
    }
}

readMoreButton.addEventListener("click", () => {
    currentNewsPage++;
    displayNews();
});

pastMatchesButton.addEventListener("click", fetchPastMatches);
upcomingMatchesButton.addEventListener("click", fetchUpcomingMatches);
setInterval(fetchMatchesList, 30000);
setInterval(fetchNews, 60000); // Refresh news every minute

document.addEventListener("DOMContentLoaded", () => {
    fetchMatchesList();
    fetchNews();
});
