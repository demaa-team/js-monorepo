import axios from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { QueryContext } from '../../context';
import { GasPrices } from '../../types';
import { formatGwei } from '../../utils';
import { BigNumber } from 'ethers';

import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

export const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
const MULTIPLIER = BigNumber.from(2);

type EthGasStationResponse = {
	average: number;
	avgWait: number;
	blockNum: number;
	block_time: number;
	fast: number;
	fastWait: number;
	fastest: number;
	fastestWait: number;
	gasPriceRange: Record<number, number>;
	safeLow: number;
	safeLowWait: number;
	speed: number;
};

const useEthGasPriceQuery = (ctx: QueryContext, options?: UseQueryOptions<GasPrices, Error>) => {
	return useQuery<GasPrices, Error>(
		['network', 'gasPrice', ctx.networkId],
		async () => {
			if (ctx.networkId === NetworkId.Mainnet) {
				try {
					const result = await axios.get<EthGasStationResponse>(ETH_GAS_STATION_API_URL);
					const { average, fast, fastest } = result.data;

					return {
						fastest: Math.round(formatGwei(fastest)),
						fast: Math.round(formatGwei(fast)),
						average: Math.round(formatGwei(average)),
					};
				} catch (e) {
					throw new Error(`Cannot retrieve mainnet gas price from provider ${e}`);
				}
			}

			try {
				const block = await ctx?.provider?.getBlock('latest');
				// if block has baseFeePerGas then networks supports EIP1559
				if (block?.baseFeePerGas) {
					return {
						fastest: block.baseFeePerGas
							.mul(MULTIPLIER)
							.add(wei(600000000, undefined, true).toBN())
							.toNumber(),
						fast: block.baseFeePerGas
							.mul(MULTIPLIER)
							.add(wei(400000000, undefined, true).toBN())
							.toNumber(),
						average: block.baseFeePerGas
							.mul(MULTIPLIER)
							.add(wei(200000000, undefined, true).toBN())
							.toNumber(),
					};
				}

				const gasPrice = formatGwei((await ctx.provider!.getGasPrice()).toNumber());
				return {
					fastest: gasPrice,
					fast: gasPrice,
					average: gasPrice,
				};
			} catch (e) {
				throw new Error('Cannot retrieve optimistic gas price from provider. ' + e);
			}
		},
		{
			enabled: !!ctx.networkId,
			...options,
		}
	);
};

export default useEthGasPriceQuery;
