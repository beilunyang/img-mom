export interface OSSProvider {
	uploadImage(data: any, fileName: string, fileType: string): Promise<string>;
	getURL(filePath: string): string;
}
