module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/bootstrap/dist/bootstrap.js',
                    'bower_components/angular/angular.js',
                    'src/js/*.js'
                ],
                dest: 'dist/assets/js/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/assets/js/<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
        },
        less: {
            development: {
                options: {
                    paths: [
                        'bower_components/bootstrap/less',
                        'src/less'
                    ]
                },
                files: {
                    'dist/assets/css/wakery.css': 'src/less/wakery.less'
                }
            },
            production: {
                options: {
                    paths: [
                        'bower_components/bootstrap/less',
                        'src/less'
                    ],
                    cleancss: true
                },
                files: {
                    'dist/assets/css/wakery.min.css': 'src/less/wakery.less'
                }
            }
        },
        jade: {
            compile: {
                options: {
                    data: {
                        debug: false
                    }
                },
                files: {
                    'dist/index.html': ['src/jade/index.jade']
                }
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, src: ['src/meta/*'], dest: 'dist/', filter: 'isFile', flatten: true }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', [
        'jshint', 'concat', 'uglify', 'less', 'jade', 'copy'
    ]);

};
