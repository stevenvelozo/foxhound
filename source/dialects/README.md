# The Anatomy of a Dialect
--
Dialects are simple objects that can translate query parameters objects into a
string representation of a query for a data store.  Sometimes other state is
associated with the query, for instance when a SQL statement has Parameters to 
be sent with a parameterized query.

Without the below functions, a Dialect will cause errors.

## Create
Creates a new record.

## Push
Pushes multiple records.

## Read
Reads a record.

## Fetch
Reads a list of multiple records.

## Count
Counts how many rows are in the current expression.

## Update
Updates an existing row.

## Delete
Deletes a row or row(s).