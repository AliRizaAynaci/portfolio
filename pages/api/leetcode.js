export default async function handler(req, res) {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    const query = `
    query getUserProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
          starRating
        }
      }
    }
  `;

    try {
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Referer: "https://leetcode.com",
            },
            body: JSON.stringify({
                query,
                variables: { username },
            }),
        });

        const data = await response.json();

        if (data.errors) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = data.data.matchedUser;
        const allQuestions = data.data.allQuestionsCount;

        const stats = {
            username: userData.username,
            ranking: userData.profile.ranking,
            reputation: userData.profile.reputation,
            totalSolved: userData.submitStats.acSubmissionNum.find(
                (s) => s.difficulty === "All"
            ).count,
            easySolved: userData.submitStats.acSubmissionNum.find(
                (s) => s.difficulty === "Easy"
            ).count,
            mediumSolved: userData.submitStats.acSubmissionNum.find(
                (s) => s.difficulty === "Medium"
            ).count,
            hardSolved: userData.submitStats.acSubmissionNum.find(
                (s) => s.difficulty === "Hard"
            ).count,
            totalQuestions: allQuestions.find((q) => q.difficulty === "All").count,
            easyTotal: allQuestions.find((q) => q.difficulty === "Easy").count,
            mediumTotal: allQuestions.find((q) => q.difficulty === "Medium").count,
            hardTotal: allQuestions.find((q) => q.difficulty === "Hard").count,
        };

        // Cache for 1 hour
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=7200"
        );

        return res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching LeetCode stats:", error);
        return res.status(500).json({ error: "Failed to fetch LeetCode data" });
    }
}
