const Ajv = require('ajv')
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
const betterAjvErrors = require('better-ajv-errors').default
const schema = {
	type: 'object',
	properties: {
		foo: { type: 'integer' },
		bar: { type: 'string' },
	},
	required: ['foo'],
	additionalProperties: false,
}

const validate = ajv.compile(schema)

const data = {
	// foo: 1,
	foo: 'a',
	bar: 'abc',
}

const valid = validate(data)
if (!valid) {
	const output = betterAjvErrors(schema, data, validate.errors)

	console.log(output)
	throw new Error()
} else console.log('validation ok')
