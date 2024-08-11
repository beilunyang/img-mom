import { Message } from "grammy/types";

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

export const isInPrivateChat = (message: Message) => {
	const chatType = message.chat.type;
	return chatType === 'private'
}
