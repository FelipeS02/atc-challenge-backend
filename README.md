## Intro
Bienvenidos al README del proyecto.

En base a la solicitud de optimización del aplicativo, decidí utilizar tecnologías que permitan manejar correctamente las limitadas consultas que se pueden realizar con el API Mock.

A continuación, procederé a dar los motivos por los cuales decidí implementar herramientas que me brindaron lograr, desde una primer instancia, el correcto uso del aplicativo, mejorando significativamente el tiempo de respuesta, el cual antes era un problema por su alta latencia.

**Bull - Administrar colas**: Luego de investigar sobre las colas de trabajo, decidí implementarlas con la tecnología Bull y evitar la saturación del sistema cuando el API Mock se colapsaba y no respondía correctamente.

**Redis - Administrar caché**: Elegí Redis para la administración del caché, proque provee un servicio de caché rápido y eficiente, reduciendo así la alta latencia que sufría el Microservicio, al almacenar respuestas frecuentes y simplemente consultarlas. Esto permitió que aumente la velocidad de las respuestas, la consistencia del Microservicio, y reduciendo la cantidad de peticiones (limitadas por X tiempo) del API Mock.


## Documentación
Debajo, tendrán la documentación consultada para realizar la solución planteada, y las tecnologías que se decidieron utilizar.

## NestJS

- [NestJS Doc](https://docs.nestjs.com/providers#services)
- [NestJS GitHub](https://github.com/nestjs/nest)
- [NestJS Medium - Module/Services](https://medium.com/@prajapatijinesh3/nestjs-module-services-860e12689c1b)

## Bull (Queue administrator)

- [Bull Doc](https://docs.nestjs.com/techniques/queues)
- [Bull - Queuing Jobs](https://dev.to/railsstudent/queuing-jobs-in-nestjs-using-nestjsbullmq-package-55c1)

## Redis (Cache managment & job queue/enqueue implementation)

- [Redis Doc](https://docs.nestjs.com/microservices/redis)
- [Redis - Using Redis Client in NestJS](https://medium.com/@akintobiidris/using-redis-client-in-nestjs-3fe80eb91a49)

## Hexagonal Architecture (NestJs oriented)

- [Guide - Step 1](https://nullpointer-excelsior.github.io/posts/implementando-hexagonal-con-nestjs-part1/)
- [Guide - Step 2](https://nullpointer-excelsior.github.io/posts/implementando-hexagonal-con-nestjs-part2/)
