import express from "express";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8383;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.User],
});

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

app.get("/status", async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "Missing user_id" });

    const guild = client.guilds.cache.get(GUILD_ID);
    const member = await guild.members.fetch(userId);

    res.json({
      id: member.id,
      username: member.user.username,
      status: member.presence?.status || "offline",
    });
  } catch (error) {
    console.error("❌ Error fetching presence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/members", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    await guild.members.fetch(); // Ensures all members are loaded into cache

    const members = guild.members.cache.map((member) => ({
      id: member.id,
      username: member.user.username,
      tag: member.user.tag,
    }));

    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
