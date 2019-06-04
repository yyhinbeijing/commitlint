declare module 'conventional-commits-parser' {
	export interface ParsedReference {
		issue: number;
	}

	export type ParsedCommit<
		Header = {},
		Revert = {},
		Merge = {},
		Fields = {}
	> = {[Field in keyof Fields]: Fields[Field]} & {
		body: string | null;
		footer: string | null;
		header: string | null | {[Field in keyof Header]: Header[Field]};
		mentions: string[];
		merge: string | null | {[Field in keyof Merge]: Merge[Field]};
		notes: string[];
		references: ParsedReference[];
		revert: string | null | {[Field in keyof Revert]: Revert[Field]};
		scope: string | null;
		subject: string | null;
		type: string | null;
	};

	export type ParserPattern = RegExp | string | null;
	export type ParserCorrespondence = string[] | string | null;

	export interface ParserOptions {
		mergePattern?: ParserPattern;
		mergeCorrespondence?: ParserCorrespondence;
		headerPattern?: ParserPattern;
		headerCorrespondence?: ParserCorrespondence;
		referenceActions?: ParserCorrespondence;
		issuePrefixes?: ParserCorrespondence;
		noteKeywords?: ParserCorrespondence;
		fieldPattern?: ParserPattern;
		revertPattern?: ParserPattern;
		revertCorrespondence?: ParserCorrespondence;
		commentChar?: string | null;
		warn?: boolean | typeof console.warn;
	}

	export default function parse<Header, Revert, Merge, Fields>(
		options: ParserOptions
	): TransformStream<string, ParsedCommit<Header, Revert, Merge, Fields>>;
	export function sync<Header, Revert, Merge, Fields>(
		commit: string,
		options: ParserOptions
	): ParsedCommit<Header, Revert, Merge, Fields>;
}
