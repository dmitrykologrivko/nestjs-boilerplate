# NestJS Boilerplate

NestJS Boilerplate is an open-source high-level framework for [NestJS](https://github.com/nestjs/nest) applications.
It takes it up a notch by making it possible to solve repeatable tasks with less coding. It provides an architectural
model based on Domain Driven Design and contains a variety of extra tools for a quick start developing NestJS
applications. The NestJS Boilerplate aims to follow the principle of pluggable modules to extend functionality and
less repeating common code from project to project. Inspired by Spring Framework, AspNet Boilerplate and Django.

## Package description

Auth module provides a basis for application authentication based on `passport` and `@nestjs-boilerplate/user` modules.
It contains helpful services, guards, decorators, and REST API implementation of login/logout, changing/resetting passwords.

## Install

### First

Install [core package](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/core/docs/getting-started.md)
and [user package](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/user/README.md#install)

### Then

`$ npm install @nestjs-boilerplate/auth passport @nestjs/passport passport-jwt @nestjs/jwt --save`

## Overall

* [Controllers](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/auth/docs/controllers.md)
* [Decorators](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/auth/docs/decorators.md)
* [Guards](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/auth/docs/guards.md)
* [Services](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/auth/docs/services.md)

## Keep in touch

Dmitry Kologrivko - dmitrykologrivko@gmail.com

## License

[MIT LICENSE](./LICENSE)
