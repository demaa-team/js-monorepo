import { ethers } from 'ethers';

import type { SynthetixData } from 'demaa-query-data';
import { SynthetixJS, NetworkId } from 'demaa-contracts-interface';

export interface QueryContext {
	networkId: NetworkId | null;
	provider: ethers.providers.Provider | null;
	signer: ethers.Signer | null;
	snxData: SynthetixData | null;
	snxjs: SynthetixJS | null;
}
