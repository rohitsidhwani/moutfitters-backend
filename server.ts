import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function requireAuthToken() {
  if (!process.env.MO_AUTH_TOKEN) {
    throw new Error("Missing MO_AUTH_TOKEN environment variable");
  }
}

async function fetchActivity() {
  requireAuthToken();

  const response = await fetch(
    "https://insights.moutfitters.com/cuts/V1/activity?sortDirection=DESC&sortField=cutDate&pageNum=0&pageSize=10&tz=Asia%2FDubai",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MO_AUTH_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();
  return data;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "moutfitters-secure-backend",
  });
});

app.get("/api/activity", async (_req, res) => {
  try {
    const data = await fetchActivity();

    res.json({
      ok: true,
      activity: data,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
