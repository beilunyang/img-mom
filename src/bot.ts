import { Bot, InlineKeyboard } from 'grammy/web';
import BackblazeB2 from './oss/backblazeB2';
import CloudflareR2 from './oss/cloudflareR2';
import { isInPrivateChat, isOwner } from './utils';
import { OSSProvider } from './oss/interface';


const supportProviders: Record<string, new () => OSSProvider> = {
	BackblazeB2,
	CloudflareR2,
};

const bot = new Bot(self.TG_BOT_TOKEN);

bot.use((ctx, next) => {
	console.log(JSON.stringify(ctx.update, null, 2));
	return next();
});

bot.command('start', (ctx) => ctx.reply('Welcome to use ImgMom'));

bot.command('help', async (ctx) => {
	const commands = await ctx.api.getMyCommands();
	const info = commands.reduce((acc, val) => `${acc}/${val.command} - ${val.description}\n`, '');
	return ctx.reply(info);
});

bot.use(async (ctx, next) => {
	if (['true', true].includes(self.TG_BOT_ALLOW_ANYONE)) {
		// allow anyone upload image
		if (ctx.message?.photo || ctx.message?.document) {
			return next();
		}
	}
	const userName = ctx.from?.username;
	if (!isOwner(userName)) {
		return ctx.reply("You don't have the relevant permissions, the img-mom bot code is open source and you can self-deploy it. \nVisit: https://github.com/beilunyang/img-mom");
	}
	await next();
})

bot.command('settings', async (ctx) => {
	const buttons = [
		...Object.keys(supportProviders).map(provider => InlineKeyboard.text(provider, provider)),
		InlineKeyboard.text('None', 'None')
	]

	const keyboard = InlineKeyboard.from([buttons]);

	return ctx.reply('Setting up additional OSS provider', {
		reply_markup: keyboard,
	});
});

bot.on('callback_query:data', async (ctx) => {
	const data = (ctx.callbackQuery as any).data;
	switch (data) {
		case 'confirm_overwrite': {
			const key = `pending_upload_${ctx.callbackQuery.from.username}`;
			const pendingUpload = await self.KV_IMG_MOM.get(key);
			if (!pendingUpload) {
				return ctx.reply('No pending upload found.');
			}
			const { providerName, filePath, fileName, fileType, customPath, tgImgUrl } = JSON.parse(pendingUpload);
			const providerClass = supportProviders[providerName];
			if (!providerClass) {
				return ctx.reply('Invalid provider.');
			}
			const provider = new providerClass();
			try {
				const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/${filePath}`);
				if (!res.ok) {
					return ctx.reply('Failed to fetch file from Telegram');
				}
				const fileData = await res.arrayBuffer();

				const uploadedPath = await provider.uploadImage(fileData, fileName, fileType, customPath);
				const fullUrl = provider.getURL(uploadedPath);
				await self.KV_IMG_MOM.delete(key);
				return ctx.reply(
					`Successfully uploaded image with overwrite!\nTelegram:\n${tgImgUrl}\n${providerName}:\n${fullUrl}`
				);
			} catch (err: any) {
				console.error(err);
				return ctx.reply('Failed to upload file: ' + err.message);
			}
			break;
		}
		case 'cancel_overwrite': {
			const key = `pending_upload_${ctx.callbackQuery.from.username}`;
			await self.KV_IMG_MOM.delete(key);
			return ctx.reply('Upload cancelled.');
		}
		default: {
			const provider = data;
			const key = `oss_provider_${ctx.callbackQuery.from.username}`;

			if (provider === 'None') {
				self.KV_IMG_MOM.delete(key);
			} else {
				self.KV_IMG_MOM.put(key, provider);
			}

			return ctx.reply(`Ok. Successfully set oss provider (${provider})`);
		}
	}
})

bot.on(['message:photo', 'message:document'], async (ctx) => {
	if (!isInPrivateChat(ctx.message)) {
		console.log('Can only be used in private chat');
		return;
	}

	const file = await ctx.getFile();
	const caption = ctx.message.caption?.startsWith('/') ? ctx.message.caption.slice(1) : ctx.message.caption;
	const tgImgUrl = `https://${self.host}/img/${file.file_id}`;

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

	const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/${file.file_path}`);

	if (!res.ok) {
		return ctx.reply('Failed to upload file');
	}

	const fileType = file.file_path?.split('.').pop() || '';
	const fileData = await res.arrayBuffer();

	try {
		if (caption) {
			const exists = await provider.checkFileExists(caption);
			if (exists) {
				const pendingUpload = {
					providerName,
					filePath: file.file_path,
					fileName: file.file_unique_id,
					fileType,
					customPath: caption,
					tgImgUrl
				};
				await self.KV_IMG_MOM.put(
					`pending_upload_${ctx.message.from.username}`,
					JSON.stringify(pendingUpload),
					{ expirationTtl: 300 }
				);

				const keyboard = InlineKeyboard.from([
					[
						InlineKeyboard.text('Yes', 'confirm_overwrite'),
						InlineKeyboard.text('No', 'cancel_overwrite')
					]
				]);
				return ctx.reply(
					`File already exists at path "${caption}". Do you want to overwrite it?`,
					{ reply_markup: keyboard }
				);
			}
			const filePath = await provider.uploadImage(fileData, file.file_unique_id, fileType, caption);
			const fullUrl = provider.getURL(filePath);
			return ctx.reply(
				`Successfully uploaded image!\nTelegram:\n${tgImgUrl}\n${providerName}:\n${fullUrl}`
			);
		} else {
			const filePath = await provider.uploadImage(fileData, file.file_unique_id, fileType);
			const fullUrl = provider.getURL(filePath);
			return ctx.reply(
				`Successfully uploaded image!\nTelegram:\n${tgImgUrl}\n${providerName}:\n${fullUrl}`
			);
		}
	} catch (err: any) {
		console.error(err);
		return ctx.reply('Failed to upload file: ' + err.message);
	}
});

export default bot;
