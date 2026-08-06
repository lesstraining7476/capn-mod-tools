import os
import discord


class DiscordClient(discord.Client):
    async def on_ready(self):
        print(f"Logged in as {self.user}")


def main():
    intents = discord.Intents.default()
    intents.message_content = True

    client = DiscordClient(intents=intents)
    client.run(os.environ.get("BOT_TOKEN"))


if __name__ == "__main__":
    main()
