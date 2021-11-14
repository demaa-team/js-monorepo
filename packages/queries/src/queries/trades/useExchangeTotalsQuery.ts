import { useQuery, UseQueryOptions } from 'react-query';
import { ExchangeTotals } from 'demaa-query-data';
import { QueryContext } from '../../context';

export const useExchangeTotalsQuery = (
	ctx: QueryContext,
	args: any,
	options?: UseQueryOptions<ExchangeTotals[] | null>
) => {
	return useQuery<ExchangeTotals[] | null>(
		['trading', 'exchangeTotals', ctx.networkId, args],
		() => ctx.snxData!.exchangeTotals(args),
		{
			enabled: ctx.snxData != null,
			...options,
		}
	);
};

export default useExchangeTotalsQuery;
