export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const apiUrl = req.query.url;
    if (!apiUrl) {
      return res.status(400).json({ error: "URL is required" });
    }
  
    try {
      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        },
      });
  
      const data = await response.text();
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(response.status).send(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
  