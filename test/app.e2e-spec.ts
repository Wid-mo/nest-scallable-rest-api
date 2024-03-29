import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'subham@gmail.com',
      password: 'Subham@123',
    };
    describe('Signup', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED);
      });
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if passport empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ passport: dto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if passport empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'assessToken')
          .inspect();
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(HttpStatus.OK);
      });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        email: 'subham1@gmail.com',
        firstName: 'Subhan',
        lastName: 'Maity',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });
    describe('Create bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: 'NestJS',
        link: 'https://nestjs.com/',
      };
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('BookmarkId', 'id')
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link);
      });
    });
    describe('Get bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{userAt}')
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'Kubernetes Course',
        description:
          'Containerize applications and app deployment to production',
      };
      it('should edit Bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(0);
      });
    });
  });
});
