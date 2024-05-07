import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { QueueNames, originCallback } from '@tutorify/shared';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './global-exception-filter';
import { CustomIoAdapter } from './notification-gateway/custom-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Enable CORS with specific domain patterns
  app.enableCors({
    credentials: true,
    methods: 'GET,PUT,POST,PATCH,DELETE,UPDATE,OPTIONS',
    origin: originCallback,
  });

  // Use the global exception filter
  app.useGlobalFilters(new GlobalExceptionsFilter());

  // Use helmet middleware for security headers
  app.use(helmet());

  // Set up global interceptor to standardize output using class serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new CustomIoAdapter(app));

  setUpSwagger(app);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI],
      queue: QueueNames.NOTOFICATION,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(configService.get<number>('PORT'));
}

bootstrap();

const setUpSwagger = (app: INestApplication<any>) => {
  // Configure Swagger options
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Tutorify Notification')
    .setDescription('List of endpoints to communicate with Tutorify notification system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Create Swagger document and set up Swagger UI
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/notifications/api', app, swaggerDocument);
};
