// gulp4 API
// - gulp.task() –定义任务
// - gulp.parallel -并行执行
// - gulp.series -按顺序执行
// - gulp.src() –全局匹配一个或多个文件
// - gulp.dest() –将文件写入目录
// - gulp.symlink() –与dest相似，但是使用软连接形式
// - gulp.lastRun() –获得上次成功运行的时间戳
// - gulp.watch() –当文件发生变化时做某些操作
// - gulp.tree() –获得任务树
// - gulp.registry() –获得或注册任务

const Path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const del = require('del')
const babel = require('gulp-babel')
const imagemin = require('gulp-imagemin')
const minifycss = require('gulp-minify-css')
const uglify = require('gulp-uglify')
const gutil = require('gulp-util')
const inquirer = require('inquirer')
const gulpif = require('gulp-if')
// const postcss = require('gulp-postcss')
// const pxtorpx = require('postcss-px2rpx') //  pipe(postcss([pxtorpx()])) px转化成rpx

const appPath = './app/**'
const distPath = './dist/'
const sassFiles = [`${appPath}/*.scss`,`!${appPath}/_template/**`]
const jsFiles = [`${appPath}/*.js`, `!${appPath}/_template/**`]
const imageFiles = [`${appPath}/*.{png,jpg,gif,svg}`, `!${appPath}/_template/**`]
const basicFiles = [
  `${appPath}/*.json`,
  `${appPath}/*.md`,
  `${appPath}/*.wxs`,
  `${appPath}/*.wxml`,
  `${appPath}/*.wxss`,
  `!${appPath}/_template/**`
]

/* 清除dist目录 */
gulp.task('clean', () => {
  return del(['./dist/**'])
})

// 拷贝基础文件
gulp.task('basic', () => {
  return gulp.src(basicFiles)
    .pipe(gulp.dest(distPath))
})

// 编译sass
gulp.task("sass", () => {
  return gulp.src(sassFiles,{"base": ''})
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(rename({
      extname: ".wxss"
    }))
    .pipe(gulp.dest(distPath))
})
gulp.task('sassPro', () => {
  return gulp.src(sassFiles,{"base": ''})
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(minifycss()) // 压缩 css文件
    .pipe(rename({
      extname: ".wxss"
    }))
    .pipe(gulp.dest(distPath))
})

// 编译图片
gulp.task('image', () => {
  return gulp.src(imageFiles)
    .pipe(gulp.dest(distPath))
})
gulp.task('imagePro', () => {
  return gulp.src(imageFiles)
    .pipe(imagemin())
    .pipe(gulp.dest(distPath))
})

// 编译js
gulp.task('js', () => {
  return gulp.src(jsFiles)
    .pipe(babel())
    .pipe(gulp.dest(distPath))
})
gulp.task('jsPro', () => {
  return gulp.src(jsFiles)
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest(distPath))
})

// 设置当前环境 dev or production
function set_env(type){
    let env = type || 'dev';
    // 生成env.js文件，用于开发页面时，判断环境
    fs.writeFile(type === 'production' ? "./dist/env.js":"./app/env.js", `module.exports ='${env}';`, function(err){
        err && console.log(err);
    });
}

// dev
gulp.task('dev', gulp.series('clean', gulp.parallel('basic', 'sass', 'js', 'imagePro'),
    (done) => {
        set_env('dev')
        done()
    }
))

gulp.task('watch',() => {
  w(basicFiles, "basic")
  w(jsFiles, "js")
  w(imageFiles, "image")
  const watcherScss = gulp.watch(sassFiles,  gulp.parallel("sass"))
  watcherScss.on('unlink', function(event) { // 监听源文件删除事件， 并删除对应文件
    const extname = Path.extname(event)
    const distFilePath = event.replace('app/', 'dist/').replace(extname, '.wxss')
    del(Path.join(__dirname, './', distFilePath))
  })

  function w(path, task) {
    const watcher = gulp.watch(path, gulp.parallel(task))
    watcher.on('all', function(event, path, stats) {
      if( event === 'unlink'){
        const distFilePath = path.replace('app/', 'dist/');
        del(Path.join(__dirname, './', distFilePath))
      }
    });
    return watcher
  }
});

//build
gulp.task('build', gulp.series('clean', gulp.parallel('basic', 'sassPro', 'jsPro', 'imagePro'),
    (done) => {
        set_env('production')
        done()
    }
))


//自动生成page或component文件
const templatePath = `${appPath}/_template`
gulp.task('auto', done => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'fileType',
      message: 'Select file type',
      choices: ['page', 'component'],
      default: 'page'
    },
    {
      type: 'input',
      name: 'fileName',
      message: 'Input the file name',
      default: 'index'
    },
    {
      type: 'input',
      name: 'componentPath',
      message: 'Input the component path (eg: pages/component)',
      when: function(answers) { // 当fileType为component的时候才会提问
        return answers.fileType === 'component'
      },
      default: 'pages/component'
    },
    {
      type: 'list',
      name: 'styleType',
      message: 'Select a style framework',
      choices: ['scss'],
      default: 'scss'
    }
  ])
    .then(options => {
      const {fileType, fileName, componentPath} = options
      gulp.src(`${templatePath}/${fileType}/*`)
        .pipe(gulpif(fileType === 'page',
          rename({
            dirname: `pages/${fileName}`,
            basename: fileName
          }),
          rename({
            dirname: `${componentPath}/${fileName}`,
            basename: fileName
          })
        ))
        .pipe(gulp.dest('./app'))
      if(fileType === 'page') writePageToJson(`pages/${fileName}/${fileName}`)
      done()
    })
    .catch(err => {
      gutil.log('task auto Error!', err)
      done()
    })
})
// 将page写入app.json
const writePageToJson = (fileName) => {
  const filename = Path.resolve(__dirname, 'app/app.json')
  const content = JSON.parse(fs.readFileSync(filename, 'utf8'))
  content.pages.push(fileName)
  fs.writeFileSync(filename, JSON.stringify(content,"","\t"))
}


