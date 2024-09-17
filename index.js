const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route showing list of files
app.get('/', function (req, res) {
    fs.readdir('./files', function (err, files) {
        if (err) {
            return res.status(500).send("Error reading directory");
        }
        res.render("index", { files: files });
    });
});

// Show file content
app.get('/file/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
        if (err) {
            return res.status(404).send("File not found");
        }
        res.render('show', { filename: req.params.filename, filedata: filedata });
    });
});

// Render edit page with the existing filename
app.get('/edit/:filename', function (req, res) {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
        if (err) {
            return res.status(404).send("File not found");
        }
        res.render('edit', { filename: req.params.filename, filedata: filedata });
    });
});

// Handle file renaming and editing
app.post('/edit/:filename', function (req, res) {
    const previousFilename = req.params.filename;
    const newFilename = req.body.new.split(' ').join('') + '.txt';
    const newFilePath = `./files/${newFilename}`;
    const oldFilePath = `./files/${previousFilename}`;
    
    // Rename the file
    fs.rename(oldFilePath, newFilePath, function (err) {
        if (err) {
            return res.status(500).send("Error renaming file");
        }
        // Optionally, update the file content if needed (edit filedata)
        fs.writeFile(newFilePath, req.body.filedata, function (err) {
            if (err) {
                return res.status(500).send("Error updating file content");
            }
            res.redirect('/');
        });
    });
});

// Create new file
app.post('/create', function (req, res) {
    const fileName = req.body.title.split(' ').join('') + '.txt';
    fs.writeFile(`./files/${fileName}`, req.body.details, function (err) {
        if (err) {
            return res.status(500).send("Error creating file");
        }
        res.redirect('/');
    });
});

// Handle file deletion
app.post('/delete/:filename', function (req, res) {
    const filePath = `./files/${req.params.filename}`;
    
    // Delete the file
    fs.unlink(filePath, function (err) {
        if (err) {
            return res.status(500).send("Error deleting file");
        }
        res.redirect('/');
    });
});


// Start the server
app.listen(3000, function () {
    console.log('Server running on port 3000');
});
