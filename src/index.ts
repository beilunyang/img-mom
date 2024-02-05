import { Application, Router } from '@cfworker/web';
import createTelegrafMiddleware from 'cfworker-middleware-telegraf';
import bot from './bot';

const router = new Router();

router.post('/bot', (ctx, next) => {
	const webhookSecretToken = ctx.req.headers.get('X-Telegram-Bot-Api-Secret-Token');
	if (self.TG_WEBHOOK_SECRET_TOKEN && webhookSecretToken !== self.TG_WEBHOOK_SECRET_TOKEN) {
		ctx.res.status = 401;
		return;
	}
	self.host = ctx.req.url.host;
	return next();
}, createTelegrafMiddleware(bot));

router.get('/setup', async (ctx) => {
	const webhookHost = await self.KV_IMG_MOM.get('webhookHost');
	if (!webhookHost) {
		const host = ctx.req.url.host;
  	const botUrl = `https://${host}/bot`;
		await bot.telegram.setWebhook(botUrl, {
			secret_token: self.TG_WEBHOOK_SECRET_TOKEN,
		});
		await bot.telegram.setMyCommands([{
			command: '/settings',
			description: 'Setting up the bot',
		}]);
		await self.KV_IMG_MOM.put('webhookHost', host);
  	ctx.res.body = `Webhook(${botUrl}) setup successful`;
		return;
	}
	ctx.res.status = 401;
});

router.get('/', (ctx) => {
  ctx.res.body = "Hello ImgMom (https://github.com/beilunyang/img-mom)";
})

router.get('/img/:fileName', async (ctx) => {
	const fileName = ctx.req.params.fileName;

	const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/photos/${fileName}`);
	if (!res.ok) {
		ctx.res.status = 404;
		return;
	}

	const fileType = fileName.split('.').pop();
	ctx.res.type = `image/${fileType}`;
	ctx.res.body = await res.arrayBuffer();
})



new Application().use(router.middleware).listen();

