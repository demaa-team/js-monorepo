/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

try {
	fs.mkdirSync(__dirname + '/generated/');
} catch {}

for (const network of ['mainnet', 'mainnet-ovm', 'kovan', 'kovan-ovm', 'mumbai']) {
	const synths = require(`synthetix-demaa/publish/deployed/${network}/synths.json`);

	const genTs = ['export enum Synths {'];

	for (const synth of synths) {
		if (!synth.name) continue;

		genTs.push(`    ${synth.name} = '${synth.name}',`);
	}

	genTs.push('}');

	fs.writeFileSync(__dirname + `/generated/${network}.ts`, genTs.join('\n'));
}
