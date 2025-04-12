export interface OSSProvider {
	uploadImage(data: any, fileName: string, fileType: string, customPath?: string): Promise<string>;
	getURL(filePath: string): string;
	checkFileExists(filePath: string): Promise<boolean>;
}
