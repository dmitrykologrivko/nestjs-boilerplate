# Architectural principles

Application architecture is a very important aspect of system design. The choice of application architecture directly 
depends on the task at hand and the complexity of the project but it is always good practice to separate domain logic 
from presentation.

NestJS Boilerplate provides an architectural model based on Domain Driven Design (DDD). DDD initially introduced and 
made popular by programmer Eric Evans in his 2004 book, Domain-Driven Design: Tackling Complexity in the Heart of Software.
In short: DDD focus on domain and domain logic. It defines domain models, boundaries within which a particular model is 
defined and applicable, also helps to establish communication between the development team and the business using 
a language structured around the domain model. The following building blocks are usually distinguished: Entity,
Value Object, Domain Event, Aggregate, Service, Repositories, Factories.

There are different approaches to the implementation of Domain Driven Design and also some other individual 
implementation issues that need to be addressed in your project. (It is better to deep into DDD by reading more 
articles about this before starting developing the project) NestJS Boilerplate does not impose a specific 
implementation, but only contains the basic building blocks. You are free to choose the implementation approach that 
is closer to your project. Moreover, *you can easily implement any other architecture* (not only DDD) using the basic 
features of the framework. The main thing is to try to adhere to the principle separating domain logic from presentation.
