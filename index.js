const express = require("express");
const mongoose = require("mongoose");
const Note = require("./models/Note")
const cookieSession = require("cookie-session")
const md = require("marked");
const app = express();

mongoose.connect("mongodb://localhost:27017/Notes", { useNewUrlParser: true});



/*const logger = (req, res, next) => {
    console.log("Nueva petición http");
    next();
};*/

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
    secret: "una_cadena_secreta",
    maxAge: 24 * 60 * 60 * 1000
}));
app.use("/assets", express.static("assets"));
/*app.use(logger);*/

// muestra la lista de notas
app.get('/', async (req, res) => {
   const notes = await Note.find();
    res.render("index", { notes });
});

// muestra el formulario para crear una nota
app.get("/notes/new", async (req, res) => {
    const notes = await Note.find();
    res.render("new", { notes });
});

// permite crear una nota
app.post("/notes", async (req, res, next) => {
    const data = {
        title: req.body.title,
        body: req.body.body
    };

    try {
        const note = new Note(data);
        await note.save();
    } catch(err) {
      return next (err);
    }

    res.redirect("/");
});

/*app.get("/users/:name", (req, res) => {
    const name = req.params.name;
    res.send(`<h1>Hola ${name}</h1>`);
});

app.post("/users", (req, res) => {
    res.status(404);
    res.set("X-api-Version", "1.0");
    res.send("no se encontró la ruta");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Algo salio mal");
});*/

// muestra una nota

app.get("/notes/:id", async (req, res) => {
    const notes = await Note.find({ user: res.locals.user });
    const note = await Note.findById(req.params.id);
    res.render("show", { notes: notes, currentNote: note, md: md });
  });

//muestra el formulario para editar

app.get("/notes/:id/edit", async (req, res, next) => {
    try {
        const notes = await Note.find();
        const note = await Note.findById(req.params.id);

        res.render("edit", { notes: notes, currentNote: note});
    } catch (err) {
        return next (err);
    }
    
});


// Actualiza una nota  
app.patch("/notes/:id", async  (req, res, next) => {
    const id = req.params.id;
    const note = await Note.findById(id);
    
    note.title = req.body.title;
    note.body = req.body.body

    try {
        await note.save({});
        res.status(204).send({});
    } catch(err) {
        return next(err);
    }

    
});

app.delete("/notes/:id", async (req, res, next) => {
    try {
        await Note.deleteOne({ _id: req.params.id});
        res.status(204).send({});
    } catch (err) {
        return next(err);
    }
});

app.listen(3000, () => console.log("Listening on port 3000"));
