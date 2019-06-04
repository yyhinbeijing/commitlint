import {sync, ParsedCommit, ParserOptions} from 'conventional-commits-parser';
import {isArray, mergeWith} from 'lodash';

const defaultChangelogOpts = require('conventional-changelog-angular');

export default parse;

export type ParsedMessage<
	Header = {},
	Revert = {},
	Merge = {},
	Fields = {}
> = ParsedCommit<Header, Revert, Merge, Fields> & {raw: string};

export async function parse<Header = {}, Revert = {}, Merge = {}, Fields = {}>(
	message: string,
	parser: typeof sync = sync,
	parserOpts?: ParserOptions
): Promise<ParsedMessage<Header, Revert, Merge, Fields>> {
	const options = mergeWith({}, await getDefaults(), parserOpts, override);

	const parsed = parser(message, options);

	return mergeWith({}, parsed, {raw: message});
}

interface ConventionalChangelogPreset {
	conventionalChangelog: unknown;
	parserOpts: ParserOptions;
	recommendedBumpOpts: unknown;
	writerOpts: unknown;
}

async function getDefaults(): Promise<ParserOptions> {
	const opts = (await defaultChangelogOpts) as ConventionalChangelogPreset;
	return opts.parserOpts;
}

function override(o: unknown, s: unknown): unknown {
	if (isArray(o)) return s;
}
