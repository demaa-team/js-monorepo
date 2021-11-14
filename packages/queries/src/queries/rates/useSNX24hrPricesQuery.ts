import { FifteenMinuteSnxPrice } from 'demaa-query-data/build/node/generated/graphql';
import { useQuery, UseQueryOptions } from 'react-query';
import { QueryContext } from '../../context';

const useSNX24hrPricesQuery = (
	ctx: QueryContext,
	options?: UseQueryOptions<FifteenMinuteSnxPrice[]>
) =>
	useQuery<FifteenMinuteSnxPrice[]>(
		['rates', 'snxPrice'],
		async () => {
			return (await ctx.snxData!.snxPrices({
				timeSeries: '15m',
				max: 24 * 4,
			})) as FifteenMinuteSnxPrice[];
		},
		{
			enabled: ctx.snxData != null,
			...options,
		}
	);

export default useSNX24hrPricesQuery;
