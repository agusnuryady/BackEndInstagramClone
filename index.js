const express = require('express')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
require('express-group-routes')
const app = express()
const {Base64} = require('js-base64')

app.use(bodyParser.json())

const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'instagram_db'
})

app.group("/api/v1", (router)=> {
    
    router.get('/users', (req, res)=> {
        connection.query('SELECT * FROM users', function (err, rows) {
            if (err) throw err
            res.send(rows)
        })
    })
    
    router.post('/users', (req, res) => {
        const email = req.body.email
        const password = req.body.password
        const decode = Base64.decode(password)
        
        connection.query(`SELECT * FROM users WHERE email='${email}' AND password='${decode}'`, function (err, rows) {
            
            if (rows==0) {
                res.send(404)
            } else {
                const id = rows[0].id
                const username = rows[0].username
                const profilImage= rows[0].profil_image
                const token = jwt.sign({email:email,id:id,username:username}, 'wkwkwk')
                res.send({id, username, profilImage, email, token})
            }
        })
    })
    
    router.post('/user', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id

        connection.query(`SELECT id,username,email,telpon,profil_image FROM users WHERE id='${id}'`, function (err, rows, field) {
            if (err) throw rows
            res.send(rows)
        })
    })


    router.post('/posts', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id
        const username = decode.username
        const urlInput = req.body.urlInput
        const watchInput = req.body.watchInput
        const commentInput = req.body.commentInput
        const postDate = req.body.postDate

        connection.query(`INSERT INTO posts (id_user, username, image_link, watch, comment_post, post_date) values ("${id}", "${username}", "${urlInput}", "${watchInput}", "${commentInput}", "${postDate}")`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
    })

    router.post('/post', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        //const id_user = req.body.id_user
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id
        //console.log(id)

        connection.query(`SELECT * FROM posts WHERE id_user='${id}'`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
        
    })

    router.post('/dataPost', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        const idPost = req.body.idPost

        connection.query(`SELECT * FROM posts WHERE id='${idPost}'`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
        
    })

    router.patch('/post/update/:id', expressJwt({secret: 'wkwkwk'}), (req, res)=> {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id
        const idPost = req.params.id
        const username = decode.username
        const urlInput = req.body.urlInput
        const watchInput = req.body.watchInput
        const commentInput = req.body.commentInput
        const postDate = req.body.postDate

        connection.query(`UPDATE posts SET image_link='${urlInput}', watch='${watchInput}', comment_post='${commentInput}', post_date='${postDate}' WHERE id='${idPost}'`, function (err, rows, field) {
            if (err) throw err

            res.send(rows)
        }) 
    })

    router.delete('/post/:id', expressJwt({secret: 'wkwkwk'}), (req, res)=> {
        const id = req.params.id

        connection.query(`DELETE FROM posts WHERE id='${id}'`, function (err, rows, field) {
            if (err) throw rows

            res.send(rows)
        })
    })

    router.post('/story', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        //const id_user = req.body.id_user
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id
        //console.log(id)

        connection.query(`SELECT * FROM storys WHERE id_user='${id}'`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
        
    })

    // router.post('/posts', expressJwt({secret: 'wkwkwk'}), (req, res) => {
    //     connection.query(`SELECT * FROM posts`, function (err, rows) {
    //         if (err) throw err

    //         res.send(rows)
    //     })
    // })

    router.get('/todos', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        connection.query('SELECT * FROM todos', function (err, rows) {
            if (err) throw err
            
            res.send(rows)
        })
    })

    router.post('/todo', (req, res)=> {
        
        const title = req.body.title
        const is_done = false

        connection.query(`INSERT INTO todos (title, is_done) values ("${title}", ${is_done})`, function (err, rows, field){
            if (err) throw err
    
            res.send(rows)
        })

    })

    router.patch('/todo/:id', (req, res)=> {
        const id = req.params.id
        const title = req.body.title
        const isDone = req.body.isDone

        connection.query(`UPDATE todos SET title='${title}' WHERE id='${id}' `, function (err, rows, field) {
            if (err) throw err

            res.send(rows)
        }) 

        // todos[id-1].id = id
        // todos[id-1].title = title
        // todos[id-1].isDone = isDone

    })

    router.delete('/todo/:id', (req, res)=> {
        const id = req.params.id

        connection.query(`DELETE FROM todos WHERE id='${id}'`, function (err, rows, field) {
            if (err) throw rows

            res.send(rows)
        })
    })

})

app.group("/api/v2", (router) => {
    router.get('/todos', (req, res)=> {
        res.send({
            data: todos
        })
    })
})


app.listen('5000', ()=> console.log("App Running"))
