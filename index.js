const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const multer = require('multer');
const path = require('path');
const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('عميل متصل');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
// التحقق من وجود ملف JSON
let data = { crad: [] }; // بيانات افتراضية
const dataFilePath = 'public/data.json';


if (fs.existsSync(dataFilePath)) {
    // إذا وجد الملف JSON، قم بقراءة البيانات منه
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    data = JSON.parse(jsonData);
} else {
    // إذا لم يجد الملف JSON، قم بإنشاء ملف JSON جديد
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// تكوين الجلسة
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set it to "true" when using HTTPS
        maxAge: 3600000
    }
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Root route ("/") to send the "home.html" file
app.get('/', (req, res) => {
    const homeFilePath = path.join(__dirname, 'public', 'home.html');
    res.sendFile(homeFilePath);
});

// Login route ("/login") to send the "login.html" file
app.get('/login', (req, res) => {
    const loginFilePath = path.join(__dirname, 'public', 'login.html');
    res.sendFile(loginFilePath);
});

// Handle login POST request
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Perform your login validation here (replace the example)
    if (username === 'admin1' && password === '0625') {
        req.session.loggedin = true;
        res.redirect('/admin');
    } else {
        res.send('فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.');
    }
});app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set it to "true" when using HTTPS
        maxAge: 3600000
    }
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Root route ("/") to send the "home.html" file
app.get('/', (req, res) => {
    const homeFilePath = path.join(__dirname, 'public', 'home.html');
    res.sendFile(homeFilePath);
});

// Login route ("/login") to send the "login.html" file
app.get('/login', (req, res) => {
    const loginFilePath = path.join(__dirname, 'public', 'login.html');
    res.sendFile(loginFilePath);
});

// Handle login POST request
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Perform your login validation here (replace the example)
    if (username === 'admin1' && password === '0625') {
        req.session.loggedin = true;
        res.redirect('/admin');
    } else {
        res.send('فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.');
    }
});


// محاولة تسجيل الدخول

// صفحة الإدارة
app.get('/admin', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__dirname + '/public/admin.html');
    } else {
        res.redirect('/login');
    }
});

// استخدام body-parser للتعامل مع JSON
app.use(bodyParser.json());

// تحديث ملف JSON بناءً على البيانات المرسلة من الإدارة

  app.get('/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data.json');
        }

        res.json(JSON.parse(data));
    });
});
app.post('/update-data', (req, res) => {
    const newData = req.body;

    fs.readFile(dataFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('حدث خطأ أثناء قراءة الملف JSON:', err);
            return res.status(500).json({ error: 'حدث خطأ أثناء قراءة الملف JSON' });
        }

        const jsonData = JSON.parse(data);
        jsonData.crad.push(newData); // إضافة معلومات المدينة إلى المصفوفة

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('حدث خطأ أثناء كتابة الملف JSON:', err);
                return res.status(500).json({ error: 'حدث خطأ أثناء كتابة الملف JSON' });
            }

            res.json({ success: true });
        });
    });
});
// مسار لتحديث البيانات في الملف JSON
app.post('/update', (req, res) => {
    const updatedCrade = req.body;
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data.json');
        }

        const jsonData = JSON.parse(data);

        // البحث عن المدينة بالاسم وتحديثها
        const updatedCities = jsonData.crad.map(crade => {
            if (crade.name === updatedCrade.name) {
                return updatedCrade;
            }
            return crade;
        });

        jsonData.crad = updatedCities;

        // كتابة البيانات المحدثة إلى الملف JSON
        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing data.json');
            }
            res.json({ message: 'Data updated successfully!' });
        });
    });
});
// ...

// upload image 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'img'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const imageFilter = function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG images are allowed.'));
    }
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

app.post('/profile', upload.single('avatar'), (req, res) => {
    try {
        const filename = req.file.originalname;
        res.status(200).json({ filename });
    } catch (error) {
        console.error('حدث خطأ أثناء معالجة الصورة: ', error);
        res.status(500).json({ err: error });
    }
});
  /// show image for page html 
  app.get('/images', (req, res) => {
    const imgFolderPath = path.join(__dirname, 'public/img'); // استبدل 'img' بالمجلد الذي يحتوي على الصور

    fs.readdir(imgFolderPath, (err, files) => {
        if (err) {
            console.error('حدث خطأ في قراءة مجلد الصور: ', err);
            return res.status(500).send('حدث خطأ في الخادم');
        }

        const images = [];

        files.forEach(fileName => {
            // تحقق من أن الملف هو ملف صورة (يمكنك توسيع هذه الشروط حسب احتياجاتك)
            if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
                images.push({
                    name: fileName,
                    src: `img/${fileName}`, // استبدل 'img/' بالمجلد الذي يحتوي على الصور
                });
            }
        });

        res.json(images);
    });
});
/// remove img 
app.post('/api/delete-image', (req, res) => {
    const imageName = req.body.imageName;

    // تحقق من وجود الصورة قبل حذفها
    const imagePath = path.join(__dirname, '/public/img', imageName);

    if (fs.existsSync(imagePath)) {
        // حذف الصورة إذا كانت موجودة
        fs.unlinkSync(imagePath);

        // إرسال استجابة بنجاح
        res.json({ success: true, message: 'تم حذف الصورة بنجاح' });
    } else {
        // إرسال استجابة بخطأ إذا لم تكن الصورة موجودة
        res.status(404).json({ success: false, message: 'الصورة غير موجودة' });
    }
});
// تسجيل الخروج
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// قم بتشغيل الخادم
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

