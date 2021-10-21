import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import { OpenApiSpec } from '@loopback/openapi-v3';
import {FBOSequence} from './fbo.sequence';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {AuthorizationComponent} from '@loopback/authorization';
import {BindingKeys} from './binding.keys';
import {BcryptHasher, JWTService, FBOUserService} from './services';
import { JWTAuthenticationStrategy } from './authentication-strategies/jwt-strategy';
import { SECURITY_SCHEME_SPEC, SECURITY_SPEC } from './utils/security-spec';

export {ApplicationConfig};

export class FiveByOneApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {

  constructor(options: ApplicationConfig = {}) {

    super(options);

    // Set up the custom sequence
    this.sequence(FBOSequence);
    // Customize @loopback/rest-explorer configuration here
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      info: {title: 'Five By One API Specifications',
        version: '1.0'},
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      servers: [ {url: '/api'} ],
      security: SECURITY_SPEC,
    };
    this.api(spec);
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/api-docs',
    });
    this.component(RestExplorerComponent);

    this.add(createBindingFromClass(JWTAuthenticationStrategy));
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: [ 'controllers' ],
        extensions: [ '.controller.js' ],
        nested: true,
      },
    };

    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent);

    this.setUpBindings();

  }

  private setUpBindings(): void {

    if (!process.env.JWT_TOKEN_SECRET) {

      throw new Error('JWT_ACCESS_TOKEN is missing .env file.');

    }
    this.bind(BindingKeys.TOKEN_SECRET).to(
      process.env.JWT_TOKEN_SECRET,
    );

    const expiresIn = process.env.JWT_TOKEN_EXPIRES_IN ?? '3600';
    this.bind(BindingKeys.TOKEN_EXPIRES_IN).to(
      expiresIn,
    );

    this.bind(BindingKeys.TOKEN_SERVICE).toClass(JWTService);

    // // Bind bcrypt hash services
    const hasherRound = 10;
    this.bind(BindingKeys.ROUNDS).to(hasherRound);
    this.bind(BindingKeys.PASSWORD_HASHER).toClass(BcryptHasher);

    this.bind(BindingKeys.USER_SERVICE).toClass(FBOUserService);

  }

}
