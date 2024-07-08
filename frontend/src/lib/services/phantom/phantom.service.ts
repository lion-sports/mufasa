import type { PublicKey } from "@solana/web3.js";

export interface PhantomProvider {
	connect: (opts?: Partial<any>) => Promise<{ publicKey: PublicKey }>;
	disconnect: () => Promise<void>;
	on: (event: any, callback: (args: any) => void) => void;
	isPhantom: boolean;
}
