# Discord Channel Cleanup Crew (Timed Auto-Delete)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
## Description
A Discord bot whose sole purpose is to time each message in the specified channel for auto-deletion. 

Allows you to implement channels with auto-delete functionality (eg. messages older than 24 hours) 

Developed with privacy in mind. 

Currently able to monitor one specific channel only.
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributors](#Contributors)
- [Questions](#questions)
## Installation
Must be using NodeJS.
1. Go to the Discord Developer Portal
2. Create a new application
3. Add a bot to your application
4. Configure your bot settings and enable:
> - Presence Intent
> - Server Members Intent
> - Message Content Intent

5. Copy your Bot Token.  
(Do not share this with anyone!)
6. Go to "OAuth2" > "URL Generator"
> - Under "Scopes", select bot
> - Under "Bot Permissions", choose Manage Messages
> - Copy the generated URL at the bottom and paste it into your browser to invite the bot to your server.
## Usage
1. Set up NodeJS development environment on your machine. 
2. Git clone the repo. 
3. Set up your .env file with the example provided in app.js
4. Run 'node app' from the directory via Terminal.

Make sure to run 'npm install' to install dependencies.
## License
      This project is licensed under the MIT license.
## Contributors
 - [@alvin-est](https://github.com/alvin-est)
 - My buddy, Grok.
## Questions
If you have any questions, please contact me at [contact@alvin-the.dev](mailto:contact@alvin-the.dev). You can also find me on GitHub at [@alvin-est](https://github.com/alvin-est).  
