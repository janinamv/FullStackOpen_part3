require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())

morgan.token('body', req => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))


app.get('/info', (request, response) => {
    Person.countDocuments().then(p => {
        response.send(`<p>Phonebook has info for ${p} people</p>
                        <p>${new Date()}</p>`)
    })    
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(p => {
        response.json(p)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(p => {
            if (p) {
                response.json(p)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))

    
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            if (result) {
                response.status(204).end()
            } else {
                response.status(404).end()
            }
            
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    
    if (body.name === undefined) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (body.number === undefined) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
    
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const new_info = {
        name: body.name,
        number: body.number
    }
    
    Person.findByIdAndUpdate(request.params.id, new_info, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})