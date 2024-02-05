export const genDateDirName = () => {
	const date = new Date();
	const t = (val: number) => {
		if (val < 10) {
			return `0${val}`;
		}
		return String(val);
	}
	return `${date.getUTCFullYear()}${t(date.getUTCMonth() + 1)}${t(date.getUTCDate())}`;
}

export const isOwner = (username?: string) => {
	return username === self.TG_BOT_OWNER_USERNAME;
}

export const isInGroup = (message: any) => {
	const chatType = message?.chat?.type;
	return ['group', 'supergroup'].includes(chatType)
}

export const isAt = (message: any, botName: string) => {
	const mentions = message?.caption_entities?.filter?.((entity: any) => entity?.type === 'mention');
	const caption = message?.caption;
	return !!mentions?.some?.((mention: any) => {
		const atUserName = caption.slice(mention.offset, mention.length + mention.offset);
		return atUserName === `@${botName}`;
	})
}
