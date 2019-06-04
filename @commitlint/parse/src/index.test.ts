import importFrom from 'import-from';
import parse from '.';

const from = <T>(id: string, cwd: string = process.cwd()): T =>
	importFrom(cwd, id) as T;

test('returns object with raw message', async () => {
	const message = 'type(scope): subject';
	const actual = await parse(message);
	expect(actual.raw).toBe(message);
});

test('calls parser with message and passed options', async () => {
	const message = 'message';

	await parse(message, m => {
		expect(message).toBe(m);
		return {} as any;
	});
});

test('passes object up from parser function', async () => {
	const message = 'message';
	const result = {};
	const actual = await parse(message, () => result as any);
	expect(actual).toEqual({raw: 'message'});
});

test('returns object with expected keys', async () => {
	const message = 'message';
	const actual = await parse(message);
	const expected = {
		body: null,
		footer: null,
		header: 'message',
		mentions: [],
		merge: null,
		notes: [],
		raw: 'message',
		references: [],
		revert: null,
		scope: null,
		subject: null,
		type: null
	};
	expect(actual).toEqual(expected);
});

test('uses angular grammar', async () => {
	const message = 'type(scope): subject';
	const actual = await parse(message);
	const expected = {
		body: null,
		footer: null,
		header: 'type(scope): subject',
		mentions: [],
		merge: null,
		notes: [],
		raw: 'type(scope): subject',
		references: [],
		revert: null,
		scope: 'scope',
		subject: 'subject',
		type: 'type'
	};
	expect(actual).toEqual(expected);
});

test('uses custom opts parser', async () => {
	const message = 'type(scope)-subject';
	const changelogOpts = await from<any>(
		'./fixtures/parser-preset/conventional-changelog-custom'
	);
	const actual = await parse(message, undefined, changelogOpts.parserOpts);
	const expected = {
		body: null,
		footer: null,
		header: 'type(scope)-subject',
		mentions: [],
		merge: null,
		notes: [],
		raw: 'type(scope)-subject',
		references: [],
		revert: null,
		scope: 'scope',
		subject: 'subject',
		type: 'type'
	};
	expect(actual).toEqual(expected);
});

test('does not merge array properties with custom opts', async () => {
	const message = 'type: subject';
	const actual = await parse(message, undefined, {
		headerPattern: /^(.*):\s(.*)$/,
		headerCorrespondence: ['type', 'subject']
	});
	const expected = {
		body: null,
		footer: null,
		header: 'type: subject',
		mentions: [],
		merge: null,
		notes: [],
		raw: 'type: subject',
		references: [],
		revert: null,
		subject: 'subject',
		type: 'type'
	};
	expect(actual).toEqual(expected);
});

test('supports scopes with /', async () => {
	const message = 'type(some/scope): subject';
	const actual = await parse(message);
	expect(actual.scope).toBe('some/scope');
	expect(actual.subject).toBe('subject');
});

test('supports scopes with / and empty parserOpts', async () => {
	const message = 'type(some/scope): subject';
	const actual = await parse(message, undefined, {});
	expect(actual.scope).toBe('some/scope');
	expect(actual.subject).toBe('subject');
});

test('ignores comments', async () => {
	const message = 'type(some/scope): subject\n# some comment';
	const changelogOpts = await from<any>('conventional-changelog-angular');
	const opts = Object.assign({}, changelogOpts.parserOpts, {
		commentChar: '#'
	});
	const actual = await parse(message, undefined, opts);
	expect(actual.body).toBe(null);
	expect(actual.footer).toBe(null);
	expect(actual.subject).toBe('subject');
});

test('registers inline #', async () => {
	const message =
		'type(some/scope): subject #reference\n# some comment\nthings #reference';
	const changelogOpts = await from<any>('conventional-changelog-angular');
	const opts = Object.assign({}, changelogOpts.parserOpts, {
		commentChar: '#'
	});
	const actual = await parse(message, undefined, opts);
	expect(actual.subject).toBe('subject #reference');
	expect(actual.body).toBe('things #reference');
});

test('parses references leading subject', async () => {
	const message = '#1 some subject';
	const opts = await from<any>('conventional-changelog-angular');
	const {
		references: [actual]
	} = await parse(message, undefined, opts);
	expect(actual.issue).toBe('1');
});

test('parses custom references', async () => {
	const message = '#1 some subject PREFIX-2';
	const {references} = await parse(message, undefined, {
		issuePrefixes: ['PREFIX-']
	});

	expect(references.find((ref: any) => ref.issue === '1')).toBeUndefined();
	expect(references.find((ref: any) => ref.issue === '2')).toEqual({
		action: null,
		issue: '2',
		owner: null,
		prefix: 'PREFIX-',
		raw: '#1 some subject PREFIX-2',
		repository: null
	});
});

test('uses permissive default regex without parser opts', async () => {
	const message = 'chore(component,demo): bump';
	const actual = await parse(message);

	expect(actual.scope).toBe('component,demo');
});

test('uses permissive default regex with other parser opts', async () => {
	const message = 'chore(component,demo): bump';
	const actual = await parse(message, undefined, {commentChar: '#'});

	expect(actual.scope).toBe('component,demo');
});

test('uses restrictive default regex in passed parser opts', async () => {
	const message = 'chore(component,demo): bump';
	const actual = await parse(message, undefined, {
		headerPattern: /^(\w*)(?:\(([a-z]*)\))?: (.*)$/
	});

	expect(actual.subject).toBeNull();
	expect(actual.scope).toBeNull();
});

test('works with chinese scope by default', async () => {
	const message = 'fix(面试评价): 测试';
	const actual = await parse(message, undefined, {commentChar: '#'});

	expect(actual.subject).not.toBeNull();
	expect(actual.scope).not.toBeNull();
});

test('does not work with chinese scopes with incompatible pattern', async () => {
	const message = 'fix(面试评价): 测试';
	const actual = await parse(message, undefined, {
		headerPattern: /^(\w*)(?:\(([a-z]*)\))?: (.*)$/
	});

	expect(actual.subject).toBeNull();
	expect(actual.scope).toBeNull();
});
