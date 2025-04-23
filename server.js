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
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch(); // Ensure all members are loaded
    const userId = req.query.user_id;

    if (userId) {
      const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));
      return res.json({
        id: member.id,
        username: member.user.username,
        status: member.presence?.status || "offline",
      });
    }

    const members = guild.members.cache.map((member) => ({
      id: member.id,
      username: member.user.username,
      tag:
        member.user.discriminator !== "0"
          ? `${member.user.username}#${member.user.discriminator}`
          : member.user.username,
      status: member.presence?.status || "offline",
    }));

    res.json(members);
  } catch (error) {
    console.error("❌ Error in /status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
