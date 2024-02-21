import { Telegraf, Markup } from 'telegraf';
import BackblazeB2 from './oss/backblazeB2';
import CloudflareR2 from './oss/cloudflareR2';
import { isAt, isInGroup, isOwner } from './utils';
import { OSSProvider } from './oss/interface';

const supportProviders: Record<string, new () => OSSProvider> = {
	BackblazeB2,
	CloudflareR2,
};

const bot = new Telegraf(self.TG_BOT_TOKEN);

bot.use(Telegraf.log());

bot.use((ctx, next) => {
	if (['true', true].includes(self.TG_BOT_ALLOW_ANYONE)) {
		// allow anyone reply photo message
		// @ts-ignore
		if (ctx.message?.photo) {
			return next();
		}
	}
	const userName = ctx.from?.username;
	if (!isOwner(userName)) {
		console.log("You don't have permission");
		return;
	}
	return next();
})

bot.start((ctx) => ctx.reply('Welcome to use ImgMom'));

bot.help(async (ctx) => {
	const commands = await ctx.getMyCommands();
	const info = commands.reduce((acc, val) => `${acc}/${val.command} - ${val.description}\n`, '');
	return ctx.reply(info);
});

bot.command('settings', async (ctx) => {
	const keyboard = Markup.inlineKeyboard(
		[
			...Object.keys(supportProviders).map(provider => Markup.button.callback(provider, provider)),
			Markup.button.callback('None', 'None')
		]
	);

	return ctx.reply('Setting up additional OSS provider', {
		reply_markup: keyboard.reply_markup,
	});
});

bot.on('callback_query', async (ctx) => {
	const provider = (ctx.callbackQuery as any).data;
	const key = `oss_provider_${ctx.callbackQuery.from.username}`;

	if (provider === 'None') {
		self.KV_IMG_MOM.delete(key);
	} else {
		self.KV_IMG_MOM.put(key, provider);
	}
	return ctx.reply(`Ok. Successfully set oss provider (${provider})`);
})

bot.on('photo', async (ctx) => {
	if (isInGroup(ctx.message) && !isAt(ctx.message, ctx.botInfo.username)) {
		console.log('You have to be @bot in group');
		return;
	}

	const photo = ctx.message.photo;
	const uploadFile = photo[photo.length - 1];

	const link = await ctx.telegram.getFileLink(uploadFile.file_id);

	const fileName = link.pathname.split('photos/').pop();
	const tgImgUrl = `https://${self.host}/img/${fileName}`

	if (!isOwner(ctx.message.from.username)) {
		return ctx.reply(
			`Successfully uploaded image!\nTelegram:\n${tgImgUrl}`
		);
	}

	let provider;
	const providerName = await self.KV_IMG_MOM.get(`oss_provider_${ctx.message.from.username}`) ?? '';
	const providerClass = supportProviders[providerName];
	if (providerClass) {
		provider = new providerClass();
	}

	if (!provider) {
		return ctx.reply(
			`Successfully uploaded image!\nTelegram:\n${tgImgUrl}`
		);
	}

	const res = await fetch(link);

	if (!res.ok) {
		return ctx.reply('Failed to upload file');
	}

	const fileType = link.pathname.split('.').pop() || '';

	try {
		const filePath = await provider.uploadImage(await res.arrayBuffer(), uploadFile.file_unique_id, fileType);
		const fullUrl = provider.getURL(filePath);
		return ctx.reply(
			`Successfully uploaded image!\nTelegram:\n${tgImgUrl}\n${providerName}:\n${fullUrl}`
		);
	} catch (err: any) {
		console.error(err);
		return ctx.reply('Failed to upload file: ', err.message);
	}
});

export default bot;
