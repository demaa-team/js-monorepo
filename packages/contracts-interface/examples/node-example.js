/// <reference types="../src/missing-types" />
const { synthetix } = require('../src/index.ts');
const ethers = require('ethers');

(async () => {
	// this instance exposes props for the given network: synths, sources, targets, users,
	// as well as helper function toBytes32 - as per synthetix: https://github.com/Synthetixio/synthetix/blob/develop/index.js#L199.
	var url = 'https://rpc-mumbai.maticvigil.com/v1/d585c0cb9abcb5f7d5579919bc10e3796ced17db';
	var provider = new ethers.providers.JsonRpcProvider(url);
	var signer = new ethers.Wallet('0x000', provider);
	const snxjs = synthetix({ network: 'mumbai', signer, provider });

	const { formatEther } = snxjs.utils;

	const synths = snxjs.synths.map(({ name }) => name);
	const fromBlock = 0;
	const blockOptions = fromBlock ? { blockTag: Number(fromBlock) } : {};

	let totalInUSD = 0;

	const unformattedSnxPrice = await snxjs.contracts.ExchangeRates.rateForCurrency(
		snxjs.toBytes32('DEM'),
		blockOptions
	); // note blockOptions must be passed to `ethers.Contract` as the final parameter (and fails if no archive node)
	const snxPrice = formatEther(unformattedSnxPrice);
	console.log('DEM Price', snxPrice);
	synths.map(async (synth, index) => {
		const totalAmount = await snxjs.contracts[`Synth${synth}`].totalSupply(blockOptions);

		const totalSupply = formatEther(totalAmount);
		console.log('synth', synth);
		console.log('totalSupply', totalSupply);
		const rateForSynth = formatEther(
			await snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32(synth), blockOptions)
		);
		console.log(synth, 'rate', rateForSynth);
		const totalSupplyInUSD = rateForSynth * totalSupply;
		totalInUSD += totalSupplyInUSD;
		if (index === synths.length - 1) {
			console.log('totalInUSD', totalInUSD);
		}

		const rateIsFrozen = await snxjs.contracts.ExchangeRates.rateIsFrozen(
			snxjs.toBytes32(synth),
			blockOptions
		);

		return { synth, totalAmount, totalSupply, rateForSynth, totalSupplyInUSD, rateIsFrozen };
	});
})().catch((e) => {
	console.log('error', e);
});
