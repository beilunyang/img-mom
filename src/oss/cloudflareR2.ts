import { genDateDirName } from "../utils";
import { OSSProvider } from "./interface";

class CloudflareR2 implements OSSProvider {
	async uploadImage(data: any, fileName: string, fileType: string, customPath?: string) {
		const filePath = customPath || `${genDateDirName()}/${fileName}.${fileType}`;
		await self.R2_IMG_MOM.put(filePath, data);
		return filePath;
	}

	async checkFileExists(filePath: string) {
		const obj = await self.R2_IMG_MOM.head(filePath);
		return obj !== null;
	}

	getURL(filePath: string) {
		if (self.R2_CUSTOM_DOMAIN) {
			return `https://${self.R2_CUSTOM_DOMAIN}/${filePath}`;
		}

		return filePath;
	}
}

export default CloudflareR2;
