# FoxHound

The FoxHound javascript query generator, for node.js and the browser.


### Getting Started

    $ npm install foxhound --save

Then...

    var foxhound = require('foxhound');
    var my_awesome_query = foxhound.scope('Users').cap(20).generate().query.body;
    console.log(my_awesome_query);

The default query dialect is english, so, node should output:

    Please give me 20 of your Users.  Thank you!

This is not very useful for anything other than testing, so, we might want to change the dialect and try again:

    var foxhound = require('foxhound');
    var my_awesome_query = foxhound.scope('Users').cap(20).setDialect('MySQL').generate().query.body;
    console.log(my_awesome_query);

Which now will output:

    SELECT * FROM Users LIMIT 20;

### Testing

    $ npm test
    $ npm run coverage

### Docker Development Environment


1. Run this command to build this image:
```
docker build ./ -t retold/foxhound:local
```

2. Run this command to build the local container:
```
docker run -it --name foxhound-dev -p 127.0.0.1:12346:8080 -v "$PWD/.config:/home/coder/.config"  -v "$PWD:/home/coder/foxhound" -u "$(id -u):$(id -g)" -e "DOCKER_USER=$USER" retold/foxhound:local
```

3. Go to http://localhost:12346/ in a web browser

4. The password is "retold"

5. Right now you (may) need to delete the `node_modules` folders and regenerate it for Linux.