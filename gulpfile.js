const { rmSync, readFileSync } = require('fs');
const { src, dest } = require('gulp');
const pug = require('gulp-pug');
const stylus = require('stylus');
const replace = require('gulp-replace');
const marked = require('marked');
const cleanCSS = require('clean-css');

const path = {
  'dist': './dist',
};

function clean() {
  if (path && path.dist) {
    try {
      rmSync(path.dist, { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }
  }
}

function linkedData() {
  return JSON.stringify({
    "@context": "http://schema.org",
    "@type": "Person",
    email: "ehlo@doubleui.com",
    jobTitle: "Software engineer",
    name: "Dmitriy Nazarov",
    gender: "male",
    url: "https://doubleui.com",
    sameAs: [
      "https://linkedin.com/in/dmitriy-nazarov-2b837119a",
      "https://github.com/doubleui",
      "https://stackoverflow.com/users/2243372/doubleui",
      "https://www.codewars.com/users/doubleui",
      "https://doubleui.github.io/"
    ]
  });
}

marked.setOptions({
  headerIds: false,
});

exports.default = function() {
  clean();

  return src([
      'assets/favicon.ico',
      'assets/favicon.png',
      'assets/humans.txt',
      'assets/robots.txt',
      '.nojekyll',
    ])
    .pipe(dest(path.dist))
    .pipe(src([
      'assets/index.pug',
    ]).pipe(pug({
      "data": {
        "linkedData": linkedData(),
      },
      "filters": {
        'stylus': function (styles) {
          return new cleanCSS().minify(
            stylus.render(styles)
          ).styles;
        }
      }
    })))
    .pipe(replace(/<!-- include:([A-Za-z0-9]+\.md) -->/g, function(match, filename, offset) {
      try {
        return marked(
          readFileSync('./'+filename, 'utf8')
        );
      } catch (err) {}

      return '';
    }))
    .pipe(dest(path.dist))
}