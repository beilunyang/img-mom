import { Hono } from 'hono';
import { webhookCallback } from 'grammy/web';
import bot from './bot';
import { fileTypeFromBuffer } from 'file-type'

const app = new Hono();

app.post('/bot', async (ctx, next) => {
	self.host = new URL(ctx.req.url).host;
	return next();
}, webhookCallback(bot, 'hono', {
	secretToken: self.TG_WEBHOOK_SECRET_TOKEN
}));

app.get('/setup', async (ctx) => {
	const webhookHost = await self.KV_IMG_MOM.get('webhookHost');
	if (!webhookHost) {
		const host = new URL(ctx.req.url).host;
  	const botUrl = `https://${host}/bot`;
		await bot.api.setWebhook(botUrl, {
			secret_token: self.TG_WEBHOOK_SECRET_TOKEN,
		});
		await bot.api.setMyCommands([{
			command: '/settings',
			description: 'Setting up the bot',
		}]);
		await self.KV_IMG_MOM.put('webhookHost', host);
  	return ctx.text(`Webhook(${botUrl}) setup successful`);
	}
	return ctx.text('401 Unauthorized. Please visit ImgMom docs (https://github.com/beilunyang/img-mom)', 401)
});

app.get('/img/:fileId', async (ctx) => {
	const fileId = ctx.req.param('fileId');
	const file = await bot.api.getFile(fileId)
	const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/${file.file_path}`);
	if (!res.ok) {
  	return ctx.text('404 Not Found. Please visit ImgMom docs (https://github.com/beilunyang/img-mom)', 404);
	}

	const bf = await res.arrayBuffer()

	const fileType = await fileTypeFromBuffer(bf)

	return ctx.body(bf, 200, {
		'Content-Type': fileType?.mime ?? '',
	});
});

app.get('/', (ctx) => ctx.text('Hello ImgMom (https://github.com/beilunyang/img-mom)'));

app.fire()
