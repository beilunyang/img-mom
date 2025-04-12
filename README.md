<div align="center">
	<img height="180" src="https://pic.otaku.ren/20240320/AQADuroxGzAf2Vd9.jpg" alt="logo" />
  <h1 align="center">img-mom</h1>
  <p align="center">
		Telegram bot for uploading images to image hosting services and getting direct links
  </p>

[![twitter](https://img.shields.io/twitter/follow/beilunyang.svg?label=beilunyang
)](https://x.com/beilunyang)
![wechat2](https://img.shields.io/badge/微信公众号-悖论的技术小屋-brightgreen?style=flat-square)

English . [中文](./README-zh_CN.md)
</div>

## Features
- Built on Cloudflare Workers runtime, lightweight and completely free to use
- Supports multiple image hosting services (Telegram/Cloudflare R2/Backblaze B2, with more coming soon)
- Quick deployment using Wrangler

## How to Use
1. Send images to the Bot via private chat. By default, the Bot will reply with a Telegram image hosting link
2. Send the `/settings` command to specify additional image hosting services. After setup, the Bot will reply with links to your specified services when you send images
3. Try it online at https://t.me/img_mom_bot
![img-mom](https://pic.otaku.ren/20240212/AQADQ7oxGx0pUVZ9.jpg)

## Custom URL Path
When uploading to additional image hosting services, you can specify a complete URL path (excluding the domain part):

1. Send an image with a caption text to specify the path (e.g., `path/to/image.jpg`)
2. If the specified path already exists, the bot will ask if you want to overwrite the existing image
3. You can confirm or cancel the upload

## Self-Deployment
### Prerequisites
- This project is developed with NodeJS + TypeScript. You need NodeJS installed locally (NodeJS 20.11.0+ recommended)
- This project runs on Cloudflare Workers, so you need a Cloudflare account (register at Cloudflare's website)
- This project serves as a Telegram bot backend, so you need to create a Telegram bot. See the Telegram official documentation: https://core.telegram.org/bots/features#creating-a-new-bot

### Deployment
1. Clone the project
	```bash
	git@github.com:beilunyang/img-mom.git
	cd img-mom
	```
2. Install dependencies
	```bash
	npm install
	```
3. Create a wrangler configuration file
	```
	cp wrangler.example.toml wrangler.toml
	```
4. Edit the newly created wrangler.toml file
5. After editing, run
	```bash
	npm run deploy
	```
	Wait for the project to compile and deploy to Cloudflare Workers

6. Open `https://<your-domain>/setup` in your browser to complete the necessary Webhook initialization

### Wrangler.toml Configuration
```toml
# Your Cloudflare account ID
# Required
account_id = "<string>"

[vars]
# Your Telegram Bot Token
# Required
TG_BOT_TOKEN = "<string>"
# A string of length 1-256 with characters A-Z,a-z,0-9,_,- to prevent malicious calls to the Webhook interface
# Optional but strongly recommended
TG_WEBHOOK_SECRET_TOKEN = "<string>"
# Telegram Bot owner's username
# Required
TG_BOT_OWNER_USERNAME = "<string>"
# Whether to allow non-owner users to use the Telegram image hosting (Note: even if set to true, non-owner users cannot use CloudflareR2/BackblazeB2)
# Optional
TG_BOT_ALLOW_ANYONE = "<boolean>"

# Cloudflare R2 custom domain
# Required when enabling Cloudflare R2
R2_CUSTOM_DOMAIN = "<string>"
# Backblaze B2 keyID
# Required when enabling Backblaze B2
B2_KEY_ID = "<string>"
# Backblaze B2 secretKey
# Required when enabling Backblaze B2
B2_SECRET_KEY = "<string>"
# Backblaze B2 Endpoint
# Required when enabling Backblaze B2
B2_ENDPOINT = "<string>"
# Backblaze B2 Bucket name
# Required when enabling Backblaze B2
B2_BUCKET = "<string>"
# Backblaze B2 custom domain
# Optional
B2_CUSTOM_DOMAIN = "<string>"

[[kv_namespaces]]
# kv ID, see https://developers.cloudflare.com/workers/runtime-apis/kv
# Required
id = "<string>"

[[r2_buckets]]
# r2 Bucket name, see https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
# Required
bucket_name = "<string>"
```

Tips:
- Backblaze B2 KeyId/SecretKey can be obtained from https://secure.backblaze.com/app_keys.htm
- Backblaze B2 Endpoint/Bucket can be obtained from https://secure.backblaze.com/b2_buckets.htm

## GitHub Action Automatic Deployment

To deploy Cloudflare Workers using GitHub Actions, set up the following Secrets in your GitHub repository:

- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID.
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token.
- `CLOUDFLARE_KV_NAMESPACE_ID`: The namespace ID for your Cloudflare KV storage.
- `CLOUDFLARE_BUCKET_NAME`: The bucket name for your Cloudflare storage.
- `R2_CUSTOM_DOMAIN`: Custom domain for your Cloudflare R2 storage.
- `TG_BOT_TOKEN`: Your Telegram bot token.
- `TG_WEBHOOK_SECRET_TOKEN`: A secret token for the Telegram webhook.
- `TG_BOT_OWNER_USERNAME`: The username of the Telegram bot owner.
- `TG_BOT_ALLOW_ANYONE`: Configuration to allow anyone to use the Telegram bot.
- `B2_KEY_ID`: Your Backblaze B2 key ID.
- `B2_SECRET_KEY`: Your Backblaze B2 secret key.
- `B2_ENDPOINT`: The endpoint for your Backblaze B2 storage.
- `B2_BUCKET`: The bucket name for your Backblaze B2 storage.
- `B2_CUSTOM_DOMAIN`: Custom domain for your Backblaze B2 storage.

### How to Set Up Secrets

1. Go to your GitHub repository.
2. Click `Settings` > `Secrets and variables` > `Actions` > `New repository secret`.
3. Add each Name and Secret as listed above with the appropriate values.

Make sure to replace with your actual Cloudflare and Backblaze B2 account details.

Once configured, when code is pushed to the master branch, the GitHub Actions workflow will use these Secrets to dynamically generate the wrangler.toml configuration file and automatically deploy your Cloudflare Worker.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/beilunyang/img-mom)


## Contributing
1. Fork this project
2. Checkout your development branch based on master
3. Configure wrangler.toml
4. Install dependencies and run locally
	```bash
	npm install
	npm run dev
	# Use Cloudflare tunnels for network tunneling
	npm run tunnel
	```
	Note: Since this project serves as a Telegram Bot Webhook backend, running locally doesn't allow Telegram Bot access, so you need network tunneling to make your locally running service accessible via the internet. (Cloudflare tunnels is recommended for free network tunneling, but you can also use services like ngrok)
5. Open `https://<your-domain>/setup` in your browser to complete the necessary Webhook initialization
6. Write code and test
7. Submit a PR and wait for merging

## Sponsorship
<img src="https://pic.otaku.ren/20240212/AQADPrgxGwoIWFZ-.jpg" style="width: 400px;"/>
<br />
<a href="https://www.buymeacoffee.com/beilunyang" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="width: 400px;" ></a>

## License
MIT License.
