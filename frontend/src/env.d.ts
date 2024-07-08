interface ImportMetaEnv {
	readonly VITE_API_URL: string
	readonly VITE_SOCKET_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

interface PhantomProvider {
	connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
	disconnect: () => Promise<void>;
	on: (event: PhantomEvent, callback: (args: any) => void) => void;
	isPhantom: boolean;
}

interface Window { 
  ethereum: Ether;
	solana: PhantomProvider	
}

interface PaginationData {
	currentPage: number
	firstPage: number
	firstPageUrl: string
	lastPage: number
	lastPageUrl: string
	nextPageUrl: string
	perPage: number
	previousPageUrl: string
	total: number
}


type DeepPartial<T> = T extends object
  ? {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  : T