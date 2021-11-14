import { RateUpdate } from 'demaa-query-data/build/node/generated/graphql';
import subHours from 'date-fns/subHours';

import { BaseRateUpdate } from '../../types';

export const getMinAndMaxRate = (rates: RateUpdate[]) => {
	if (rates.length === 0) return [0, 0];

	return rates.reduce(
		([minRate, maxRate], val) => {
			const { rate } = val;
			const newMax = rate > maxRate ? rate : maxRate;
			const newMin = rate < minRate ? rate : minRate;

			return [newMin, newMax];
		},
		[Number.MAX_SAFE_INTEGER, 0]
	);
};

export const calculateRateChange = (rates: RateUpdate[]) => {
	if (rates.length < 2) return 0;

	const newPrice = rates[0].rate;
	const oldPrice = rates[rates.length - 1].rate;
	const percentageChange = (newPrice - oldPrice) / oldPrice;

	return percentageChange;
};

export const calculateTimestampForPeriod = (periodInHours: number) =>
	Math.trunc(subHours(new Date().getTime(), periodInHours).getTime() / 1000);

export const usdHistoricalRates = (
	periodInHours: number,
	rate = 1,
	points = 100
): BaseRateUpdate[] => {
	let now = Date.now();

	const rates = [];

	for (let i = 0; i < points; i++) {
		rates.unshift({
			timestamp: now,
			rate,
		});
		now -= 1000 * 60 * periodInHours;
	}

	return rates;
};
