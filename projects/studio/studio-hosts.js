(function() {

jbDevLocalHost = ({baseDir,project}) => ({
//     localhost:8082/project/hello-world?studio =>  localhost:8082/project/studio/hello-world
    save(fn, content) {},
    studioUrl(entryUrl) {}
})

jbUserLocalHost = ({baseDir,project}) => ({
//     localhost:8082/hello-world/hello-world.html?studio=localhost =>  localhost:8082/bin/studio/studio-localhost.html?entry=localhost:8082/hello-world/hello-world.html
//     localhost:8082/hello-world/hello-world.html?studio=jb-react@0.3.8 =>  //unpkg.com/jbart5-react@0.3.8/bin/studio/studio-cloud.html?entry=localhost:8082/hello-world/hello-world.html

    save(fn, content) {}
})

jsFiddler = ({baseDir,project}) => ({
//     fiddle.jshell.net/davidbyd/47m1e2tk/show/?studio =>  //unpkg.com/jbart5-react/bin/studio/studio-cloud.html?entry=//fiddle.jshell.net/davidbyd/47m1e2tk/show/

    save(fn, content) {}
})

gitHub = ({baseDir,project}) => ({
    save(fn, content) {}
})


jb.studio.hosts = {


    calcHost(entryUrl) {
        return {
            project: ''
        }
    }
}

})()