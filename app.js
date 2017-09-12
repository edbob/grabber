var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    request = require('request'),
    cheerio = require('cheerio'),
    hbs = require('hbs'),
    app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.use(favicon(path.join(__dirname, 'dist/img', 'favicon.ico')));
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function (req, res) {
    var c = req.cookies.num;
    res.render('index', { title: 'Grabber', num: c != undefined ? c : 5 })
});

app.post('/ajax', function (req, res) {
    res.cookie('num', req.body.num);
    getContent({ 'url': req.body.url, 'count': req.body.num }, function (data) {
        res.json(data);
    });
})

function getContent(req, collback) {
    request.get(req.url, function (error, response, html) {
        var data = [];
        if (error || response.statusCode != 200) {
            collback({ 'status': 'error' });
        } else {
            var $ = cheerio.load(html);
            var dom = $('.layout .layout__row .content_left .posts_list .post')
            dom.each(function (i, element) {
                if (i > req.count - 1) {
                    return;
                }
                var _title = $(this).find('.post__title > a');
                var content = $(this).find('.post__text-html');
                var _url = $(this).find('.post__body > a');
                var _urlTxt = $(this).find('.post__body > a');
                data.push({ title: _title.text(), content: content.text(), moreTxt: _urlTxt.text(), more: _url.attr("href")});
            });
            collback({ 'status': 'success', 'data': data });
        };
    });
};

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(3000);
console.log('Express listening on port 3000');
module.exports = app;