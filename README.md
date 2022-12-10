# NestJS Boilerplate

[![Codeship Status for dmitrykologrivko/nestjs-boilerplate](https://app.codeship.com/projects/40abacbd-b74b-4db2-994c-d272a33533eb/status?branch=master)](https://app.codeship.com/projects/450405)

NestJS Boilerplate is an open-source high-level framework for [NestJS](https://github.com/nestjs/nest) applications.
It takes it up a notch by making it possible to solve repeatable tasks with less coding. It provides an architectural 
model based on Domain Driven Design and contains a variety of extra tools for a quick start developing NestJS
applications. The NestJS Boilerplate aims to follow the principle of pluggable modules to extend functionality and
less repeating common code from project to project. Inspired by Spring Framework, AspNet Boilerplate and Django.

## Getting started

The main part of the NestJS Boilerplate is the core package.\
Check out the core package [README](/packages/core/README.md) to getting started.

## Packages

* [Core](/packages/core/README.md) is the main module of NestJS Boilerplate. Provides a framework with main tools.
* [User](/packages/user/README.md) module provides an implementation of User, Permission and Group entities, 
and additional tools for working with them.
* [Auth](/packages/auth/README.md) module provides a basis for application authentication of NestJS Boilerplate 
applications.
* [Testing](/packages/testing/README.md) module provides helpful tools for unit and e2e tests of NestJS Boilerplate
  applications.
* [Auth Testing](/packages/auth-testing/README.md) module provides helpful tools for unit and e2e tests of
  NestJS Boilerplate applications using authentication system.

## Example

Check out a simple [example](/packages/example).

## Changelog

Check out [changelog](CHANGELOG.md)

## Keep in touch

Dmitry Kologrivko - dmitrykologrivko@gmail.com

## License

[MIT LICENSE](./LICENSE)
