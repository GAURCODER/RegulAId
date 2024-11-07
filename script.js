async function fetchComplianceData() {
    const summaryList = document.getElementById("summaryList");
    const loadingIndicator = document.getElementById("loading");
    const documentText = document.getElementById("documentText").value.trim();

    // Clear previous results and show loading indicator
    summaryList.innerHTML = "";
    loadingIndicator.classList.remove("hidden");
    loadingIndicator.textContent = "Processing your document, please wait...";

    if (!documentText) {
        alert("Please enter the document text.");
        loadingIndicator.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch("https://render-test-844r.onrender.com/check_compliance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: documentText })
        });

        const data = await response.json();
        console.log(data);
        loadingIndicator.classList.add("hidden");

        if (!data) {
            alert("No data received from the API.");
            return;
        }

        const compliantArticles = data.compliant_articles || [];
        const nonCompliantArticles = data.non_compliant_articles || [];

        if (compliantArticles.length === 0 && nonCompliantArticles.length === 0) {
            alert("No articles found in the response.");
            return;
        }

        populateArticles(nonCompliantArticles, compliantArticles);
    } catch (error) {
        loadingIndicator.classList.add("hidden");
        console.error("Error fetching compliance data:", error);
        alert("An error occurred while fetching data.");
    }
}

function populateArticles(nonCompliantArticles, compliantArticles) {
    const summaryList = document.getElementById("summaryList");

    // Display non-compliant articles first with a cross icon
    nonCompliantArticles.forEach(article => {
        const listItem = document.createElement("li");
        listItem.classList.add("non-compliant-item");

        // Cross icon and article name
        const icon = document.createElement("span");
        icon.classList.add("icon", "unchecked");
        icon.textContent = "❌";
        listItem.appendChild(icon);

        const articleTitle = document.createElement("span");
        articleTitle.textContent = `Article ${article["Article Name"]}`;
        articleTitle.style.fontWeight = "bold";
        listItem.appendChild(articleTitle);

        // Split the reason text by paragraphs first
        const reasonParagraphs = article.Reason.split("\n\n");
        
        // Extract compliance status from the first paragraph if available
        const complianceStatus = reasonParagraphs[0] || "Compliance status: Non-compliant";
        const statusText = document.createElement("p");
        statusText.textContent = complianceStatus;
        statusText.style.fontWeight = "bold";

        // Process the remaining reasons into list items
        const reasonsText = reasonParagraphs[1] || "";
        const reasons = reasonsText.split("\n").filter(line => line.trim().length > 0);
        
        const reasonsList = document.createElement("ul");
        reasonsList.classList.add("reasons-list", "hidden"); // Hide reasons initially

        reasons.forEach(reason => {
            const reasonItem = document.createElement("li");
            reasonItem.textContent = reason.trim();
            reasonsList.appendChild(reasonItem);
        });

        // Toggle dropdown visibility on click
        listItem.onclick = () => {
            reasonsList.classList.toggle("hidden");
        };

        listItem.appendChild(statusText);
        listItem.appendChild(reasonsList); // Append the hidden reasons list

        // Append completed non-compliant item
        summaryList.appendChild(listItem);
    });

    // Display compliant articles with a check icon
    compliantArticles.forEach(article => {
        const listItem = document.createElement("li");
        listItem.classList.add("compliant-item");

        // Check icon and article name
        const icon = document.createElement("span");
        icon.classList.add("icon", "checked");
        icon.textContent = "✔️";
        listItem.appendChild(icon);

        const articleTitle = document.createElement("span");
        articleTitle.textContent = `Article ${article["Article Name"]}`;
        articleTitle.style.fontWeight = "bold";
        listItem.appendChild(articleTitle);

        // Add dropdown with requirements
        const requirementDropdown = document.createElement("div");
        requirementDropdown.classList.add("dropdown-content", "hidden");

        const requirementText = document.createElement("p");
        requirementText.textContent = article.Requirement || "No requirements provided.";
        requirementDropdown.appendChild(requirementText);

        listItem.appendChild(requirementDropdown);

        // Toggle dropdown visibility on click
        listItem.onclick = () => {
            requirementDropdown.classList.toggle("hidden");
        };

        summaryList.appendChild(listItem);
    });
}
