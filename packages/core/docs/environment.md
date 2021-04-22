# Environment

In the real-world scenario, an application can be run in different environments. Usually, in the NodeJS applications 
you can set and check current environment in NODE_ENV environment variable. NestJS Boilerplate contains build-in 
functions to check in runtime what is the current environment.

`isProductionEnvironment` function will return true if `process.env.NODE_ENV` equals **production**.\
`isDevelopmentEnvironment` function will return true if `process.env.NODE_ENV` is undefined or equals **development**.\
`isTestEnvironment` function will return true if `process.env.NODE_ENV` equals **test**.