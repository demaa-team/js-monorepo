import axios from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { QueryContext } from '../../context';
import { GasPrices } from '../../types';
import { formatGwei } from '../../utils';

import { NetworkId } from 'demaa-contracts-interface';

// WARNNING ETH_GAS_STATION_API_URL shall not take effect anymore
const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
// replace this with https://gasstation-mainnet.matic.network when in mainnet
const GAS_NOW_API_URL = 'https://gasstation-mumbai.matic.today';

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

type GasNowResponse = {
	safeLow: number;
	standard: number;
	fast: number;
	fastest: number;
	blockTime: number;
	blockNumber: number;
};

const useEthGasPriceQuery = (ctx: QueryContext, options?: UseQueryOptions<GasPrices, Error>) => {
	return useQuery<GasPrices, Error>(
		['network', 'gasPrice', ctx.networkId],
		async () => {
			if (ctx.networkId === NetworkId.Mainnet) {
				try {
					const result = await axios.get<GasNowResponse>(GAS_NOW_API_URL);
					const { standard, fast, fastest } = result.data;

					return {
						fastest: Math.round(formatGwei(fastest)),
						fast: Math.round(formatGwei(fast)),
						average: Math.round(formatGwei(standard)),
					};
				} catch (e) {
					const result = await axios.get<EthGasStationResponse>(ETH_GAS_STATION_API_URL);
					const { average, fast, fastest } = result.data;

					return {
						fastest: Math.round(fastest / 10),
						fast: Math.round(fast / 10),
						average: Math.round(average / 10),
					};
				}
			}

			try {
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
