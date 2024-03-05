const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch((error) => {
		console.log('error connecting to MongoDB:', error.message)
	})

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		required: true
	},
	number: {
		type: String,
		minlength: 8,
		validate: {
			validator: v => {
				return /^\d{2,3}-\d+$/.test(v)
			},
			message: 'Phone number needs to be in form: DD-DDDDDDD or DDD-DDDDDD'
		},
		required: true
	}
})

personSchema.set('toJSON', {
	transform: (document, retunedObject) => {
		retunedObject.id = retunedObject._id.toString()
		delete retunedObject._id
		delete retunedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)