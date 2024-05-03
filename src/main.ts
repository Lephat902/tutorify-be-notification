import { ClassSerializerInterceptor, INestApplication, InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './global-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Enable CORS with specific domain patterns
  app.enableCors({
    allowedHeaders: ['content-type'],
    credentials: true,
    methods: 'GET,PUT,POST,PATCH,DELETE,UPDATE,OPTIONS',
    origin: (origin, callback) => {
      if (!origin || origin === "null") {
        // Allow requests with no origin (like mobile apps or curl requests)
        return callback(null, true);
      }
      // Define the regular expression pattern for the Vercel app domain
      const vercelPattern =
        /^https:\/\/tutorify-[a-zA-Z0-9-]+-caotrananhkhoa\.vercel\.app$/;
      // Define the regular expression pattern for localhost
      const localhostPattern = /^https?:\/\/localhost(?::\d+)?$/; // Match http://localhost[:port_number]
      // Define the regular expression pattern for tutorify.site subdomains
      const tutorifyPattern = /^https?:\/\/[a-zA-Z0-9-]+\.tutorify\.site$/;

      // Use RegExp.test() to match the patterns
      if (
        origin === 'https://tutorify-project.vercel.app' ||
        vercelPattern.test(origin) ||
        localhostPattern.test(origin) ||
        tutorifyPattern.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new InternalServerErrorException('Not allowed by CORS'));
      }
    },
  });

  // Use the global exception filter
  app.useGlobalFilters(new GlobalExceptionsFilter());

  // Set up global interceptor to standardize output using class serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  await setUpAsyncApi(app);

  await app.listen(configService.get<number>('PORT'));
}

bootstrap();

const setUpAsyncApi = async (app: INestApplication<any>) => {
  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Notification Service for Tutorify')
    .setDescription('Notification Service enabled by Nest.js + Websockets socket.io')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addSecurity('user-password', { type: 'userPassword' })
    .build();

  const asyncapiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup('socket-api', app, asyncapiDocument);
};