import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS — permite frontend Nuxt
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  // Prefixo global da API
  app.setGlobalPrefix('api')

  // Swagger — documentação automática
  const config = new DocumentBuilder()
    .setTitle('Presteza Contábil API')
    .setDescription('API do sistema contábil Presteza')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 API rodando em http://localhost:${port}`)
  console.log(`📄 Swagger: http://localhost:${port}/api/docs`)
}

bootstrap()
