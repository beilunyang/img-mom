interface Env {
	R2_IMG_MOM: R2Bucket;
	R2_CUSTOM_DOMAIN: string;
	B2_KEY_ID: string;
	B2_SECRET_KEY: string;
	B2_ENDPOINT: string;
	B2_BUCKET: string;
	B2_CUSTOM_DOMAIN: string;
	KV_IMG_MOM: KVNamespace;
	TG_BOT_TOKEN: string;
	TG_BOT_OWNER_USERNAME: string;
	TG_BOT_ALLOW_ANYONE: boolean | string;
	TG_WEBHOOK_SECRET_TOKEN: string;
	ENVIRONMENT?: 'production'
}

interface ServiceWorkerGlobalScope extends Env {
	host: string;
}
