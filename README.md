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
