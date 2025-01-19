How can I run my Discord.js bot via SSH to my VPS without closing the process when I exit terminal?
Answer
To run your Discord.js bot on your VPS without the process closing when you exit the terminal, you can use a process manager like pm2 or screen. Here are steps for both methods:

Using pm2
1. Install pm2:

First, you'll need to install pm2 globally on your VPS. SSH into your VPS and run:

bash
sudo npm install pm2 -g

2. Navigate to Your Bot's Directory:

bash
cd /path/to/your/bot

3. Run Your Bot with pm2:

If your bot's main file is named bot.js, you can start it with:

bash
pm2 start bot.js

To specify a name for your process (helpful for management):
bash
pm2 start bot.js --name "MyDiscordBot"

4. Ensure pm2 Runs on Reboot:

Configure pm2 to start on system boot:
bash
pm2 startup systemd
This command will give you a line to execute. Run that line as instructed (it will look something like sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <username> --hp /home/<username>).
Then, save your current process list to make sure they are managed by pm2 on reboot:
bash
pm2 save

5. Managing Your Bot:

List running processes:
bash
pm2 list
To stop your bot:
bash
pm2 stop bot.js  # or stop by name if you named it
To restart:
bash
pm2 restart bot.js
To see logs:
bash
pm2 logs bot.js
